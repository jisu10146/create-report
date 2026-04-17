/**
 * Run Pipeline — Stage 3: Executive Summary Generator
 *
 * 생성된 모든 섹션 결과를 바탕으로 Executive Summary를 작성한다.
 * 실제 섹션 데이터를 보고 쓰기 때문에 일관성이 보장된다.
 */

import { callClaude, setStage } from "@/lib/claude";
import type { ExecutiveSummary } from "@/types";
import type { SectionResult } from "./section-generator";

const SYSTEM_PROMPT = `당신은 B2B SaaS 프로덕트 분석 전문가입니다.
리포트 섹션 데이터를 보고 Executive Summary를 작성하세요.
유효한 JSON만 반환하세요. 마크다운 코드 블록 없이 JSON만.`;

export async function generateExecutiveSummary(
  sections: SectionResult[],
  storyLine: string,
  keyDecision: string,
  dataType: string
): Promise<ExecutiveSummary> {
  setStage("run-3-executive-summary");

  // 섹션 데이터를 요약 형태로 압축 (토큰 절약)
  const sectionSummaries = sections
    .map((s) => `[${s.headline}]\n${JSON.stringify(s.data).slice(0, 300)}`)
    .join("\n\n");

  const prompt = `스토리라인: ${storyLine}
핵심 결정 과제: ${keyDecision}
데이터: ${dataType}

섹션별 데이터 요약:
${sectionSummaries}

위 내용을 바탕으로 Executive Summary를 작성해줘.

응답 형식:
{
  "description": "이 리포트가 무슨 데이터를 어떤 축으로 분석했는지 1-2문장 메타 설명 (인사이트 X)",
  "topMetrics": [
    { "label": "핵심 지표명", "value": "값" },
    { "label": "핵심 지표명", "value": "값" }
  ],
  "keyFindings": [
    "현황 진단 (전체 감성/상태 한 줄, 두괄식)",
    "분포 패턴 또는 가장 큰 이상치",
    "우선순위 상위 토픽/문제",
    "해결 방향 요약"
  ]
}

규칙:
- keyFindings 4개가 순서대로 읽히면 하나의 스토리가 되어야 함
- 각 finding은 두괄식 — 수치/결론 먼저, 설명 뒤
- description은 인사이트 없이 메타 설명만`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);
  return JSON.parse(raw) as ExecutiveSummary;
}
