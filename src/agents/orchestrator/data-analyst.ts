/**
 * Data Analyst Agent
 *
 * 서비스에서 제공한 dataProfile을 기반으로
 * 분석 방법론, 핵심 지표, 세그먼트 구조를 결정한다.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude } from "@/lib/claude";
import type { OrchestratorInput, DataAnalystOutput } from "./types";

/** 프롬프트 원본: src/agents/data-analyst.md */
const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/data-analyst.md"),
  "utf-8"
);

export async function runDataAnalyst(input: OrchestratorInput): Promise<DataAnalystOutput> {
  const profileSection = input.dataProfile
    ? `\n데이터 프로파일:\n${JSON.stringify(input.dataProfile, null, 2)}`
    : "\n데이터 프로파일: 제공되지 않음 (에이전트 설명 기반으로 추론해)";

  const prompt = `
에이전트: ${input.agentName}
설명: ${input.description}
분량: ${input.volume ?? "standard"}
${profileSection}

위 정보를 기반으로 분석 방법론, 핵심 지표, 세그먼트 구조를 결정해줘.
`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  return JSON.parse(raw) as DataAnalystOutput;
}
