/**
 * PM Agent — 오케스트레이터
 *
 * 파이프라인:
 *   1단계: Data Analyst + Domain Expert (병렬)
 *   2단계: Strategy Writer
 *   2.5단계: PM 사전 체크 (구조만 경량 검증)
 *   3단계: Chart Specialist
 *   4단계: PM 조립
 *   5단계: Sample Generator
 *   6단계: Persona Critic (타겟 페르소나 관점 검증 → high priority만 남김)
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude } from "@/lib/claude";
import { validatePattern } from "@/lib/layout-patterns";
import type {
  OrchestratorInput,
  OrchestratorResult,
  AgentBlueprint,
  DataAnalystOutput,
  DataAnalystSummary,
  DomainExpertOutput,
  StrategyWriterOutput,
  ChartSpecialistOutput,
  PersonaCriticOutput,
} from "./types";
import { runDataAnalyst } from "./data-analyst";
import { runDomainExpert } from "./domain-expert";
import { runStrategyWriter } from "./strategy-writer";
import { runChartSpecialist } from "./chart-specialist";
import { runSampleGenerator } from "./sample-generator";
import { runPersonaCritic } from "./persona-critic";
import { preprocessVoc, type VocRow } from "./voc-preprocessor";

/** 프롬프트 원본: src/agents/pm.md */
const PM_SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/pm.md"),
  "utf-8"
);

/* ═══ 유틸: DA 출력 → 요약 (토큰 절약) ═══ */

function summarizeDA(da: DataAnalystOutput): DataAnalystSummary {
  // DA 출력에 선택적 필드가 있을 수 있으므로 unknown으로 접근
  const daAny = da as unknown as Record<string, unknown>;

  const summary: DataAnalystSummary = {
    methodology: da.methodology,
    keyMetricNames: da.keyMetrics.map((m) => m.name),
    segmentNames: (da.segments ?? []).map((s) => s.name),
    dataFlags: da.dataFlags,
  };
  // VoC 토픽이 있으면 이름만
  if (daAny.vocAnalysis) {
    const voc = daAny.vocAnalysis as Record<string, unknown>;
    if (Array.isArray(voc.topics)) {
      summary.topicNames = (voc.topics as Array<{ name: string }>).map((t) => t.name);
    }
  }
  // NPS 점수만
  if (daAny.npsBreakdown) {
    const nps = daAny.npsBreakdown as Record<string, unknown>;
    if (typeof nps.score === "number") {
      summary.npsScore = nps.score;
    }
  }
  return summary;
}

/* ═══ 유틸: Domain Expert → 벤치마크 요약 (토큰 절약) ═══ */

function summarizeDE(de: DomainExpertOutput): { benchmarks: string[]; keyDecision: string } {
  return {
    benchmarks: de.benchmarks.map((b) => `${b.metric}: ${b.value}`),
    keyDecision: de.decisionFrame.keyDecision,
  };
}

/* ═══ 유틸: Strategy Writer → 조립용 요약 ═══ */

