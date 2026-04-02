/**
 * Design System Token Data
 * Source of truth: globals.css @theme block + report-chart-spec.ts
 * Keep in sync with globals.css when tokens change.
 */

export interface Token {
  name: string;
  value: string;
  tailwind: string;
  usage: string;
  confident?: boolean; // default true
}

export interface TokenGroup {
  group: string;
  tokens: Token[];
}

/* ─── Color Tokens ─── */

export const COLOR_TOKENS: TokenGroup[] = [
  {
    group: "Background",
    tokens: [
      { name: "--color-report-bg", value: "#f7f7f8", tailwind: "bg-report-bg", usage: "페이지 전체 배경" },
      { name: "--color-report-card", value: "#ffffff", tailwind: "bg-report-card", usage: "카드/섹션 배경" },
    ],
  },
  {
    group: "Border",
    tokens: [
      { name: "--color-report-border", value: "#e6e7e9", tailwind: "border-report-border", usage: "카드/구분선 stroke" },
    ],
  },
  {
    group: "Text",
    tokens: [
      { name: "--color-report-text-primary", value: "#171719", tailwind: "text-report-text-primary", usage: "제목, 본문, 수치" },
      { name: "--color-report-text-secondary", value: "#7b7e85", tailwind: "text-report-text-secondary", usage: "보조 텍스트, 라벨" },
      { name: "--color-report-text-muted", value: "#cacccf", tailwind: "text-report-text-muted", usage: "비활성/축 라벨", confident: false },
    ],
  },
  {
    group: "Chart Palette",
    tokens: [
      { name: "--color-chart-blue", value: "#2b7fff", tailwind: "bg-chart-blue", usage: "메인 차트 색 (blue 500)" },
      { name: "--color-chart-blue-light", value: "#bedbff", tailwind: "bg-chart-blue-light", usage: "보조 차트 색" },
      { name: "--color-chart-blue-mid", value: "#8ec5ff", tailwind: "bg-chart-blue-mid", usage: "파이차트 blue 300" },
      { name: "--color-chart-green", value: "#7ccf00", tailwind: "bg-chart-green", usage: "차트 그린 (lime 500)" },
      { name: "--color-chart-teal", value: "#00bba7", tailwind: "bg-chart-teal", usage: "파이차트 teal 500" },
      { name: "--color-chart-purple", value: "#9f8deb", tailwind: "bg-chart-purple", usage: "파이차트 deepPurple 400" },
      { name: "--color-chart-yellow", value: "#fdc700", tailwind: "bg-chart-yellow", usage: "파이차트 yellow 400" },
    ],
  },
];

/* ─── Typography Tokens ─── */

export interface TypoToken {
  name: string;
  size: string;
  sizeVar: string;
  weight: number;
  lineHeight: string;
  lineHeightVar: string;
  usage: string;
  sample: string;
}

export const TYPO_TOKENS: TypoToken[] = [
  { name: "Heading L", size: "20px", sizeVar: "--font-size-heading-l", weight: 600, lineHeight: "28px", lineHeightVar: "--leading-heading-l", usage: "에이전트 제목, KPI 대형 수치", sample: "고객 이탈 예측 리포트" },
  { name: "Heading M", size: "18px", sizeVar: "--font-size-heading-m", weight: 500, lineHeight: "26px", lineHeightVar: "--leading-heading-m", usage: "차트 제목, 카드 헤더", sample: "클러스터별 이탈률 분포" },
  { name: "Body L (semibold)", size: "16px", sizeVar: "--font-size-body-m", weight: 600, lineHeight: "24px", lineHeightVar: "--leading-body-m", usage: "섹션 제목, 강조 라벨", sample: "리텐션 실행 계획" },
  { name: "Body M", size: "16px", sizeVar: "--font-size-body-m", weight: 500, lineHeight: "24px", lineHeightVar: "--leading-body-m", usage: "본문 텍스트", sample: "전체 고객 중 18.4%가 향후 30일 내 이탈 고위험군으로 분류됩니다." },
  { name: "Body S", size: "14px", sizeVar: "--font-size-body-s", weight: 500, lineHeight: "20px", lineHeightVar: "--leading-body-s", usage: "카드 라벨, 보조 설명", sample: "전체 분석 고객 24,831명" },
  { name: "Body S (regular)", size: "14px", sizeVar: "--font-size-body-s", weight: 400, lineHeight: "20px", lineHeightVar: "--leading-body-s", usage: "차트 축 텍스트, 테이블 셀", sample: "접속 빈도 급감 62%" },
];

/* ─── Spacing Tokens ─── */

export interface SpacingToken {
  name: string;
  value: string;
  px: number;
  cssVar: string;
  usage: string;
}

