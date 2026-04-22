"use client";

import { ResponsiveLine } from "@nivo/line";
import { reportNivoTheme, NIVO_TOKEN } from "@/lib/design-system/nivo-theme";
import { CHART_PALETTE } from "@/lib/design-system/chart-spec";

export type MetricType = "nps" | "csat" | "time" | "percent" | "count" | "raw";

export interface TrendLineReference {
  id?: string;
  label?: string;
  value: number;
  unit?: string;
  color?: string;
  contextText?: string;
}

export interface TrendLineSeries {
  id: string;
  values: number[];
  unit?: string;
  color?: string;
  metricType?: MetricType;
}

export interface TrendLineChartData {
  title?: string;
  xLabels: string[];
  series: TrendLineSeries[];
  references?: TrendLineReference[];
  /** @deprecated use `references` */
  benchmarks?: TrendLineReference[];
}

const METRIC_CONFIG: Record<MetricType, {
  minDisplayRange: number | ((max: number) => number);
  bounds: [number, number];
}> = {
  nps:     { minDisplayRange: 10,  bounds: [-100, 100] },
  csat:    { minDisplayRange: 0.5, bounds: [1, 5] },
  time:    { minDisplayRange: (max) => Math.max(2, Math.abs(max) * 0.2), bounds: [0, Infinity] },
  percent: { minDisplayRange: 5,   bounds: [0, 100] },
  count:   { minDisplayRange: (max) => Math.max(Math.abs(max) * 0.2, 1), bounds: [0, Infinity] },
  raw:     { minDisplayRange: 0,   bounds: [-Infinity, Infinity] },
};

function niceStep(range: number): number {
  if (range <= 5)   return 1;
  if (range <= 10)  return 2;
  if (range <= 25)  return 5;
  if (range <= 50)  return 10;
  if (range <= 100) return 20;
  if (range <= 250) return 50;
  return 100;
}

const niceFloor = (v: number, s: number) => Math.floor(v / s) * s;
const niceCeil  = (v: number, s: number) => Math.ceil (v / s) * s;

function computeYScale(values: number[], metricType: MetricType, refs: TrendLineReference[]) {
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const dataRange = dataMax - dataMin;

  const cfg = METRIC_CONFIG[metricType] ?? METRIC_CONFIG.raw;
  const minRange = typeof cfg.minDisplayRange === "function"
    ? cfg.minDisplayRange(dataMax)
    : cfg.minDisplayRange;

  const effectiveRange = Math.max(dataRange, minRange);
  const center = (dataMin + dataMax) / 2;
  const padding = effectiveRange * 0.15 || 1;

  const rawMin = center - effectiveRange / 2 - padding;
  const rawMax = center + effectiveRange / 2 + padding;

  const step = niceStep(effectiveRange) || 1;
  const yMin = Math.max(niceFloor(rawMin, step), cfg.bounds[0]);
  const yMax = Math.min(niceCeil (rawMax, step), cfg.bounds[1]);

  const visibleRefs = refs.filter((r) => r.value >= yMin && r.value <= yMax);
  const outOfRangeRefs = refs.filter((r) => r.value < yMin || r.value > yMax);

  return { yMin, yMax, step, visibleRefs, outOfRangeRefs };
}

/** 시리즈별로 뚜렷하게 구분되는 색상 팔레트 */
const SERIES_COLORS = [
  CHART_PALETTE.blue500,       // #2b7fff
  CHART_PALETTE.lime500,       // #7ccf00
  CHART_PALETTE.deepPurple400, // #9f8deb
  CHART_PALETTE.teal500,       // #00bba7
  CHART_PALETTE.yellow400,     // #fdc700
  CHART_PALETTE.red400,        // #f87171
];

const REF_COLORS = ["#a3a3a3", "#d4a574", "#8fa3bf"];

export default function TrendLineChart({ data }: { data: TrendLineChartData }) {
  const d = data;
  const refs: TrendLineReference[] = d.references ?? d.benchmarks ?? [];

  const metricType: MetricType = d.series[0]?.metricType ?? "raw";
  const allSeriesValues = d.series.flatMap((s) => s.values);
  const { yMin, yMax, step, visibleRefs, outOfRangeRefs } = computeYScale(
    allSeriesValues,
    metricType,
    refs,
  );

  const lineData = d.series.map((s, i) => ({
    id: s.id,
    color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
    data: d.xLabels.map((label, j) => ({
      x: label,
      y: s.values[j] ?? 0,
    })),
  }));

  const refLineData = visibleRefs.map((r, i) => ({
    id: r.label ?? r.id ?? `ref-${i}`,
    color: r.color ?? REF_COLORS[i % REF_COLORS.length],
    data: d.xLabels.map((label) => ({ x: label, y: r.value })),
  }));

  const allData = [...lineData, ...refLineData];
  const allColors = allData.map((s) => s.color);

  const tickValues = Array.from(
    { length: Math.floor((yMax - yMin) / step) + 1 },
    (_, i) => yMin + i * step,
  );

  return (
    <div className="bg-report-card rounded-card p-[24px]">
      {d.title && (
        <p className="text-sm font-semibold text-report-text-primary mb-2">{d.title}</p>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
        {lineData.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <div className="w-3 h-[3px] rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs" style={{ color: s.color, fontWeight: 600 }}>{s.id}</span>
          </div>
        ))}
        {refLineData.map((r) => (
          <div key={`ref-${r.id}`} className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] rounded-full" style={{ backgroundColor: r.color, borderTop: `2px dashed ${r.color}` }} />
            <span className="text-xs" style={{ color: r.color }}>{r.id}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 280 }}>
        <ResponsiveLine
          data={allData}
          margin={{ top: 10, right: 24, bottom: 30, left: 50 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: yMin, max: yMax }}
          colors={allColors}
          lineWidth={2.5}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2.5}
          pointBorderColor={{ from: "serieColor" }}
          enableArea={false}
          enableSlices="x"
          curve="monotoneX"
          axisBottom={{ tickSize: 0, tickPadding: 10 }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickValues,
          }}
          gridYValues={tickValues}
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
                const seriesIdx = allData.findIndex((s) => s.id === point.seriesId);
                const isRef = seriesIdx >= d.series.length;
                const unitStr = isRef
                  ? visibleRefs[seriesIdx - d.series.length]?.unit ?? ""
                  : d.series[seriesIdx]?.unit ?? "";
                return (
                  <div key={point.id} className="flex items-center gap-2 mt-0.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: point.seriesColor }}
                    />
                    <span className="text-xs" style={{ color: point.seriesColor, fontWeight: 600 }}>
                      {point.seriesId}:
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

      {outOfRangeRefs.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {outOfRangeRefs.map((r, i) => {
            const label = r.label ?? r.id ?? `기준선`;
            const unitStr = r.unit ?? "";
            const text = r.contextText
              ? `${label}(${r.value}${unitStr}): ${r.contextText}`
              : `${label}은 현재 범위 밖 (${r.value}${unitStr})`;
            return (
              <p key={`oor-${i}`} className="text-[11px] text-report-text-secondary italic">
                {text}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
