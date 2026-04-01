"use client";

import { ResponsiveBar } from "@nivo/bar";
import type { HorizontalBarChartData } from "@/types";

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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {data.question && (
        <p className="text-sm font-semibold text-gray-900 mb-3">{data.question}</p>
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
            return topLabels.has(bar.indexValue as string) ? "#111827" : "#d1d5db";
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
            return topLabels.has(d.data.indexValue as string) ? "#ffffff" : "#374151";
          }}
          tooltip={({ value, indexValue }) => (
            <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-sm border border-gray-200">
              <strong>{indexValue}</strong>: {value}%
            </div>
          )}
          theme={{
            axis: {
              ticks: {
                text: { fontSize: 13, fill: "#4b5563" },
              },
            },
          }}
          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
}
