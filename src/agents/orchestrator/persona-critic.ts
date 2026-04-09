/**
 * Persona Critic Agent
 *
 * 타겟 페르소나의 관점에서 리포트를 검증한다.
 * PM의 포맷 체크리스트와 달리, 콘텐츠 관련성·우선순위·빠진 정보를 판단.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude } from "@/lib/claude";
import type { AgentBlueprint, PersonaCriticOutput } from "./types";

const PERSONA_CRITIC_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/persona-critic.md"),
  "utf-8"
);

export async function runPersonaCritic(
  blueprint: AgentBlueprint,
  sampleReport: unknown,
  audience: string
): Promise<PersonaCriticOutput> {
  const prompt = `
너는 "${audience}"야. 아래 리포트를 처음부터 끝까지 읽고 판단해줘.

에이전트: ${blueprint.name}
설명: ${blueprint.description}

agent.json 섹션 구성:
${JSON.stringify(blueprint.reportSections.map(s => ({ id: s.id, label: s.label, componentType: s.componentType })), null, 2)}

sample.json (일부):
${JSON.stringify(sampleReport, null, 2).slice(0, 5000)}

위 리포트를 보고 네 의사결정에 필요한 것과 불필요한 것을 판단해줘.
`;

  const raw = await callClaude(prompt, PERSONA_CRITIC_PROMPT);
  return JSON.parse(raw);
}
