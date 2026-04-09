"use client";

import { ResponsiveLine } from "@nivo/line";
import { reportNivoTheme, NIVO_TOKEN } from "@/lib/report-nivo-theme";
import { CHART_PALETTE } from "@/lib/report-chart-spec";

export interface TrendLineChartData {
  title?: string;
  xLabels: string[];
  series: Array<{
    id: string;
    values: number[];
    unit?: string;
    color?: string;
  }>;
  benchmarks?: Array<{
    id: string;
    value: number;
    unit?: string;
    color?: string;
  }>;
}

/** 시리즈별로 뚜렷하게 구분되는 색상 팔레트 */
const SERIES_COLORS = [
  CHART_PALETTE.blue500,       // #2b7fff — 파랑
  CHART_PALETTE.lime500,       // #7ccf00 — 연두
  CHART_PALETTE.deepPurple400, // #9f8deb — 보라
  CHART_PALETTE.teal500,       // #00bba7 — 청록
  CHART_PALETTE.yellow400,     // #fdc700 — 노랑
  CHART_PALETTE.red400,        // #f87171 — 빨강
];

const BENCHMARK_COLORS = [
  "#a3a3a3", // gray
  "#d4a574", // muted orange
  "#8fa3bf", // muted blue
];

export default function TrendLineChart({ data }: { data: TrendLineChartData }) {
  const d = data as TrendLineChartData;

  // 시리즈 데이터 → Nivo 형식
  const lineData = d.series.map((s, i) => ({
    id: s.id,
    color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
    data: d.xLabels.map((label, j) => ({
      x: label,
      y: s.values[j] ?? 0,
    })),
  }));

  // 벤치마크 → 점선 시리즈
  const benchmarkData = (d.benchmarks ?? []).map((b, i) => ({
    id: b.id,
    color: b.color ?? BENCHMARK_COLORS[i % BENCHMARK_COLORS.length],
    data: d.xLabels.map((label) => ({
      x: label,
      y: b.value,
    })),
  }));

  const allData = [...lineData, ...benchmarkData];
  const allColors = allData.map((s) => s.color);

  // y축 범위
  const allValues = [
    ...d.series.flatMap((s) => s.values),
    ...(d.benchmarks ?? []).map((b) => b.value),
  ];
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const padding = (maxY - minY) * 0.15 || 1;

  return (
    <div className="bg-report-card rounded-card p-[24px]">
      {d.title && (
        <p className="text-sm font-semibold text-report-text-primary mb-2">{d.title}</p>
      )}

      {/* 커스텀 범례 — 색상별로 명확히 구분 */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
        {lineData.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <div className="w-3 h-[3px] rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs" style={{ color: s.color, fontWeight: 600 }}>{s.id}</span>
          </div>
        ))}
        {benchmarkData.map((b) => (
          <div key={b.id} className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] rounded-full" style={{ backgroundColor: b.color, borderTop: `2px dashed ${b.color}` }} />
            <span className="text-xs" style={{ color: b.color }}>{b.id}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 280 }}>
        <ResponsiveLine
          data={allData}
          margin={{ top: 10, right: 24, bottom: 30, left: 50 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: Math.floor(minY - padding),
            max: Math.ceil(maxY + padding),
          }}
          colors={allColors}
          lineWidth={2.5}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2.5}
          pointBorderColor={{ from: "serieColor" }}
          enableArea={false}
          enableSlices="x"
          curve="monotoneX"
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickValues: 5,
          }}
          enableGridX={false}
          enableGridY={true}
          theme={{
            ...reportNivoTheme,
            axis: {
              ...reportNivoTheme.axis,
              ticks: {
                ...reportNivoTheme.axis?.ticks,
                text: {
                  ...(reportNivoTheme.axis?.ticks?.text as object),
                  fill: NIVO_TOKEN.textSecondary,
                },
              },
            },
          }}
          sliceTooltip={({ slice }) => (
            <div className="bg-report-card shadow-elevated rounded-sm px-4 py-3 border border-report-border">
              <div className="text-sm font-semibold text-report-text-primary mb-1">
                {String(slice.points[0]?.data.x ?? "")}
              </div>
              {slice.points.map((point) => {
                const seriesIdx = allData.findIndex((s) => s.id === point.serieId);
                const isBenchmark = seriesIdx >= d.series.length;
                const unitStr = isBenchmark
                  ? d.benchmarks?.[seriesIdx - d.series.length]?.unit ?? ""
                  : d.series[seriesIdx]?.unit ?? "";
                return (
                  <div key={point.id} className="flex items-center gap-2 mt-0.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: point.serieColor }}
                    />
                    <span className="text-xs" style={{ color: point.serieColor, fontWeight: 600 }}>
                      {point.serieId}:
                    </span>
                    <span className="text-xs font-bold text-report-text-primary">
                      {String(point.data.yFormatted)}{unitStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          layers={[
            "grid",
            "markers",
            "axes",
            "areas",
            "crosshair",
            /* 벤치마크 점선 레이어 */
            ({ series, lineGenerator }) => (
              <g>
                {series.slice(d.series.length).map((s) => {
                  const pathData = lineGenerator(
                    s.data.map((pt) => ({ x: pt.position.x, y: pt.position.y }))
                  );
                  return (
                    <path
                      key={s.id}
                      d={pathData ?? ""}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      opacity={0.7}
                    />
                  );
                })}
              </g>
            ),
            "lines",
            "points",
            "slices",
            "mesh",
          ]}
          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
}
