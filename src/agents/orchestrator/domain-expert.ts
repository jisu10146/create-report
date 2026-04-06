/**
 * Domain Expert Agent
 *
 * 에이전트 카테고리/산업에 맞는 도메인 지식을 제공한다.
 * skills 폴더의 외부 스킬을 호출하여 벤치마크/용어/프레임을 가져온다.
 */

import { callClaude } from "@/lib/claude";
import type { OrchestratorInput, DomainExpertOutput } from "./types";
import { selectSkill, type SkillOutput } from "./skills";

const SYSTEM_PROMPT = `너는 산업별 도메인 전문가야.
에이전트 설명과 도메인 스킬 정보를 기반으로, 리포트에 필요한 도메인 지식을 제공해.

역할:
1. 업계 벤치마크 수치 제공
2. 도메인 전문 용어 → 독자가 이해할 용어로 매핑
3. 독자가 내릴 결정과 그에 필요한 정보 정의
4. 규제/컴플라이언스 고려사항 (해당 시)

출력: JSON만 (설명 없이)
{
  "benchmarks": [{ "metric": "지표명", "value": "기준값", "source": "출처" }],
  "terminology": { "전문용어": "쉬운 설명" },
  "decisionFrame": {
    "keyDecision": "독자가 내릴 핵심 결정",
    "requiredInfo": ["결정에 필요한 정보"]
  },
  "skillUsed": "사용한 스킬 이름 (없으면 null)"
}`;

export async function runDomainExpert(input: OrchestratorInput): Promise<DomainExpertOutput> {
  // 적합한 스킬 선택 + 실행
  const skill: SkillOutput | null = selectSkill(input.description);
  const skillContext = skill
    ? `\n도메인 스킬 (${skill.name}):\n${JSON.stringify(skill.data, null, 2)}`
    : "\n도메인 스킬: 해당 없음 (일반 지식으로 대응)";

  const prompt = `
에이전트: ${input.agentName}
설명: ${input.description}
독자: ${input.audience ?? "팀 리더 / 매니저"}
${skillContext}

위 정보를 기반으로 도메인 벤치마크, 용어, 의사결정 프레임을 제공해줘.
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  const result = JSON.parse(raw) as DomainExpertOutput;
  result.skillUsed = skill?.name ?? undefined;
  return result;
}