export const SPACING_TOKENS: SpacingToken[] = [
  { name: "spacing-1", value: "2px", px: 2, cssVar: "--spacing-1", usage: "최소 간격" },
  { name: "spacing-2", value: "4px", px: 4, cssVar: "--spacing-2", usage: "인라인 간격" },
  { name: "spacing-3", value: "6px", px: 6, cssVar: "--spacing-3", usage: "아이콘-텍스트 간격" },
  { name: "spacing-4", value: "8px", px: 8, cssVar: "--spacing-4", usage: "카드 내부 작은 패딩" },
  { name: "spacing-5", value: "10px", px: 10, cssVar: "--spacing-5", usage: "리스트 아이템 간격" },
  { name: "spacing-6", value: "12px", px: 12, cssVar: "--spacing-6", usage: "카드 그리드 gap" },
  { name: "spacing-7", value: "16px", px: 16, cssVar: "--spacing-7", usage: "카드 패딩, 섹션 gap" },
  { name: "spacing-8", value: "20px", px: 20, cssVar: "--spacing-8", usage: "섹션 내부 간격" },
  { name: "spacing-9", value: "24px", px: 24, cssVar: "--spacing-9", usage: "섹션 간 간격" },
  { name: "spacing-10", value: "32px", px: 32, cssVar: "--spacing-10", usage: "큰 섹션 패딩" },
  { name: "spacing-11", value: "40px", px: 40, cssVar: "--spacing-11", usage: "페이지 패딩" },
  { name: "spacing-12", value: "50px", px: 50, cssVar: "--spacing-12", usage: "대형 간격" },
  { name: "spacing-13", value: "60px", px: 60, cssVar: "--spacing-13", usage: "페이지 섹션 구분" },
  { name: "spacing-14", value: "70px", px: 70, cssVar: "--spacing-14", usage: "최대 간격" },
];

/* ─── Radius Tokens ─── */

export interface RadiusToken {
  name: string;
  value: string;
  px: number;
  cssVar: string;
  tailwind: string;
  usage: string;
}

export const RADIUS_TOKENS: RadiusToken[] = [
  { name: "chip", value: "6px", px: 6, cssVar: "--radius-chip", tailwind: "rounded-chip", usage: "칩, 뱃지" },
  { name: "sm", value: "8px", px: 8, cssVar: "--radius-sm", tailwind: "rounded-sm", usage: "소형 카드, 툴팁" },
  { name: "card", value: "16px", px: 16, cssVar: "--radius-card", tailwind: "rounded-card", usage: "카드, 모달" },
  { name: "container", value: "20px", px: 20, cssVar: "--radius-container", tailwind: "rounded-container", usage: "대형 컨테이너" },
];

/* ─── Shadow Tokens ─── */

export interface ShadowToken {
  name: string;
  value: string;
  cssVar: string;
  tailwind: string;
  usage: string;
  confident?: boolean;
}

export const SHADOW_TOKENS: ShadowToken[] = [
  { name: "card", value: "0 1px 2px rgba(0,0,0,0.06)", cssVar: "--shadow-card", tailwind: "shadow-card", usage: "카드 기본" },
  { name: "card-hover", value: "0 4px 16px rgba(0,0,0,0.08)", cssVar: "--shadow-card-hover", tailwind: "shadow-card-hover", usage: "카드 호버", confident: false },
  { name: "elevated", value: "0 6px 20px rgba(0,0,0,0.1)", cssVar: "--shadow-elevated", tailwind: "shadow-elevated", usage: "팝오버, 툴팁", confident: false },
];

/* ─── Layout Volume Patterns ─── */

export interface LayoutPattern {
  volume: string;
  label: string;
  desc: string;
  sectionCount: string;
  sections: string[];
}

export const LAYOUT_PATTERNS: LayoutPattern[] = [
  {
    volume: "compact",
    label: "한 페이지 요약",
    desc: "핵심 지표 + 결론 중심",
    sectionCount: "3~4개",
    sections: ["ExecutiveSummary", "MetricCard", "StrategyTable"],
  },
  {
    volume: "standard",
    label: "표준",
    desc: "분석 + 인사이트 + 실행안",
    sectionCount: "6~8개",
    sections: ["ExecutiveSummary", "MetricCard", "HorizontalBarChart", "InterpretationBlock", "DoDontCard", "StrategyTable", "RevenueScenarioBar"],
  },
  {
    volume: "detailed",
    label: "상세 분석",
    desc: "데이터 심층 분석 + 페르소나 + 전략",
    sectionCount: "8~12개",
    sections: ["ExecutiveSummary", "MetricCard", "HorizontalBarChart", "InterpretationBlock", "SyntheticPersonaCard", "SignalCard", "DoDontCard", "StrategyTable", "RevenueScenarioBar", "ScoreCard"],
  },
];

/* ─── Confidence Aggregation ─── */

export function countUnconfirmedTokens(): number {
  let count = 0;
  for (const group of COLOR_TOKENS) {
    count += group.tokens.filter((t) => t.confident === false).length;
  }
  count += SHADOW_TOKENS.filter((t) => t.confident === false).length;
  return count;
}
