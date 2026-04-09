"use client";

/**
 * Design System Adapter
 *
 * 디자이너의 cubig-ds 컴포넌트를 우리 리포트 데이터 스키마에 맞게 변환.
 * 디자이너가 DS를 업데이트하면:
 *   cd src/design-system && git pull origin main
 *
 * DS 컴포넌트는 useState를 사용하므로 SSR 시 hydration mismatch 발생.
 * → dynamic import + ssr: false로 클라이언트 전용 렌더링.
 */

// DS 컴포넌트는 서버에서 렌더링하지 않음.
// SSR 시에는 null을 반환 → renderComponent에서 fallback 사용.
// 클라이언트 마운트 후에만 DS로 교체.

// @ts-expect-error — JSX import from design system submodule
import { DonutChart, HBarChart, StackedHBar, LineChart } from "@/design-system/cubig-ds/src/charts";

// DSClientSwap이 서버/클라이언트 전환을 처리하므로
// 여기서는 서버 가드 불필요 — 항상 DS 컴포넌트를 반환

/* ═══ DS 컴포넌트 매핑 현황 ═══ */

/**
 * 우리 리포트에서 사용하는 전체 컴포넌트 목록과 DS 매핑 상태.
 * DS에 대응 컴포넌트가 있으면 "mapped", 없으면 "missing".
 */
export const DS_COMPONENT_MAP: Record<string, {
  status: "mapped" | "partial" | "missing";
  dsComponent?: string;
  note?: string;
}> = {
  // 차트 — DS에 있음
  DonutChart:        { status: "mapped", dsComponent: "DonutChart" },
  HorizontalBarChart:{ status: "mapped", dsComponent: "HBarChart" },
  StackedBarChart:   { status: "partial", dsComponent: "StackedHBar", note: "일반 데이터만 DS 적용. colors 필드가 있는 감성 차트(긍정/중립/부정)는 자체 컴포넌트 사용 — DS에 커스텀 colors prop 지원 필요" },
  TrendLineChart:    { status: "mapped", dsComponent: "LineChart" },

  // 차트 — DS에 없음
  FunnelChart:       { status: "missing", note: "퍼널 차트 — DS에 대응 컴포넌트 없음. 현재 자체 CSS 구현 사용" },
  PieBarChart:       { status: "missing", note: "파이+바 조합 차트 — DS에 대응 없음" },
  RevenueScenarioBar:{ status: "missing", note: "시나리오 비교 바 — DS에 대응 없음" },

  // 카드/테이블 — DS에 없음 (차트가 아닌 컴포넌트)
  ExecutiveSummary:  { status: "missing", note: "요약 카드 — DS에 리포트 카드 컴포넌트 필요" },
  MetricHighlight:   { status: "missing", note: "KPI 강조 카드 — DS에 메트릭 카드 필요" },
  InsightCard:       { status: "missing", note: "인사이트 카드 — DS에 뱃지+설명 카드 필요" },
  DataTable:         { status: "missing", note: "데이터 테이블 — DS에 리포트용 테이블 필요" },
  StrategyTable:     { status: "missing", note: "전략 테이블 (즉시/단기/중기) — DS에 대응 없음" },
  ClusterCard:       { status: "missing", note: "클러스터 카드 — DS에 대응 없음" },
  UserCard:          { status: "missing", note: "페르소나 카드 — DS에 대응 없음" },
  ChecklistCard:     { status: "missing", note: "체크리스트 카드 — DS에 대응 없음" },
  BulletCard:        { status: "missing", note: "불릿 카드 — DS에 대응 없음" },
  InterpretationBlock:{ status: "missing", note: "해석 블록 — DS에 대응 없음" },
  SectionTitle:      { status: "missing", note: "섹션 타이틀 — DS에 대응 없음" },
  PersonaModal:      { status: "missing", note: "페르소나 모달 — DS에 대응 없음" },
};

/**
 * DS 매핑 현황 리포트 — 콘솔 또는 UI에서 확인용
 */
