"use client";

import { useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { CHART_COLOR_SEQUENCE, CHART_PALETTE } from "@/lib/report-chart-spec";
import { reportNivoTheme } from "@/lib/report-nivo-theme";
import type { PieBarChartData } from "@/types";

/**
 * PieBarChart — 피그마 pie chart + bar chart (6:1730)
 *
 * 카드: bg #ffffff, radius 16, padding 50/0, gap 50 (vertical)
 * 내부: horizontal, gap 160
 *   - pie chart: title 18px/500 + pie (nivo donut)
 *   - bar chart: title 18px/500 + bar (nivo bar)
 * 하단 legend: horizontal, gap 10
 *
 * hover/tooltip: DonutChart 패턴 적용
 *   - hover 시 다른 항목 40% opacity
 *   - tooltip: bg #ffffff, rounded-sm, shadow-elevated
 */

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function PieBarChart({ data }: { data: PieBarChartData }) {
  const [hoveredPieId, setHoveredPieId] = useState<string | null>(null);
  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);

  const pieData = data.pieItems.map((item, i) => ({
    id: item.label,
    label: item.label,
    value: item.value,
    baseColor: item.color ?? CHART_COLOR_SEQUENCE[i] ?? CHART_PALETTE.gray200,
  }));

  const barData = data.barItems.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  const barBaseColors = data.barItems.map(
    (item, i) => item.color ?? CHART_COLOR_SEQUENCE[i] ?? CHART_PALETTE.gray200
  );

  const pieColors = pieData.map((d) => {
    if (hoveredPieId === null) return d.baseColor;
    return d.id === hoveredPieId ? d.baseColor : hexToRgba(d.baseColor, 0.4);
  });

  const legends = data.legends ?? data.pieItems.map((item, i) => ({
    label: item.label,
    color: item.color ?? CHART_COLOR_SEQUENCE[i] ?? CHART_PALETTE.gray200,
  }));

  return (
    <div className="bg-report-card rounded-card py-[50px] flex flex-col gap-[50px]">
      <div className="flex justify-center gap-[160px] px-[40px]">
        {/* Pie chart */}
        <div className="flex flex-col gap-[40px] items-center">
          {data.pieTitle && (
            <span className="text-[18px] font-medium leading-[26px] text-report-text-primary">
              {data.pieTitle}
            </span>
          )}
          <div className="w-[200px] h-[200px]">
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

        {/* Bar chart */}
        <div className="flex flex-col gap-[40px] flex-1 max-w-[490px]">
          {data.barTitle && (
            <span className="text-[18px] font-medium leading-[26px] text-report-text-primary">
              {data.barTitle}
            </span>
          )}
          <div className="h-[280px]">
            <ResponsiveBar
              data={barData}
              keys={["value"]}
              indexBy="label"
              colors={(bar) => {
                const baseColor = barBaseColors[bar.index] ?? CHART_PALETTE.gray200;
                if (hoveredBarId === null) return baseColor;
                return bar.data.label === hoveredBarId ? baseColor : hexToRgba(baseColor, 0.4);
              }}
              theme={reportNivoTheme}
              enableLabel={false}
              enableGridY={true}
              enableGridX={false}
              borderRadius={4}
              padding={0.4}
              margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
              axisBottom={{
                tickSize: 0,
                tickPadding: 12,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 12,
              }}
              onMouseEnter={(bar) => setHoveredBarId(bar.data.label as string)}
              onMouseLeave={() => setHoveredBarId(null)}
              tooltip={({ indexValue, value }) => (
                <div className="bg-report-card rounded-sm shadow-elevated px-4 py-3 whitespace-nowrap border border-report-border">
                  <div className="text-sm text-report-text-secondary">{indexValue}</div>
                  <div className="mt-0.5">
                    <span className="text-base font-bold text-report-text-primary">
                      {value}%
                    </span>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-[10px]">
        {legends.map((legend, i) => (
          <div
            key={i}
            className="flex items-center gap-[8px] rounded-[8px] px-[8px] py-[2px]"
          >
            <span
              className="w-[10px] h-[10px] rounded-full shrink-0"
              style={{ backgroundColor: legend.color }}
            />
            <span className="text-[14px] font-medium text-report-text-primary">
              {legend.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
