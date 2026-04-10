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

위 구성안의 모든 섹션에 대해 현실적인 샘플 데이터를 생성해줘.
각 섹션의 data는 해당 componentType의 스키마를 정확히 따라야 해.
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  return JSON.parse(raw);
}
