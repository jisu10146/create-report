/**
 * Data Analyst Agent
 *
 * 서비스에서 제공한 dataProfile을 기반으로
 * 분석 방법론, 핵심 지표, 세그먼트 구조를 결정한다.
 */

import { callClaude } from "@/lib/claude";
import type { OrchestratorInput, DataAnalystOutput } from "./types";

const SYSTEM_PROMPT = `너는 데이터 분석 전문가야.
서비스에서 이미 프로파일링한 데이터 정보를 받아서, 리포트에 적합한 분석 방법론과 핵심 지표를 결정해.

데이터 프로파일링은 이미 완료됨 — 직접 하지 마.
네 역할은 프로파일 결과를 해석해서 분석 전략을 세우는 것.

출력: JSON만 (설명 없이)
{
  "methodology": "추천 분석 방법론 (예: 로지스틱 회귀 + 생존 분석)",
  "keyMetrics": [
    { "name": "지표명", "source": "어떤 컬럼/데이터에서", "rationale": "왜 이 지표가 핵심인지" }
  ],
  "segments": [
    { "name": "세그먼트명", "criteria": "분류 기준" }
  ],
  "dataFlags": ["분석 시 주의할 점"]
}`;

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
