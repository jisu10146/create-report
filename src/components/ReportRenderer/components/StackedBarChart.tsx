"use client";

import { ResponsiveBar } from "@nivo/bar";
import { reportNivoTheme, NIVO_TOKEN } from "@/lib/report-nivo-theme";
import { CHART_PALETTE } from "@/lib/report-chart-spec";

export interface StackedBarChartData {
  title?: string;
  categories: string[];          // 스택 구성요소 이름 (예: ["배정 대기", "실제 처리"])
  colors?: string[];             // 카테고리별 색상 (없으면 기본 팔레트)
  items: Array<{
    label: string;               // x축 라벨 (예: "기능 오류")
    values: number[];            // categories 순서에 대응하는 값
  }>;
  unit?: string;                 // 값 단위 (예: "h", "%")
}

export default function StackedBarChart({ data }: { data: StackedBarChartData }) {
  const d = data as StackedBarChartData;

  const defaultColors = [CHART_PALETTE.blue500, CHART_PALETTE.lime500, CHART_PALETTE.blueLight, CHART_PALETTE.deepPurple400];
  const colors = d.colors ?? defaultColors;
  const unit = d.unit ?? "";

  // Nivo 형식으로 변환
  const chartData = d.items.map((item) => {
    const row: Record<string, string | number> = { label: item.label };
    d.categories.forEach((cat, i) => {
      row[cat] = item.values[i] ?? 0;
    });
    return row;
  });

  const maxTotal = Math.max(...d.items.map((item) => item.values.reduce((a, b) => a + b, 0)));
  const leftMargin = Math.min(200, Math.max(80, Math.max(...d.items.map((i) => i.label.length)) * 8 + 16));

  return (
    <div className="bg-report-card rounded-card p-[24px]">
      {d.title && (
        <p className="text-sm font-semibold text-report-text-primary mb-4">{d.title}</p>
      )}
      <div style={{ height: Math.max(d.items.length * 64, 200) }}>
        <ResponsiveBar
          data={chartData}
          keys={d.categories}
          indexBy="label"
          layout="horizontal"
          margin={{ top: 0, right: 120, bottom: 0, left: leftMargin }}
          padding={0.35}
          valueScale={{ type: "linear", min: 0, max: Math.ceil(maxTotal * 1.1) }}
          colors={(bar) => {
            const idx = d.categories.indexOf(bar.id as string);
            return colors[idx % colors.length];
          }}
          borderRadius={0}
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
          tooltip={({ id, value, indexValue }) => (
            <div className="bg-report-card shadow-elevated rounded-sm px-4 py-3 whitespace-nowrap border border-report-border">
              <div className="text-sm text-report-text-secondary">{indexValue}</div>
              <div className="mt-0.5">
                <span className="text-sm font-semibold text-report-text-primary">{String(id)}: </span>
                <span className="text-sm font-bold text-report-text-primary">{value}{unit}</span>
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
            },
          }}
          layers={[
            "grid",
            "axes",
            "bars",
            /* 바 오른쪽에 합계 라벨 */
            (props) => {
              const grouped: Record<string, number> = {};
              const barPositions: Record<string, { x: number; y: number; height: number }> = {};
              for (const bar of props.bars) {
                const idx = bar.data.indexValue as string;
                grouped[idx] = (grouped[idx] ?? 0) + (bar.data.value as number);
                if (!barPositions[idx] || bar.x + bar.width > (barPositions[idx]?.x ?? 0)) {
                  barPositions[idx] = { x: bar.x + bar.width, y: bar.y, height: bar.height };
                }
              }
              return (
                <g>
                  {Object.entries(barPositions).map(([idx, pos]) => (
                    <text
                      key={idx}
                      x={pos.x + 10}
                      y={pos.y + pos.height / 2}
                      dominantBaseline="central"
                      style={{ fontSize: 13, fontWeight: 600 }}
                      fill={NIVO_TOKEN.textPrimary}
                    >
                      {grouped[idx]?.toFixed(1)}{unit}
                    </text>
                  ))}
                </g>
              );
            },
            "markers",
            "legends",
            "annotations",
          ]}
          legends={[
            {
              dataFrom: "keys",
              anchor: "top-right",
              direction: "row",
              translateY: -20,
              itemWidth: 100,
              itemHeight: 20,
              symbolSize: 12,
              symbolShape: "circle",
            },
          ]}
          animate={true}
          motionConfig="gentle"
        />
      </div>
      {/* 범례 (fallback) */}
      <div className="flex gap-5 mt-3 justify-center">
        {d.categories.map((cat, i) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-xs" style={{ color: NIVO_TOKEN.textSecondary }}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
