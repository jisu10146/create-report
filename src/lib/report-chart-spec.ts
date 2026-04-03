/**
 * Report Chart Specification
 *
 * 피그마 디자인에서 추출한 차트 명세.
 * confident: false — 피그마에서 명확히 읽히지 않아 추정한 값.
 */

export interface ChartSeriesSpec {
  name: string;
  color: string;
  confident?: boolean; // default true
}

export interface ChartSpec {
  chartType: "donut" | "bar" | "stacked-bar";
  direction: "vertical" | "horizontal" | "none"; // none = donut
  series: ChartSeriesSpec[];
  axisX?: string;
  axisY?: string;
  hoverEffect?: string;
  confident?: boolean;
}

/* ─── Chart Color Palette (피그마 기준 우선순위) ─── */

export const CHART_PALETTE = {
  blue500: "#2b7fff",
  blueLight: "#bedbff",
  blue300: "#8ec5ff",
  lime500: "#7ccf00",
  teal500: "#00bba7",
  deepPurple400: "#9f8deb",
  yellow400: "#fdc700",
  gray200: "#e6e7e9",
  gray300: "#cacccf",
  red400: "#f87171",
} as const;

/** 차트에서 순서대로 사용할 기본 팔레트 (피그마 범례 순서 기준) */
export const CHART_COLOR_SEQUENCE = [
  CHART_PALETTE.blue500,
  CHART_PALETTE.lime500,
  CHART_PALETTE.deepPurple400,
  CHART_PALETTE.blue300,
  CHART_PALETTE.teal500,
  CHART_PALETTE.yellow400,
] as const;

/* ─── Chart Specifications ─── */

export const CHART_SPECS: Record<string, ChartSpec> = {
  /* ── Churn Prediction ── */

  "Satisfaction Bar Chart": {
    chartType: "bar",
    direction: "horizontal",
    series: [
      { name: "1위 (최고값)", color: CHART_PALETTE.lime500 },
      { name: "2위", color: CHART_PALETTE.blue500 },
      { name: "3위 이하", color: CHART_PALETTE.gray200 },
    ],
    axisY: "Very High / High / Medium / Low / Very Low",
    hoverEffect: "기존색 + #000000 15% overlay",
  },

  /* ── Audience Strategy ── */

  "Cluster Value Comparison": {
    chartType: "bar",
    direction: "vertical",
    series: [
      { name: "Value Optimizers", color: CHART_PALETTE.blue500 },
      { name: "Occasional Buyers", color: CHART_PALETTE.lime500 },
      { name: "Inactive cluster", color: CHART_PALETTE.gray200, confident: false },
    ],
    axisX: "Premium Enthusiasts / Dormant Potential / Value Optimizers / Occasional Buyers",
  },

  "Integrated ROI": {
    chartType: "bar",
    direction: "vertical",
    series: [
      { name: "Conservative", color: CHART_PALETTE.gray300 },
      { name: "Baseline (Recommended)", color: CHART_PALETTE.lime500 },
      { name: "Aggressive", color: CHART_PALETTE.blue500 },
    ],
    axisX: "Conservative / Baseline (Recommended) / Aggressive",
  },

  /* ── 공통: 수평 막대 (HorizontalBarChart 컴포넌트) ── */

  "HorizontalBarChart:default": {
    chartType: "bar",
    direction: "horizontal",
    series: [
      { name: "1위", color: CHART_PALETTE.blue500 },
      { name: "2위", color: CHART_PALETTE.lime500 },
      { name: "나머지", color: CHART_PALETTE.gray200 },
    ],
    axisY: "항목 라벨",
  },

  /* ── 공통: 시나리오 비교 (RevenueScenarioBar 컴포넌트) ── */

  "RevenueScenarioBar:default": {
    chartType: "bar",
    direction: "horizontal",
    series: [
      { name: "Upside", color: CHART_PALETTE.lime500 },
      { name: "Base", color: CHART_PALETTE.blue500 },
      { name: "Downside", color: CHART_PALETTE.red400 },
    ],
    axisY: "시나리오 라벨",
  },
};

/* ─── ScoreCard Gauge Colors ─── */

export interface ScoreCardColorSpec {
  arc: string;
  badge: string;
}

export const SCORECARD_COLORS: Record<string, ScoreCardColorSpec> = {
  green:  { arc: CHART_PALETTE.lime500,       badge: "positive" },
  red:    { arc: CHART_PALETTE.red400,        badge: "negative" },
  orange: { arc: "#f97316",                   badge: "cautionary" },
  blue:   { arc: CHART_PALETTE.blue500,       badge: "info" },
  yellow: { arc: CHART_PALETTE.yellow400,     badge: "cautionary" },
};

/** 게이지 잔여 영역 색상 = report-border 토큰 */
export const SCORECARD_REMAINING_COLOR = CHART_PALETTE.gray200;
