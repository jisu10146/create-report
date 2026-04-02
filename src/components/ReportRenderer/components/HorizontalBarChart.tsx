"use client";

import { ResponsiveBar } from "@nivo/bar";
import type { HorizontalBarChartData } from "@/types";
import { CHART_SPECS } from "@/lib/report-chart-spec";
import { reportNivoTheme, NIVO_TOKEN } from "@/lib/report-nivo-theme";

export default function HorizontalBarChart({ data }: { data: HorizontalBarChartData }) {
  const maxVal = Math.max(...data.items.map((i) => i.value));

  const chartData = [...data.items]
    .reverse()
    .map((item) => ({
      label: item.label,
      value: item.value,
    }));

  const topLabels = new Set(
    data.items.filter((i) => i.value === maxVal).map((i) => i.label)
  );

  const spec = CHART_SPECS["HorizontalBarChart:default"];
  const topColor = spec.series[0].color;
  const otherColor = spec.series[1].color;

  return (
    <div className="bg-report-card border border-report-border rounded-card p-5 shadow-card">
      {data.question && (
        <p className="text-sm font-semibold text-report-text-primary mb-3">{data.question}</p>
      )}
      <div style={{ height: Math.max(chartData.length * 44, 160) }}>
        <ResponsiveBar
          data={chartData}
          keys={["value"]}
          indexBy="label"
          layout="horizontal"
          margin={{ top: 0, right: 50, bottom: 0, left: 140 }}
          padding={0.35}
          valueScale={{ type: "linear", min: 0, max: 100 }}
          colors={(bar) => {
            return topLabels.has(bar.indexValue as string) ? topColor : otherColor;
          }}
          borderRadius={4}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 12,
          }}
          label={(d) => `${d.value}%`}
          labelSkipWidth={24}
          labelTextColor={(d) => {
            return topLabels.has(d.data.indexValue as string) ? "#ffffff" : NIVO_TOKEN.textPrimary;
          }}
          tooltip={({ value, indexValue }) => (
            <div className="bg-report-card shadow-elevated rounded-sm px-3 py-2 text-sm border border-report-border">
              <strong>{indexValue}</strong>: {value}%
            </div>
          )}
          theme={reportNivoTheme}
          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
}
