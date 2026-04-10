/**
 * Chart Specialist Agent — 시각화 전문가
 *
 * Strategy Writer의 섹션 구성을 받아서
 * 각 섹션에 최적의 컴포넌트를 매칭한다.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { callClaude } from "@/lib/claude";
import { COMPONENT_DEFINITIONS, COMPONENT_DATA_SCHEMA } from "@/lib/constants";
import type { StrategyWriterOutput, ChartSpecialistOutput } from "./types";

/** 프롬프트 원본: src/agents/chart-specialist.md */
const RAW_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/chart-specialist.md"),
  "utf-8"
);

/** dataHint 키워드 → 관련 컴포넌트 매핑 (축소 필터용) */
const HINT_TO_COMPONENTS: Record<string, string[]> = {
  "수치비교": ["HorizontalBarChart", "MetricHighlight"],
  "항목별 비교": ["HorizontalBarChart", "DataTable"],
  "순위": ["HorizontalBarChart", "DataTable"],
  "비율": ["DonutChart", "PieBarChart"],
  "구성": ["DonutChart", "StackedBarChart"],
  "분포": ["DonutChart", "StackedBarChart"],
  "개별 사례": ["DataTable"],
  "목록": ["DataTable"],
  "상세": ["DataTable"],
  "사람": ["UserCard", "ClusterCard"],
  "프로필": ["UserCard", "ClusterCard"],
  "페르소나": ["UserCard", "ClusterCard"],
  "그룹": ["ClusterCard"],
  "군집": ["ClusterCard"],
  "클러스터": ["ClusterCard"],
  "체크": ["ChecklistCard"],
  "기준": ["ChecklistCard"],
  "KPI": ["MetricHighlight"],
  "지표": ["MetricHighlight"],
  "원인": ["InsightCard"],
  "진단": ["InsightCard"],
  "인사이트": ["InsightCard"],
  "전략": ["StrategyTable"],
  "실행": ["StrategyTable"],
  "타임라인": ["StrategyTable"],
  "시나리오": ["RevenueScenarioBar"],
  "예측": ["RevenueScenarioBar", "TrendLineChart"],
  "해석": ["InterpretationBlock"],
  "요약": ["ExecutiveSummary", "BulletCard"],
  "시계열": ["TrendLineChart"],
  "추이": ["TrendLineChart"],
  "퍼널": ["FunnelChart"],
  "전환": ["FunnelChart"],
  "stacked": ["StackedBarChart"],
  "분해": ["StackedBarChart"],
  "NPS": ["StackedBarChart", "MetricHighlight"],
};

/** dataHint 배열에서 관련 컴포넌트만 필터 → 축소 COMPONENT_SPEC 생성 */
function buildFilteredSpec(dataHints: string[]): string {
  const allHints = dataHints.join(" ").toLowerCase();
  const relevantNames = new Set<string>();

  // ES는 항상 포함
  relevantNames.add("ExecutiveSummary");

  for (const [keyword, components] of Object.entries(HINT_TO_COMPONENTS)) {
    if (allHints.includes(keyword.toLowerCase())) {
      components.forEach((c) => relevantNames.add(c));
    }
  }

  // 최소 보장: 기본 컴포넌트 항상 포함
  ["MetricHighlight", "InsightCard", "StrategyTable", "DataTable"].forEach((c) =>
    relevantNames.add(c)
  );

  const filtered = COMPONENT_DEFINITIONS.filter((c) => relevantNames.has(c.name));

  return filtered
    .map((c) => {
      const schema = COMPONENT_DATA_SCHEMA[c.name] ?? "";
      const rule = c.rule ? ` | 규칙: ${c.rule}` : "";
      return `- ${c.name}: ${c.description}${rule}\n  데이터: ${schema}`;
    })
    .join("\n\n");
}

export async function runChartSpecialist(
  strategy: StrategyWriterOutput
): Promise<ChartSpecialistOutput> {
  // dataHint에서 관련 컴포넌트만 추출하여 COMPONENT_SPEC 축소
  const dataHints = strategy.sections.map((s) => s.dataHint);
  const filteredSpec = buildFilteredSpec(dataHints);
  const systemPrompt = RAW_PROMPT.replace("{{COMPONENT_SPEC}}", filteredSpec);

  const prompt = `
Strategy Writer가 설계한 섹션 구성:

storyLine: ${strategy.storyLine}
category: ${strategy.category}

섹션:
${strategy.sections.map((s) => `- ${s.id} | ${s.label} | dataHint: "${s.dataHint}"`).join("\n")}

각 섹션의 dataHint를 보고, 가장 적합한 컴포넌트를 매칭해줘.
섹션 id는 그대로 유지해.
`;

  const raw = await callClaude(prompt, systemPrompt);
  return JSON.parse(raw) as ChartSpecialistOutput;
}
