/**
 * Run Pipeline — 메인 오케스트레이터
 *
 * 실제 사용자 데이터로 리포트를 생성하는 멀티 에이전트 파이프라인.
 *
 * 흐름:
 *   Stage 1: Data Analyst     — 입력 데이터 구조화
 *   Stage 2: Section Gen (병렬) — 섹션별 데이터 생성
 *   Stage 3: Executive Summary — 섹션 결과 기반 요약
 *   Stage 4: Assembly          — ReportSchema 조립 (코드만, 0 토큰)
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { AgentDefinition, ReportSchema } from "@/types";
import { runDataAnalyst } from "./data-analyst";
import { generateAllSections } from "./section-generator";
import { generateExecutiveSummary } from "./executive-summary";

/**
 * report-spec.md에서 섹션별 블록을 추출.
 * "### 섹션 N." 헤더로 구분된 블록을 인덱스 순서로 반환.
 * 섹션 수보다 스펙 블록이 적으면 null로 채움.
 */
function extractSectionSpecs(specMd: string, sectionCount: number): (string | null)[] {
  const blocks = specMd.split(/(?=###\s+섹션\s+\d+\.)/);
  const specBlocks = blocks
    .filter((b) => /###\s+섹션\s+\d+\./.test(b))
    .map((b) => b.trim());

  return Array.from({ length: sectionCount }, (_, i) => specBlocks[i] ?? null);
}

function loadReportSpec(agentId: string): string | null {
  try {
    return readFileSync(
      join(process.cwd(), "src/agents/definitions", agentId, "report-spec.md"),
      "utf-8"
    );
  } catch {
    return null;
  }
}

export async function runReportPipeline(
  agent: AgentDefinition,
  input: string
): Promise<ReportSchema> {
  const sections = agent.reportSections ?? [];
  if (sections.length === 0) {
    throw new Error(`에이전트 ${agent.id}에 reportSections가 없습니다`);
  }

  // report-spec.md 로드 및 섹션별 분리
  const specMd = loadReportSpec(agent.id);
  const sectionSpecs = specMd
    ? extractSectionSpecs(specMd, sections.length)
    : sections.map(() => null);

  const sectionLabels = sections.map((s) => s.headline);
  const storyLine = (agent as { storyLine?: string }).storyLine ?? agent.description;
  const keyDecision = (agent as { keyDecision?: string }).keyDecision ?? "";

  // Stage 1: 데이터 분석
  console.log("[pipeline] Stage 1: Data Analyst");
  const daSummary = await runDataAnalyst(input, agent.description, sectionLabels);

  // Stage 2: 섹션 병렬 생성 (ExecutiveSummary 제외)
  console.log(`[pipeline] Stage 2: Section Generator (${sections.filter((s) => s.componentType !== "ExecutiveSummary").length}개 병렬)`);
  const generatedSections = await generateAllSections(
    sections,
    daSummary,
    sectionSpecs,
    storyLine
  );

  // Stage 3: Executive Summary
  console.log("[pipeline] Stage 3: Executive Summary");
  const executiveSummary = await generateExecutiveSummary(
    generatedSections,
    storyLine,
    keyDecision,
    daSummary.dataType
  );

  // Stage 4: 조립
  const allSections = sections.map((s) => {
    if (s.componentType === "ExecutiveSummary") {
      return { id: s.id, headline: s.headline, componentType: s.componentType, data: executiveSummary };
    }
    return generatedSections.find((g) => g.id === s.id) ?? {
      id: s.id,
      headline: s.headline,
      componentType: s.componentType,
      data: {},
    };
  });

  return {
    meta: {
      agentId: agent.id,
      agentName: agent.name,
      createdAt: new Date().toISOString(),
    },
    executiveSummary,
    sections: allSections,
  };
}
