"use client";

import { CHART_PALETTE } from "@/lib/design-system/chart-spec";
import { NIVO_TOKEN } from "@/lib/design-system/nivo-theme";

export interface FunnelChartData {
  title?: string;
  baseColor?: string;
  stages: Array<{
    label: string;
    value: number;
    dropLabel?: string;
    dropValue?: number;
  }>;
}

function generateGradient(baseHex: string, steps: number): string[] {
  const r = parseInt(baseHex.slice(1, 3), 16);
  const g = parseInt(baseHex.slice(3, 5), 16);
  const b = parseInt(baseHex.slice(5, 7), 16);
  return Array.from({ length: steps }, (_, i) => {
    const mix = (i / Math.max(steps - 1, 1)) * 0.55;
    const nr = Math.round(r + (255 - r) * mix);
    const ng = Math.round(g + (255 - g) * mix);
    const nb = Math.round(b + (255 - b) * mix);
    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
  });
}

export default function FunnelChart({ data }: { data: FunnelChartData }) {
  const d = data as FunnelChartData;
  const maxValue = d.stages[0]?.value ?? 1;
  const baseColor = d.baseColor ?? CHART_PALETTE.blue500;
  const colors = generateGradient(baseColor, d.stages.length);

  return (
    <div className="bg-report-card rounded-card p-[24px]">
      {d.title && (
        <p className="text-sm font-semibold text-report-text-primary mb-5">{d.title}</p>
      )}
      <div className="flex flex-col gap-[2px]">
        {d.stages.map((stage, i) => {
          const widthPct = Math.max((stage.value / maxValue) * 100, 15);
          const prevValue = i > 0 ? d.stages[i - 1].value : null;
          const convRate = prevValue && prevValue !== stage.value
            ? ((stage.value / prevValue) * 100).toFixed(1)
            : null;

          const bgBrightness = i / Math.max(d.stages.length - 1, 1);
          const textColor = bgBrightness > 0.4 ? NIVO_TOKEN.textPrimary : "#ffffff";

          return (
            <div key={stage.label} className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div
                  className="rounded-md flex items-center justify-between px-4 py-3 transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: colors[i],
                    minHeight: 48,
                    margin: "0 auto",
                    marginLeft: `${(100 - widthPct) / 2}%`,
                  }}
                >
                  <span className="text-sm font-semibold truncate" style={{ color: textColor }}>
                    {stage.label}
                  </span>
                  <span className="text-sm font-bold ml-2 whitespace-nowrap" style={{ color: textColor }}>
                    {stage.value.toLocaleString()}건
                  </span>
                </div>
              </div>

              <div className="w-[200px] flex-shrink-0 text-right">
                {convRate && (
                  <span className="text-xs font-medium" style={{ color: NIVO_TOKEN.textSecondary }}>
                    전환 {convRate}%
                  </span>
                )}
                {stage.dropLabel && (
                  <div className="text-xs mt-0.5" style={{ color: NIVO_TOKEN.textSecondary }}>
                    {stage.dropLabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
