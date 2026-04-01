"use client";

import { ResponsiveBar } from "@nivo/bar";
import type { RevenueScenarioBarData } from "@/types";

const SCENARIO_COLORS: Record<string, string> = {
  Upside: "#22c55e",
  Base: "#374151",
  Downside: "#f87171",
};

export default function RevenueScenarioBar({ data }: { data: RevenueScenarioBarData }) {
  const chartData = [...data.scenarios].reverse().map((s) => ({
    label: s.label,
    value: s.value,
    description: s.description ?? "",
  }));

  const maxVal = Math.max(...data.scenarios.map((s) => s.value));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
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
          labelTextColor="#ffffff"
          tooltip={({ value, indexValue }) => {
            const scenario = data.scenarios.find((s) => s.label === indexValue);
            return (
              <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-sm border border-gray-200">
                <strong>{indexValue}</strong>: {value}
                {data.unit && ` ${data.unit}`}
                {scenario?.description && (
                  <p className="text-gray-500 text-xs mt-1">{scenario.description}</p>
                )}
              </div>
            );
          }}
          theme={{
            axis: {
              ticks: {
                text: { fontSize: 13, fontWeight: 600, fill: "#374151" },
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
              <p key={s.label} className="text-xs text-gray-500">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: SCENARIO_COLORS[s.label] ?? "#9ca3af" }}
                />
                <span className="font-medium text-gray-600">{s.label}:</span> {s.description}
              </p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
