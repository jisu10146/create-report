"use client";

import { useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { CHART_COLOR_SEQUENCE, CHART_PALETTE } from "@/lib/design-system/chart-spec";
import { reportNivoTheme } from "@/lib/design-system/nivo-theme";

export interface DonutChartItem {
  label: string;
  value: number;
  count?: number;
  isOther?: boolean;
}

export interface DonutChartData {
  title?: string;
  items: DonutChartItem[];
}

const OTHERS_COLOR = CHART_PALETTE.gray200;

/** hex color에 alpha를 적용해서 rgba로 변환 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function DonutChart({ data }: { data: DonutChartData }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const pieData = data.items.map((item, i) => ({
    id: item.label,
    label: item.label,
    value: item.value,
    count: item.count,
    baseColor: item.isOther ? OTHERS_COLOR : CHART_COLOR_SEQUENCE[i] ?? OTHERS_COLOR,
  }));

  // hover 시 다른 항목은 40% opacity (60% 투명)
  const colors = pieData.map((d) => {
    if (hoveredId === null) return d.baseColor;
    return d.id === hoveredId ? d.baseColor : hexToRgba(d.baseColor, 0.4);
  });

  return (
    <div className="bg-report-card border border-report-border rounded-card p-[24px] h-full flex flex-col items-center justify-center">
      {data.title && (
        <p className="text-base font-semibold text-report-text-primary text-center mb-4">
          {data.title}
        </p>
      )}
      <div className="flex items-center gap-[40px]">
        {/* Donut */}
        <div className="w-[200px] h-[200px] shrink-0">
          <ResponsivePie
            data={pieData}
            innerRadius={0.6}
            padAngle={1.5}
            cornerRadius={2}
            colors={colors}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            isInteractive={true}
            theme={reportNivoTheme}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            onMouseEnter={(datum) => setHoveredId(datum.id as string)}
            onMouseLeave={() => setHoveredId(null)}
            tooltip={({ datum }) => {
              const item = pieData.find((d) => d.id === datum.id);
              return (
                <div className="bg-report-card rounded-sm shadow-elevated px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-report-text-secondary">{datum.label}</div>
                  <div className="mt-0.5">
                    <span className="text-base font-bold text-report-text-primary">
                      {datum.value}%
                    </span>
                    {item?.count !== undefined && (
                      <span className="text-base text-report-text-secondary">
                        ({item.count.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
              );
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-[10px] flex-1">
          {pieData.map((item, i) => (
            <div key={i} className="flex items-center gap-[10px]">
              <span
                className="w-[10px] h-[10px] rounded-full shrink-0"
                style={{ backgroundColor: item.baseColor }}
              />
              <span className="text-sm font-medium text-report-text-primary min-w-[100px]">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-report-text-primary">
                {item.value}%
              </span>
              {item.count !== undefined && (
                <span className="text-sm text-report-text-secondary">
                  ({item.count.toLocaleString()})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