function summarizeSW(sw: StrategyWriterOutput): {
  storyLine: string;
  category: string;
  keyDecision: string;
  sections: Array<{ id: string; label: string; reason: string }>;
} {
  return {
    storyLine: sw.storyLine,
    category: sw.category,
    keyDecision: sw.keyDecision,
    sections: sw.sections.map((s) => ({ id: s.id, label: s.label, reason: s.reason })),
  };
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/* ═══ 2.5단계: PM 사전 체크 (경량 — 시스템 프롬프트 없이 인라인 검증) ═══ */

async function preCheck(
  input: OrchestratorInput,
  strategy: StrategyWriterOutput
): Promise<{ passed: boolean; feedback?: string }> {
  const sectionSummary = strategy.sections.map((s) => s.id + ": " + s.label).join("\n");
  const prompt = `너는 리포트 구조 검증자야. 아래 3가지만 확인하고 JSON으로 답해.

1. 섹션 수가 분량(${input.volume ?? "standard"}: compact=3-4, standard=6-8, detailed=8-12)에 맞는가?
2. 독자(${input.audience ?? "실무자"})가 먼저 보는 항목이 ES 바로 다음에 오는가?
3. 스토리가 논리적으로 이어지는가? (앞 섹션의 결론이 다음 섹션의 전제)

storyLine: ${strategy.storyLine}
category: ${strategy.category}
섹션:
${sectionSummary}

통과: { "passed": true }
실패: { "passed": false, "feedback": "구체적 수정 지시" }
JSON만 출력.`;

  const raw = await callClaude(prompt);
  return JSON.parse(raw);
}

/* ═══ 4단계: PM 조립 ═══ */

async function assembleAndValidate(
  input: OrchestratorInput,
  strategy: StrategyWriterOutput,
  chart: ChartSpecialistOutput
): Promise<AgentBlueprint> {
  // 병합에 필요한 최소 정보만 전달
  const swSummary = summarizeSW(strategy);
  const chartSections = chart.sections.map((s) => ({
    id: s.id,
    componentType: s.componentType,
    source: s.source,
    designNeeded: s.designNeeded,
  }));

  const prompt = `
에이전트: ${input.agentName}
설명: ${input.description}
분량: ${input.volume ?? "standard"}

Strategy Writer (섹션 구조):
${JSON.stringify(swSummary, null, 2)}

Chart Specialist (컴포넌트 매칭):
${JSON.stringify(chartSections, null, 2)}

Executive Summary:
${JSON.stringify(strategy.executiveSummary, null, 2)}

위 결과를 병합해서 최종 에이전트 구성안 JSON을 만들어줘.
Strategy Writer의 섹션 순서 + reason을 기반으로,
Chart Specialist의 componentType을 매칭해.
`;

  const raw = await callClaude(prompt, PM_SYSTEM_PROMPT);
  const assembled = JSON.parse(raw);

  const volume = input.volume ?? "standard";
  const violations = validatePattern(assembled.reportSections ?? [], volume);

  const blueprint: AgentBlueprint = {
    id: assembled.id ?? toKebabCase(input.agentName),
    name: assembled.name ?? input.agentName,
    description: assembled.description ?? input.description,
    category: assembled.category ?? strategy.category,
    inputType: assembled.inputType ?? "none",
    layout: assembled.layout ?? "single-section",
    modalType: assembled.modalType ?? "none",
    reportSections: assembled.reportSections ?? [],
    storyLine: assembled.storyLine ?? strategy.storyLine,
    keyDecision: assembled.keyDecision ?? strategy.keyDecision,
    validation: {
      passed: violations.length === 0,
      violations,
      qualityScore: Math.max(0, 100 - violations.length * 20),
    },
  };

  return blueprint;
}

/* ═══ 6단계: Persona Critic 결과 적용 ═══ */

function applyPersonaCritic(
  blueprint: AgentBlueprint,
  sampleReport: unknown,
  critic: PersonaCriticOutput
): { blueprint: AgentBlueprint; sampleReport: unknown } {
  const sections = [...blueprint.reportSections];
  const sampleSections = (sampleReport as { sections?: Array<{ id: string }> })?.sections ?? [];

  // low priority 섹션 제거 + critic이 명시적으로 remove한 섹션 제거
  const removeIds = new Set([
    ...critic.remove.map((r) => r.sectionId),
    ...critic.sections.filter((s) => s.priority === "low").map((s) => s.sectionId),
  ]);

  // ES는 절대 제거하지 않음
  removeIds.delete("executive-summary");

  const filteredSections = sections.filter((s) => !removeIds.has(s.id));
  const filteredSampleSections = sampleSections.filter((s) => !removeIds.has(s.id));

  // reorder 적용
  for (const move of critic.reorder) {
    const idx = filteredSections.findIndex((s) => s.id === move.sectionId);
    if (idx === -1) continue;

    const [section] = filteredSections.splice(idx, 1);
    const afterMatch = move.moveTo.match(/after:\s*(.+)/);
    if (afterMatch) {
      const targetIdx = filteredSections.findIndex((s) => s.id === afterMatch[1].trim());
      if (targetIdx !== -1) {
        filteredSections.splice(targetIdx + 1, 0, section);
      } else {
        filteredSections.push(section);
      }
    }

    // sample도 같은 순서로
    const sampleIdx = filteredSampleSections.findIndex((s) => s.id === move.sectionId);
    if (sampleIdx !== -1) {
      const [sampleSection] = filteredSampleSections.splice(sampleIdx, 1);
      const sTargetIdx = filteredSampleSections.findIndex((s) => s.id === afterMatch?.[1]?.trim());
      if (sTargetIdx !== -1) {
        filteredSampleSections.splice(sTargetIdx + 1, 0, sampleSection);
      } else {
        filteredSampleSections.push(sampleSection);
      }
    }
  }

  return {
    blueprint: {
      ...blueprint,
      reportSections: filteredSections,
      validation: {
        ...blueprint.validation,
        qualityScore: Math.min(100, blueprint.validation.qualityScore + 10),
      },
    },
    sampleReport: {
      ...(sampleReport as Record<string, unknown>),
      sections: filteredSampleSections,
    },
  };
}

/* ═══ 전체 파이프라인 ═══ */

export async function orchestrate(input: OrchestratorInput): Promise<OrchestratorResult> {
  // 0단계: VOC 원문 데이터가 있으면 코드 전처리 (LLM 호출 없음)
  let vocPreprocess = undefined;
  if (input.vocRawData && input.vocRawData.length > 0) {
    vocPreprocess = preprocessVoc(input.vocRawData as VocRow[]);
    // 전처리 결과를 description에 요약 주입 → DA/SW가 활용
    input = {
      ...input,
      description: `${input.description}\n\n[VOC 전처리 결과 (코드 분석, ${vocPreprocess.stats.total}건)]\n${JSON.stringify(vocPreprocess, null, 0)}`,
      // vocRawData는 이후 단계에 전달하지 않음 (토큰 절약)
      vocRawData: undefined,
    };
  }

  // 1단계: Data Analyst + Domain Expert (병렬)
  const [dataAnalyst, domainExpert] = await Promise.all([
    runDataAnalyst(input),
    runDomainExpert(input),
  ]);

  // 2단계: Strategy Writer
  let strategyWriter = await runStrategyWriter(input, dataAnalyst, domainExpert);

  // 2.5단계: PM 사전 체크 (구조만)
  const preCheckResult = await preCheck(input, strategyWriter);
  if (!preCheckResult.passed && preCheckResult.feedback) {
    const feedbackInput = {
      ...input,
      description: `${input.description}\n\n[PM 피드백] ${preCheckResult.feedback}`,
    };
    strategyWriter = await runStrategyWriter(feedbackInput, dataAnalyst, domainExpert);
  }

  // 3단계: Chart Specialist
  const chartSpecialist = await runChartSpecialist(strategyWriter);

  // 4단계: PM 조립
  let blueprint = await assembleAndValidate(input, strategyWriter, chartSpecialist);

  // 5단계: Sample Generator (DA 전체 대신 요약만 전달)
  const daSummary = summarizeDA(dataAnalyst);
  const deSummary = summarizeDE(domainExpert);
  let sampleReport = await runSampleGenerator(blueprint, daSummary, deSummary);

  // 6단계: Persona Critic
  const audience = input.audience ?? "실무자";
  const criticResult = await runPersonaCritic(blueprint, sampleReport, audience);

  const applied = applyPersonaCritic(blueprint, sampleReport, criticResult);
  blueprint = applied.blueprint;
  sampleReport = applied.sampleReport;

  return {
    blueprint,
    trace: {
      dataAnalyst,
      domainExpert,
      strategyWriter,
      chartSpecialist,
      vocPreprocess,
    },
    sampleReport,
  };
}
