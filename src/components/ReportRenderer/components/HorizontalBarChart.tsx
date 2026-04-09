"use client";

import { ResponsiveBar } from "@nivo/bar";
import type { HorizontalBarChartData } from "@/types";
import { CHART_SPECS } from "@/lib/design-system/chart-spec";
import { reportNivoTheme, NIVO_TOKEN } from "@/lib/design-system/nivo-theme";

/**
 * 피그마 기준 색상 규칙:
 * - 1위: blue500 (#2b7fff)
 * - 2위: lime500 (#7ccf00)
 * - 나머지: gray200 (#e6e7e9)
 * - 동점이면 같은 순위 (1위 2개면 둘 다 blue, 다음은 나머지로 gray)
 */
function getRankColor(value: number, sortedValues: number[]): string {
  const spec = CHART_SPECS["HorizontalBarChart:default"];
  const rank1Color = spec.series[0].color; // blue
  const rank2Color = spec.series[1].color; // lime
  const rank3Color = spec.series[2].color; // gray

  const unique = [...new Set(sortedValues)].sort((a, b) => b - a);
  const rank1 = unique[0];
  const rank2 = unique[1];

  if (value === rank1) return rank1Color;
  if (value === rank2) return rank2Color;
  return rank3Color;
}

export default function HorizontalBarChart({ data }: { data: HorizontalBarChartData }) {
  const sortedValues = data.items.map((i) => i.value).sort((a, b) => b - a);

  const chartData = [...data.items]
    .reverse()
    .map((item) => {
      const row: Record<string, string | number> = { label: item.label, value: item.value };
      if (item.count !== undefined) row.count = item.count;
      return row;
    });

  // 라벨 텍스트 길이에 따라 왼쪽 마진 동적 계산 (글자당 ~8px, 최소 80, 최대 240)
  const maxLabelLength = Math.max(...data.items.map((i) => i.label.length));
  const leftMargin = Math.min(240, Math.max(80, maxLabelLength * 8 + 16));

  return (
    <div className="bg-report-card rounded-card p-[24px]">
      {data.question && (
        <p className="text-sm font-semibold text-report-text-primary mb-4">{data.question}</p>
      )}
      <div style={{ height: Math.max(chartData.length * 60, 160) }}>
        <ResponsiveBar
          data={chartData}
          keys={["value"]}
          indexBy="label"
          layout="horizontal"
          margin={{ top: 0, right: 140, bottom: 0, left: leftMargin }}
          padding={0.4}
          valueScale={{ type: "linear", min: 0, max: 100 }}
          colors={(bar) => {
            const val = bar.data.value as number;
            return getRankColor(val, sortedValues);
          }}
          borderRadius={4}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 16,
          }}
          enableLabel={false}
          tooltip={({ value, indexValue, data: d }) => (
            <div className="bg-report-card shadow-elevated rounded-sm px-4 py-3 whitespace-nowrap border border-report-border">
              <div className="text-sm text-report-text-secondary">{indexValue}</div>
              <div className="mt-0.5">
                <span className="text-base font-bold text-report-text-primary">{value}%</span>
                {(d as { count?: number }).count !== undefined && (
                  <span className="text-base text-report-text-secondary"> ({((d as { count?: number }).count ?? 0).toLocaleString()})</span>
                )}
              </div>
            </div>
          )}
          theme={{
            ...reportNivoTheme,
            axis: {
              ...reportNivoTheme.axis,
              ticks: {
                ...reportNivoTheme.axis?.ticks,
                text: {
                  ...(reportNivoTheme.axis?.ticks?.text as object),
                  fill: NIVO_TOKEN.textPrimary,
                },
              },
              domain: {
                line: {
                  stroke: NIVO_TOKEN.border,
                  strokeWidth: 1,
                },
              },
            },
          }}
          layers={[
            "grid",
            "axes",
            "bars",
            /* 바 오른쪽에 값 라벨 렌더링 */
            (props) => {
              return (
                <g>
                  {props.bars.map((bar) => {
                    const d = bar.data.data as { count?: number };
                    const count = d.count;
                    return (
                      <text
                        key={bar.key}
                        x={bar.x + bar.width + 10}
                        y={bar.y + bar.height / 2}
                        dominantBaseline="central"
                        style={{ fontSize: 14 }}
                      >
                        <tspan fontWeight={600} fill={NIVO_TOKEN.textPrimary}>
                          {bar.data.value}%
                        </tspan>
                        {count !== undefined && (
                          <tspan fill={NIVO_TOKEN.textSecondary}>
                            {" "}({count.toLocaleString()})
                          </tspan>
                        )}
                      </text>
                    );
                  })}
                </g>
              );
            },
            "markers",
            "legends",
            "annotations",
          ]}
          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
}
