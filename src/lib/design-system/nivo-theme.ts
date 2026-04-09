/**
 * Report Nivo Theme
 *
 * 모든 nivo 차트 컴포넌트가 공유하는 테마 객체.
 * report-design-system 토큰값을 hex 리터럴로 매핑.
 *
 * 사용: <ResponsiveBar theme={reportNivoTheme} ... />
 */

import type { PartialTheme } from "@nivo/theming";

/* ─── 토큰 값 (globals.css @theme 기준) ─── */

const TOKEN = {
  textPrimary: "#171719",    // --color-report-text-primary
  textSecondary: "#7b7e85",  // --color-report-text-secondary
  textMuted: "#cacccf",      // --color-report-text-muted
  border: "#e6e7e9",         // --color-report-border
  bg: "#f7f7f8",             // --color-report-bg
  card: "#ffffff",           // --color-report-card
} as const;

export { TOKEN as NIVO_TOKEN };

export const reportNivoTheme: PartialTheme = {
  axis: {
    ticks: {
      text: {
        fontSize: 13,
        fill: TOKEN.textSecondary,
      },
      line: {
        stroke: "transparent",
      },
    },
    domain: {
      line: {
        stroke: "transparent",
      },
    },
  },
  grid: {
    line: {
      stroke: TOKEN.border,
      strokeWidth: 1,
    },
  },
  labels: {
    text: {
      fontSize: 12,
      fill: TOKEN.textPrimary,
    },
  },
  tooltip: {
    container: {
      background: TOKEN.card,
      borderRadius: "8px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      border: `1px solid ${TOKEN.border}`,
      fontSize: "13px",
      color: TOKEN.textPrimary,
    },
  },
};