export function getDSCoverageReport(): {
  total: number;
  mapped: number;
  partial: number;
  missing: number;
  coveragePercent: number;
  missingComponents: Array<{ name: string; note: string; status: string }>;
} {
  const entries = Object.entries(DS_COMPONENT_MAP);
  const mapped = entries.filter(([, v]) => v.status === "mapped");
  const partial = entries.filter(([, v]) => v.status === "partial");
  const missing = entries.filter(([, v]) => v.status === "missing");

  return {
    total: entries.length,
    mapped: mapped.length,
    partial: partial.length,
    missing: missing.length,
    coveragePercent: Math.round(((mapped.length + partial.length * 0.5) / entries.length) * 100),
    missingComponents: [...partial, ...missing].map(([name, v]) => ({ name, note: v.note ?? "", status: v.status })),
  };
}

/** 개발 모드에서 자동 출력 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const report = getDSCoverageReport();
  console.log(
    `[DS Coverage] ${report.mapped}/${report.total} (${report.coveragePercent}%) 컴포넌트 매핑됨`
  );
  if (report.missingComponents.length > 0) {
    console.log(`[DS Coverage] 디자인 시스템 고도화 필요:`);
    report.missingComponents.forEach((c) => {
      console.log(`  ❌ ${c.name}: ${c.note}`);
    });
  }
}

/* ═══ DS 차트 어댑터 ═══ */

interface DonutChartData {
  title?: string;
  items: Array<{ label: string; value: number; count?: number }>;
}

export function DSDonutChart({ data }: { data: DonutChartData }) {

  const d = data as DonutChartData;
  const nivoData = d.items.map((item) => ({
    id: item.label,
    label: item.label,
    value: item.count ?? item.value,
  }));
  return (
    <div className="bg-report-card rounded-card p-[24px]">
      <DonutChart data={nivoData} title={d.title} size={180} />
    </div>
  );
}

interface HBarChartData {
  question?: string;
  items: Array<{ label: string; value: number; count?: number }>;
}

export function DSHBarChart({ data }: { data: HBarChartData }) {

  const d = data as HBarChartData;
  const barData = d.items.map((item) => ({
    label: item.label,
    value: item.value,
    count: item.count,
  }));
  return (
    <div className="bg-report-card rounded-card p-[24px]">
      <HBarChart data={barData} title={d.question} />
    </div>
  );
}

interface StackedBarChartData {
  title?: string;
  categories: string[];
  colors?: string[];
  items: Array<{ label: string; values: number[] }>;
}

/** DS가 처리할 수 있는 StackedBarChart인지 판별 (커스텀 colors 없는 경우만) */
export function canDSHandleStackedBar(data: unknown): boolean {
  const d = data as StackedBarChartData;
  return !(d.colors && d.colors.length > 0);
}

export function DSStackedBarChart({ data }: { data: StackedBarChartData }) {

  const d = data as StackedBarChartData;
  const nivoData = d.items.map((item) => {
    const row: Record<string, string | number> = { label: item.label };
    d.categories.forEach((cat, i) => {
      row[cat] = item.values[i] ?? 0;
    });
    return row;
  });
  return (
    <div className="bg-report-card rounded-card p-[24px]">
      <StackedHBar data={nivoData} keys={d.categories} indexBy="label" title={d.title} />
    </div>
  );
}

interface TrendLineChartData {
  title?: string;
  xLabels: string[];
  series: Array<{ id: string; values: number[] }>;
}

export function DSTrendLineChart({ data }: { data: TrendLineChartData }) {

  const d = data as TrendLineChartData;
  const lineData = d.series.map((s) => ({
    id: s.id,
    data: d.xLabels.map((label, j) => ({ x: label, y: s.values[j] ?? 0 })),
  }));
  return (
    <div className="bg-report-card rounded-card p-[24px]">
      <LineChart data={lineData} title={d.title} enableArea={false} />
    </div>
  );
}
