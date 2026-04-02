"use client";

import { ResponsiveBar } from "@nivo/bar";
import type { RevenueScenarioBarData } from "@/types";
import { CHART_SPECS } from "@/lib/report-chart-spec";
import { reportNivoTheme } from "@/lib/report-nivo-theme";

const spec = CHART_SPECS["RevenueScenarioBar:default"];
const SCENARIO_COLORS: Record<string, string> = Object.fromEntries(
  spec.series.map((s) => [s.name, s.color])
);

export default function RevenueScenarioBar({ data }: { data: RevenueScenarioBarData }) {
  const chartData = [...data.scenarios].reverse().map((s) => ({
    label: s.label,
    value: s.value,
    description: s.description ?? "",
  }));

  const maxVal = Math.max(...data.scenarios.map((s) => s.value));

  return (
    <div className="bg-report-card border border-report-border rounded-card p-5 shadow-card">
      <div style={{ height: Math.max(chartData.length * 64, 160) }}>
        <ResponsiveBar
          data={chartData}
          keys={["value"]}
          indexBy="label"
          layout="horizontal"
          margin={{ top: 0, right: 80, bottom: 0, left: 100 }}
          padding={0.4}
          valueScale={{ type: "linear", min: 0, max: maxVal * 1.15 }}
          colors={(bar) => {
            const d = bar.data as (typeof chartData)[number];
            return SCENARIO_COLORS[d.label] ?? "#9ca3af";
          }}
          borderRadius={6}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 16,
          }}
          label={(d) => {
            const unit = data.unit ? ` ${data.unit}` : "";
            return `${d.value}${unit}`;
          }}
          labelSkipWidth={32}
          labelTextColor={"#ffffff"}
          tooltip={({ value, indexValue }) => {
            const scenario = data.scenarios.find((s) => s.label === indexValue);
            return (
              <div className="bg-report-card shadow-elevated rounded-sm px-3 py-2 text-sm border border-report-border">
                <strong>{indexValue}</strong>: {value}
                {data.unit && ` ${data.unit}`}
                {scenario?.description && (
                  <p className="text-report-text-secondary text-xs mt-1">{scenario.description}</p>
                )}
              </div>
            );
          }}
          theme={{
            ...reportNivoTheme,
            axis: {
              ...reportNivoTheme.axis,
              ticks: {
                ...reportNivoTheme.axis?.ticks,
                text: {
                  ...(reportNivoTheme.axis?.ticks?.text as object),
                  fontWeight: 600,
                },
              },
            },
          }}
          animate={true}
          motionConfig="gentle"
        />
      </div>
      {/* Descriptions below chart */}
      {data.scenarios.some((s) => s.description) && (
        <div className="mt-3 space-y-1">
          {data.scenarios.map((s) =>
            s.description ? (
              <p key={s.label} className="text-xs text-report-text-secondary">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: SCENARIO_COLORS[s.label] ?? "#9ca3af" }}
                />
                <span className="font-medium text-report-text-primary">{s.label}:</span> {s.description}
              </p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
