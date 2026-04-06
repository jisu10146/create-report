"use client";

import { useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { CHART_COLOR_SEQUENCE, CHART_PALETTE } from "@/lib/report-chart-spec";
import { reportNivoTheme } from "@/lib/report-nivo-theme";
import type { PieBarChartData } from "@/types";

/**
 * PieBarChart — 피그마 pie chart + bar chart (6:1730)
 *
 * 카드: bg #ffffff, radius 16, padding 50/0, gap 50, crossAlign CENTER
 * 내부: horizontal, gap 160, crossAlign CENTER
 *   - pie chart: vertical, gap 40, crossAlign CENTER
 *     - title: 18px/500 #171719
 *     - pie: 230x230
 *   - bar chart: vertical, gap 40, crossAlign CENTER
 *     - title: 18px/500 #171719
 *     - bars: horizontal, gap 50, crossAlign MAX
 *       - Bar: 130px fixed, vertical, gap 16, crossAlign CENTER, mainAlign MAX
 *         - value label: 20px/600 #171719, align CENTER
 *         - Bar bg: fill, bg #f7f7f8, mainAlign MAX, 높이 236
 *           - Bar rect: 높이 비례
 * legend: horizontal, gap 10
 *   - dot: 10x10 Vector
 *   - text: 16px/400 #7b7e85
 */

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const BAR_BG_HEIGHT = 236;

export default function PieBarChart({ data }: { data: PieBarChartData }) {
  const [hoveredPieId, setHoveredPieId] = useState<string | null>(null);

  const pieData = data.pieItems.map((item, i) => ({
    id: item.label,
    label: item.label,
    value: item.value,
    baseColor: item.color ?? CHART_COLOR_SEQUENCE[i] ?? CHART_PALETTE.gray200,
  }));

  const pieColors = pieData.map((d) => {
    if (hoveredPieId === null) return d.baseColor;
    return d.id === hoveredPieId ? d.baseColor : hexToRgba(d.baseColor, 0.4);
  });

  const barMaxVal = Math.max(...data.barItems.map((item) => item.value), 1);

  const legends = data.legends ?? data.pieItems.map((item, i) => ({
    label: item.label,
    color: item.color ?? CHART_COLOR_SEQUENCE[i] ?? CHART_PALETTE.gray200,
  }));

  return (
    <div className="bg-report-card rounded-card py-[50px] flex flex-col items-center gap-[50px]">
      <div className="flex items-center gap-[160px]">
        {/* Pie chart */}
        <div className="flex flex-col items-center gap-[40px]">
          {data.pieTitle && (
            <span className="text-[18px] font-medium leading-[26px] text-report-text-primary">
              {data.pieTitle}
            </span>
          )}
          <div className="w-[230px] h-[230px]">
            <ResponsivePie
              data={pieData}
              innerRadius={0.6}
              padAngle={1.5}
              cornerRadius={2}
              colors={pieColors}
              enableArcLabels={false}
              enableArcLinkLabels={false}
              isInteractive={true}
              theme={reportNivoTheme}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              onMouseEnter={(datum) => setHoveredPieId(datum.id as string)}
              onMouseLeave={() => setHoveredPieId(null)}
              tooltip={({ datum }) => (
                <div className="bg-report-card rounded-sm shadow-elevated px-4 py-3 whitespace-nowrap border border-report-border">
                  <div className="text-sm text-report-text-secondary">{datum.label}</div>
                  <div className="mt-0.5">
                    <span className="text-base font-bold text-report-text-primary">
                      {datum.value}%
                    </span>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Bar chart — 커스텀 세로 막대 */}
        <div className="flex flex-col items-center gap-[40px]">
          {data.barTitle && (
            <span className="text-[18px] font-medium leading-[26px] text-report-text-primary">
              {data.barTitle}
            </span>
          )}
          <div className="flex items-end gap-[50px]">
            {data.barItems.map((item, i) => {
              const barHeight = Math.round((item.value / barMaxVal) * BAR_BG_HEIGHT);
              const color = item.color ?? CHART_COLOR_SEQUENCE[i] ?? CHART_PALETTE.gray200;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-[16px]"
                  style={{ width: 130 }}
                >
                  {/* Value label */}
                  <span className="text-[20px] font-semibold leading-[28px] text-report-text-primary text-center">
                    {item.value}%
                  </span>
                  {/* Bar background + actual bar */}
                  <div
                    className="w-full bg-[#f7f7f8] flex flex-col justify-end"
                    style={{ height: BAR_BG_HEIGHT }}
                  >
                    <div
                      style={{
                        height: barHeight,
                        backgroundColor: color,
                        borderRadius: "10px 12px 0 0",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-[10px]">
        {legends.map((legend, i) => (
          <div
            key={i}
            className="flex items-center gap-[8px] rounded-[8px] px-[8px] py-[2px]"
          >
            <span
              className="w-[10px] h-[10px] shrink-0"
              style={{ backgroundColor: legend.color }}
            />
            <span className="text-[16px] font-normal leading-[24px] text-report-text-secondary">
              {legend.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
