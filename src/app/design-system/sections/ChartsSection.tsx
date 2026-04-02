"use client";

import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { Badge } from "@cubig/design-system";
import { CHART_SPECS, type ChartSpec } from "@/lib/report-chart-spec";

function generateDonutData(spec: ChartSpec) {
  const values = spec.series.map(() => Math.floor(Math.random() * 40) + 10);
  const total = values.reduce((a, b) => a + b, 0);
  return spec.series.map((s, i) => ({
    id: s.name,
    label: s.name,
    value: Math.round((values[i] / total) * 100),
    color: s.color,
  }));
}

function generateBarData(spec: ChartSpec) {
  const categories = ["Category A", "Category B", "Category C", "Category D"];
  if (spec.series.length <= 3 && spec.chartType !== "stacked-bar") {
    return spec.series.map((s) => ({
      label: s.name,
      value: Math.floor(Math.random() * 80) + 20,
    }));
  }
  return categories.map((cat) => {
    const row: Record<string, string | number> = { label: cat };
    spec.series.forEach((s) => {
      row[s.name] = Math.floor(Math.random() * 80) + 20;
    });
    return row;
  });
}

function DonutChart({ spec }: { spec: ChartSpec }) {
  const data = generateDonutData(spec);
  return (
    <div style={{ height: 240 }}>
      <ResponsivePie
        data={data}
        innerRadius={0.6}
        padAngle={2}
        cornerRadius={3}
        colors={spec.series.map((s) => s.color)}
        enableArcLabels={true}
        arcLabelsTextColor="#ffffff"
        enableArcLinkLabels={false}
        isInteractive={true}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      />
    </div>
  );
}

function BarChart({ spec }: { spec: ChartSpec }) {
  const isHorizontal = spec.direction === "horizontal";
  const isSingleSeries = spec.chartType !== "stacked-bar" && spec.series.length <= 3;

  const data = isSingleSeries
    ? spec.series.map((s) => ({
        label: s.name,
        value: Math.floor(Math.random() * 80) + 20,
      }))
    : ["A", "B", "C"].map((cat) => {
        const row: Record<string, string | number> = { label: `Group ${cat}` };
        spec.series.forEach((s) => {
          row[s.name] = Math.floor(Math.random() * 80) + 20;
        });
        return row;
      });

  const keys = isSingleSeries ? ["value"] : spec.series.map((s) => s.name);

  const colorMap: Record<string, string> = {};
  spec.series.forEach((s, i) => {
    if (isSingleSeries) {
      colorMap[data[i]?.label as string] = s.color;
    } else {
      colorMap[s.name] = s.color;
    }
  });

  return (
    <div style={{ height: Math.max(data.length * 52, 200) }}>
      <ResponsiveBar
        data={isHorizontal ? [...data].reverse() : data}
        keys={keys}
        indexBy="label"
        layout={isHorizontal ? "horizontal" : "vertical"}
        margin={
          isHorizontal
            ? { top: 0, right: 50, bottom: 0, left: 160 }
            : { top: 10, right: 10, bottom: 40, left: 40 }
        }
        padding={0.35}
        colors={(bar) => {
          if (isSingleSeries) {
            return colorMap[bar.indexValue as string] ?? "#ccc";
          }
          return colorMap[bar.id as string] ?? "#ccc";
        }}
        borderRadius={4}
        enableGridX={false}
        enableGridY={false}
        axisTop={null}
        axisRight={null}
        axisBottom={isHorizontal ? null : { tickSize: 0, tickPadding: 8 }}
        axisLeft={isHorizontal ? { tickSize: 0, tickPadding: 12 } : { tickSize: 0, tickPadding: 8 }}
        label={(d) => `${d.value}`}
        labelSkipWidth={24}
        labelSkipHeight={16}
        labelTextColor="#ffffff"
        animate={true}
        motionConfig="gentle"
        theme={{
          axis: { ticks: { text: { fontSize: 12, fill: "#7b7e85" } } },
        }}
      />
    </div>
  );
}

export default function ChartsSection() {
  const entries = Object.entries(CHART_SPECS);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-report-text-primary mb-1">Charts</h2>
        <p className="text-sm text-report-text-secondary">
          report-chart-spec.ts 기반 차트 렌더링. 더미 데이터로 시각화합니다.
        </p>
      </div>

      <div className="space-y-6">
        {entries.map(([name, spec]) => (
          <div
            key={name}
            className="bg-report-card border border-report-border rounded-card p-5 shadow-card"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-report-text-primary">{name}</h3>
              {spec.confident === false && (
                <Badge variant="cautionary" type="solid" size="small" text="검수 필요" />
              )}
            </div>
            <div className="flex gap-3 text-xs text-report-text-secondary mb-4">
              <span className="font-mono bg-report-bg px-2 py-0.5 rounded-chip">{spec.chartType}</span>
              <span className="font-mono bg-report-bg px-2 py-0.5 rounded-chip">{spec.direction}</span>
            </div>

            {/* Chart */}
            {spec.chartType === "donut" ? (
              <DonutChart spec={spec} />
            ) : (
              <BarChart spec={spec} />
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-report-border">
              {spec.series.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-report-text-primary">{s.name}</span>
                  <span className="text-xs font-mono text-report-text-muted">{s.color}</span>
                  {s.confident === false && (
                    <Badge variant="cautionary" type="solid" size="small" text="추정" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
