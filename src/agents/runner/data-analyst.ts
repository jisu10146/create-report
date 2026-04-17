/**
 * Run Pipeline — Stage 1: Data Analyst
 *
 * 사용자 입력 데이터를 분석해 이후 섹션 생성에 쓸 구조화된 요약을 만든다.
 * 전체 리포트 생성이 아닌 "무슨 데이터인가"에만 집중한 경량 호출.
 */

import { callClaude, setStage } from "@/lib/claude";

export interface RunDataSummary {
  /** 데이터 유형 판단 */
  dataType: string;
  /** 핵심 지표와 값 */
  keyMetrics: Array<{ name: string; value: string }>;
  /** 주요 토픽/테마 */
  topics: string[];
  /** 세그먼트 구분 (있을 때) */
  segments: string[];
  /** 주요 인사이트 (섹션 생성 힌트) */
  insights: string[];
  /** 주의사항 */
  flags: string[];
}

const SYSTEM_PROMPT = `당신은 데이터 분석가입니다.
사용자가 제공한 데이터를 분석해 핵심 지표, 패턴, 인사이트를 추출하세요.
유효한 JSON만 반환하세요. 마크다운 코드 블록 없이 JSON만.`;

export async function runDataAnalyst(
  input: string,
  agentDescription: string,
  sectionLabels: string[]
): Promise<RunDataSummary> {
  setStage("run-1-data-analyst");

  const prompt = `에이전트 목적: ${agentDescription}

생성할 리포트 섹션:
${sectionLabels.map((l, i) => `${i + 1}. ${l}`).join("\n")}

분석할 데이터:
${input.slice(0, 8000)}${input.length > 8000 ? "\n...(이하 생략)" : ""}

위 데이터를 분석해 아래 JSON 구조로 응답해줘:
{
  "dataType": "데이터 유형 설명 (예: 앱스토어 리뷰 1,200건)",
  "keyMetrics": [{ "name": "지표명", "value": "값" }],
  "topics": ["주요 토픽/테마 목록"],
  "segments": ["세그먼트 (없으면 빈 배열)"],
  "insights": ["섹션 생성에 활용할 핵심 인사이트 5-8개"],
  "flags": ["주의사항 (데이터 부족, 편향 등)"]
}`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  return JSON.parse(raw) as RunDataSummary;
}
