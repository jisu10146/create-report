/**
 * Sample Generator Agent
 *
 * 확정된 AgentBlueprint + Data Analyst/Domain Expert 결과를 받아서
 * 현실적인 mock 데이터(ReportSchema)를 생성한다.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude } from "@/lib/claude";
import { COMPONENT_DATA_SCHEMA } from "@/lib/constants";
import type {
  AgentBlueprint,
  DataAnalystSummary,
} from "./types";

/** 프롬프트 원본: src/agents/sample-generator.md */
const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/sample-generator.md"),
  "utf-8"
);

/**
 * 에이전트 폴더의 report-spec.md를 로드 (있을 때만).
 * 에이전트별 섹션 골격·슬롯 룰·콘텐츠 규칙을 SG가 직접 보게 함.
 */
function loadAgentReportSpec(agentId: string): string | null {
  try {
    const path = join(process.cwd(), "src/agents/definitions", agentId, "report-spec.md");
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

export async function runSampleGenerator(
  blueprint: AgentBlueprint,
  daSummary: DataAnalystSummary,
  deSummary: { benchmarks: string[]; keyDecision: string }
): Promise<unknown> {
  // 섹션별 데이터 스키마를 프롬프트에 포함
  const schemaGuide = blueprint.reportSections.map((s) => {
    const schema = COMPONENT_DATA_SCHEMA[s.componentType] ?? "자유 형식";
    return `- ${s.id} (${s.componentType}): ${schema}`;
  }).join("\n");

  // 블루프린트에서 validation 제거 (Sample Generator에 불필요)
  const compactBlueprint = {
    id: blueprint.id,
    name: blueprint.name,
    description: blueprint.description,
    category: blueprint.category,
    storyLine: blueprint.storyLine,
    keyDecision: blueprint.keyDecision,
    reportSections: blueprint.reportSections,
  };

  // 에이전트별 report-spec.md 주입 (있을 때만)
  const agentSpec = loadAgentReportSpec(blueprint.id);
  const specBlock = agentSpec
    ? `\n\n=== 에이전트 전용 리포트 명세 (필수 준수) ===\n${agentSpec}\n=== /명세 끝 ===\n`
    : "";

  const prompt = `
에이전트 구성안:
${JSON.stringify(compactBlueprint, null, 2)}

분석 요약:
- 방법론: ${daSummary.methodology}
- 핵심 지표: ${daSummary.keyMetricNames.join(", ")}
- 세그먼트: ${daSummary.segmentNames.join(", ")}
- 주의사항: ${daSummary.dataFlags.join(", ")}
${daSummary.topicNames ? `- 토픽: ${daSummary.topicNames.join(", ")}` : ""}
${daSummary.npsScore != null ? `- NPS: ${daSummary.npsScore}` : ""}

벤치마크: ${deSummary.benchmarks.join(" | ")}
핵심 결정: ${deSummary.keyDecision}

섹션별 데이터 스키마:
${schemaGuide}
${specBlock}
위 구성안의 모든 섹션에 대해 현실적인 샘플 데이터를 생성해줘.
각 섹션의 data는 해당 componentType의 스키마를 정확히 따라야 해.${agentSpec ? "\n위 [에이전트 전용 리포트 명세]의 슬롯 채우기 룰·콘텐츠 규칙을 반드시 적용해." : ""}
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  return JSON.parse(raw);
}

/**
 * 콘텐츠 검증에서 발견된 위반 사항을 받아 해당 섹션만 재생성.
 * 위반된 섹션의 콘텐츠 + 수정 지시를 SG에 전달.
 */
export async function regenerateSections(
  blueprint: AgentBlueprint,
  originalSample: unknown,
  daSummary: DataAnalystSummary,
  deSummary: { benchmarks: string[]; keyDecision: string },
  issues: Array<{ sectionId: string; field: string; rule: string; message: string; fix: string }>
): Promise<unknown> {
  const sample = originalSample as { sections?: Array<{ id: string; data: unknown }>; [k: string]: unknown };
  const sections = sample.sections ?? [];

  // 위반된 섹션 ID 그룹화
  const violatedIds = Array.from(new Set(issues.map((i) => i.sectionId)));
  const violatedSections = sections.filter((s) => violatedIds.includes(s.id));
  if (violatedSections.length === 0) return originalSample;

  // 섹션별로 위반 사항 묶기
  const issuesBySection = new Map<string, typeof issues>();
  for (const issue of issues) {
    if (!issuesBySection.has(issue.sectionId)) issuesBySection.set(issue.sectionId, []);
    issuesBySection.get(issue.sectionId)!.push(issue);
  }

  // 재생성 대상 섹션 + 위반 지시
  const regenTargets = violatedSections.map((s) => {
    const blueprintSection = blueprint.reportSections.find((bs) => bs.id === s.id);
    const sectionIssues = issuesBySection.get(s.id) ?? [];
    return {
      id: s.id,
      label: blueprintSection?.label,
      componentType: blueprintSection?.componentType,
      currentData: s.data,
      violations: sectionIssues.map((i) => `- [${i.field}] ${i.message} → 수정 지시: ${i.fix}`).join("\n"),
    };
  });

  const agentSpec = loadAgentReportSpec(blueprint.id);
  const specBlock = agentSpec
    ? `\n\n=== 에이전트 전용 리포트 명세 (필수 준수) ===\n${agentSpec}\n=== /명세 끝 ===\n`
    : "";

  const prompt = `
다음 섹션들의 콘텐츠가 명세를 위반했어. 위반된 섹션만 재생성해줘.
다른 섹션은 그대로 두고, 아래 섹션들의 data만 새로 만들어서 동일 형식으로 응답해줘.

에이전트: ${blueprint.name} (${blueprint.id})
스토리라인: ${blueprint.storyLine}

재생성 대상:
${regenTargets.map((t) => `
[${t.id}] ${t.componentType} — ${t.label}
현재 콘텐츠:
${JSON.stringify(t.currentData, null, 2)}
위반 사항:
${t.violations}
`).join("\n---\n")}

분석 요약:
- 핵심 지표: ${daSummary.keyMetricNames.join(", ")}
${daSummary.topicNames ? `- 토픽: ${daSummary.topicNames.join(", ")}` : ""}

벤치마크: ${deSummary.benchmarks.join(" | ")}
${specBlock}
응답 형식:
{ "sections": [{ "id": "...", "data": { ... } }, ...] }
위반된 섹션의 id와 새 data만 포함해. 다른 필드(label, componentType)는 응답하지 마.
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  const regenerated = JSON.parse(raw) as { sections?: Array<{ id: string; data: unknown }> };
  const regenMap = new Map<string, unknown>();
  for (const s of regenerated.sections ?? []) {
    regenMap.set(s.id, s.data);
  }

  // 원본 sample에 재생성된 섹션 data만 교체
  const mergedSections = sections.map((s) => {
    if (regenMap.has(s.id)) {
      return { ...s, data: regenMap.get(s.id) };
    }
    return s;
  });

  return { ...sample, sections: mergedSections };
}
