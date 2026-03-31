import type { RevenueScenarioBarData } from "@/types";

const SCENARIO_STYLES: Record<string, { bar: string; label: string }> = {
  Upside: { bar: "bg-green-500", label: "text-green-700" },
  Base: { bar: "bg-gray-700", label: "text-gray-700" },
  Downside: { bar: "bg-red-400", label: "text-red-600" },
};

export default function RevenueScenarioBar({ data }: { data: RevenueScenarioBarData }) {
  const maxVal = Math.max(...data.scenarios.map((s) => s.value));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="space-y-4">
        {data.scenarios.map((scenario) => {
          const style = SCENARIO_STYLES[scenario.label] ?? {
            bar: "bg-gray-400",
            label: "text-gray-700",
          };
          const pct = maxVal > 0 ? (scenario.value / maxVal) * 100 : 0;

          return (
            <div key={scenario.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-semibold ${style.label}`}>
                  {scenario.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-xl text-gray-900">{scenario.value}</span>
                  {data.unit && (
                    <span className="text-xs text-gray-500">{data.unit}</span>
                  )}
                </div>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`h-8 rounded-lg transition-all ${style.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {scenario.description && (
                <p className="text-xs text-gray-500 mt-1">{scenario.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
