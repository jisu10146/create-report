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
  DataAnalystOutput,
  DomainExpertOutput,
} from "./types";

/** 프롬프트 원본: src/agents/sample-generator.md */
const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/sample-generator.md"),
  "utf-8"
);

export async function runSampleGenerator(
  blueprint: AgentBlueprint,
  dataAnalyst: DataAnalystOutput,
  domainExpert: DomainExpertOutput
): Promise<unknown> {
  // 섹션별 데이터 스키마를 프롬프트에 포함
  const schemaGuide = blueprint.reportSections.map((s) => {
    const schema = COMPONENT_DATA_SCHEMA[s.componentType] ?? "자유 형식";
    return `- ${s.id} (${s.componentType}): ${schema}`;
  }).join("\n");

  const prompt = `
에이전트 구성안:
${JSON.stringify(blueprint, null, 2)}

Data Analyst 분석 결과:
${JSON.stringify(dataAnalyst, null, 2)}

Domain Expert 벤치마크:
${JSON.stringify(domainExpert.benchmarks, null, 2)}

섹션별 데이터 스키마:
${schemaGuide}

위 구성안의 모든 섹션에 대해 현실적인 샘플 데이터를 생성해줘.
각 섹션의 data는 해당 componentType의 스키마를 정확히 따라야 해.
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  return JSON.parse(raw);
}
