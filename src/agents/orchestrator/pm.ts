/**
 * PM Agent — 오케스트레이터
 *
 * 전체 파이프라인을 관리하고 각 에이전트를 순서대로 호출한다.
 *   1단계: Data Analyst + Domain Expert (병렬)
 *   2단계: Strategy Writer
 *   3단계: Chart Specialist
 *   4단계: PM 조립 + 검증
 *   5단계: Sample Generator
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
  DomainExpertOutput,
  StrategyWriterOutput,
  ChartSpecialistOutput,
} from "./types";
import { runDataAnalyst } from "./data-analyst";
import { runDomainExpert } from "./domain-expert";
import { runStrategyWriter } from "./strategy-writer";
import { runChartSpecialist } from "./chart-specialist";
import { runSampleGenerator } from "./sample-generator";

/** 프롬프트 원본: src/agents/pm.md */
const PM_SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/pm.md"),
  "utf-8"
);

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** PM이 최종 조립 + 검증하는 단계 */
async function assembleAndValidate(
  input: OrchestratorInput,
  strategy: StrategyWriterOutput,
  chart: ChartSpecialistOutput
): Promise<AgentBlueprint> {
  const prompt = `
에이전트: ${input.agentName}
설명: ${input.description}
분량: ${input.volume ?? "standard"}

Strategy Writer 출력:
${JSON.stringify(strategy, null, 2)}

Chart Specialist 출력:
${JSON.stringify(chart, null, 2)}

위 결과를 병합해서 최종 에이전트 구성안 JSON을 만들어줘.
Strategy Writer의 섹션 순서 + reason을 기반으로,
Chart Specialist의 componentType을 매칭해.
`;

  const raw = await callClaude(prompt, PM_SYSTEM_PROMPT);
  const assembled = JSON.parse(raw);

  // layout-patterns 검증
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

/** 전체 파이프라인 실행 */
export async function orchestrate(input: OrchestratorInput): Promise<OrchestratorResult> {
  // 1단계: Data Analyst + Domain Expert (병렬)
  const [dataAnalyst, domainExpert] = await Promise.all([
    runDataAnalyst(input),
    runDomainExpert(input),
  ]);

  // 2단계: Strategy Writer
  const strategyWriter = await runStrategyWriter(input, dataAnalyst, domainExpert);

  // 3단계: Chart Specialist
  const chartSpecialist = await runChartSpecialist(strategyWriter);

  // 4단계: PM 조립 + 검증
  const blueprint = await assembleAndValidate(input, strategyWriter, chartSpecialist);

  // 5단계: Sample Generator
  const sampleReport = await runSampleGenerator(blueprint, dataAnalyst, domainExpert);

  return {
    blueprint,
    trace: {
      dataAnalyst,
      domainExpert,
      strategyWriter,
      chartSpecialist,
    },
    sampleReport,
  };
}
