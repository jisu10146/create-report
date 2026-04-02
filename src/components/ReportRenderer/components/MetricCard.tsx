import type { MetricCardData } from "@/types";

export default function MetricCard({ data }: { data: MetricCardData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {data.items.map((item, i) => (
        <div
          key={i}
          className="bg-report-card border border-report-border rounded-card p-4 flex flex-col gap-1 shadow-card"
        >
          <span className="text-sm text-report-text-secondary">{item.label}</span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-2xl text-report-text-primary">{item.value}</span>
            {item.unit && (
              <span className="text-sm text-report-text-secondary">{item.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
