/**
 * Domain Expert Agent
 *
 * 에이전트 카테고리/산업에 맞는 도메인 지식을 제공한다.
 * 복수 스킬을 매칭하여 벤치마크/용어/프레임을 병합 제공.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude } from "@/lib/claude";
import type { OrchestratorInput, DomainExpertOutput } from "./types";
import { selectSkills, mergeSkills, type SkillOutput } from "./skills";

/** 프롬프트 원본: src/agents/domain-expert.md */
const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/domain-expert.md"),
  "utf-8"
);

export async function runDomainExpert(input: OrchestratorInput): Promise<DomainExpertOutput> {
  const matchedSkills: SkillOutput[] = selectSkills(input.description);
  const skillNames = matchedSkills.map((s) => s.name);

  let skillContext: string;
  if (matchedSkills.length > 0) {
    const merged = mergeSkills(matchedSkills);
    skillContext = `\n매칭된 도메인 스킬 (${skillNames.join(", ")}):\n${JSON.stringify(merged, null, 2)}`;
  } else {
    skillContext = "\n도메인 스킬: 해당 없음 (일반 지식으로 대응)";
  }

  const prompt = `
에이전트: ${input.agentName}
설명: ${input.description}
독자: ${input.audience ?? "팀 리더 / 매니저"}
${skillContext}

위 정보를 기반으로 도메인 벤치마크, 용어, 의사결정 프레임을 제공해줘.
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  const result = JSON.parse(raw) as DomainExpertOutput;
  result.skillUsed = skillNames.length > 0 ? skillNames.join(", ") : undefined;
  return result;
}
