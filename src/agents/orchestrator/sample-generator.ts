/**
 * Sample Generator Agent
 *
 * 확정된 AgentBlueprint + Data Analyst/Domain Expert 결과를 받아서
 * 현실적인 mock 데이터(ReportSchema)를 생성한다.
 */

import { callClaude } from "@/lib/claude";
import { COMPONENT_DATA_SCHEMA } from "@/lib/constants";
import type {
  AgentBlueprint,
  DataAnalystOutput,
  DomainExpertOutput,
} from "./types";

const SYSTEM_PROMPT = `너는 B2B SaaS 데이터 분석가야.
에이전트 구성안을 받아서 현실적인 샘플 리포트 데이터를 생성해.

규칙:
1. 각 섹션의 componentType에 맞는 데이터 스키마를 정확히 따를 것
2. Data Analyst가 도출한 핵심 지표와 수치를 활용
3. Domain Expert의 벤치마크 수치를 참고
4. 수치 간 정합성 유지 (부분합 = 전체, 비율 합 = 100%)
5. 헤드라인/keyFindings는 구체적 수치를 포함한 액션 지향 문장
6. 한국어와 영어를 에이전트 특성에 맞게 혼용

출력: 유효한 JSON만 (마크다운 펜스 없이)
ReportSchema 구조:
{
  "meta": { "agentId": "string", "agentName": "string", "createdAt": "ISO날짜" },
  "executiveSummary": {
    "keyFindings": ["string"],
    "description": "string (optional)",
    "topMetrics": [{ "label": "string", "value": "string|number" }] (optional)
  },
  "sections": [
    { "id": "string", "label": "string", "componentType": "string", "data": { ... } }
  ]
}`;

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
