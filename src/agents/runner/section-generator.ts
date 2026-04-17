/**
 * Run Pipeline — Stage 2: Section Generator
 *
 * 섹션 하나의 data를 생성한다. 병렬로 N번 호출됨.
 * 각 호출은 자신의 섹션 스펙 + 컴포넌트 스키마 + DA 요약만 받으므로
 * 프롬프트가 작고 결과 품질이 높다.
 */

import { callClaude, setStage } from "@/lib/claude";
import { COMPONENT_DATA_SCHEMA } from "@/lib/constants";
import type { ReportSection } from "@/types";
import type { RunDataSummary } from "./data-analyst";

const SYSTEM_PROMPT = `당신은 리포트 섹션 데이터 생성 전문가입니다.
지정된 섹션 하나의 data를 컴포넌트 스키마에 맞게 생성하세요.
유효한 JSON만 반환하세요. 마크다운 코드 블록 없이 JSON만.
수치는 반드시 실제처럼 구체적으로 작성하고, 텍스트는 두괄식으로 핵심을 먼저 씁니다.`;

export interface SectionResult {
  id: string;
  label: string;
  componentType: string;
  data: unknown;
}

export async function generateSection(
  section: ReportSection,
  daSummary: RunDataSummary,
  sectionSpec: string | null,
  storyLine: string,
  sectionIndex: number
): Promise<SectionResult> {
  setStage(`run-2-section-${section.id}`);

  const schema = COMPONENT_DATA_SCHEMA[section.componentType] ?? "자유 형식 JSON 객체";

  const specBlock = sectionSpec
    ? `\n섹션 명세:\n${sectionSpec}\n`
    : "";

  const prompt = `리포트 스토리: ${storyLine}

데이터 요약:
- 유형: ${daSummary.dataType}
- 핵심 지표: ${daSummary.keyMetrics.map((m) => `${m.name}: ${m.value}`).join(", ")}
- 주요 토픽: ${daSummary.topics.join(", ")}
${daSummary.segments.length > 0 ? `- 세그먼트: ${daSummary.segments.join(", ")}` : ""}
- 주요 인사이트:
${daSummary.insights.map((i) => `  - ${i}`).join("\n")}
${daSummary.flags.length > 0 ? `- 주의: ${daSummary.flags.join(", ")}` : ""}
${specBlock}
생성할 섹션 (${sectionIndex + 1}번):
- id: ${section.id}
- 제목: ${section.headline}
- 컴포넌트: ${section.componentType}
- 데이터 스키마: ${schema}

위 섹션의 data JSON만 반환해줘. 섹션 제목/id는 포함하지 말고 data 내용만.
스키마를 정확히 따르고, 수치와 텍스트를 실제 데이터 기반으로 구체적으로 작성해.`;

  const raw = await callClaude(prompt, SYSTEM_PROMPT);

  return {
    id: section.id,
    headline: section.headline,
    componentType: section.componentType,
    data: JSON.parse(raw),
  };
}

/**
 * 모든 섹션을 병렬로 생성 (ExecutiveSummary 제외).
 * Promise.allSettled로 일부 실패해도 나머지는 유지.
 */
export async function generateAllSections(
  sections: ReportSection[],
  daSummary: RunDataSummary,
  sectionSpecs: (string | null)[],
  storyLine: string
): Promise<SectionResult[]> {
  const nonSummarySections = sections.filter(
    (s) => s.componentType !== "ExecutiveSummary"
  );
  const nonSummaryIndices = sections
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.componentType !== "ExecutiveSummary");

  const results = await Promise.allSettled(
    nonSummaryIndices.map(({ s, i }) =>
      generateSection(s, daSummary, sectionSpecs[i] ?? null, storyLine, i)
    )
  );

  return results
    .map((r, idx) => {
      if (r.status === "fulfilled") return r.value;
      const s = nonSummarySections[idx];
      console.error(`[section-generator] ${s.id} 생성 실패:`, r.reason);
      return {
        id: s.id,
        headline: s.headline,
        componentType: s.componentType,
        data: { error: "섹션 생성 실패", message: String(r.reason) },
      };
    });
}
