import type { MetricCardData } from "@/types";

export default function MetricCard({ data }: { data: MetricCardData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {data.items.map((item, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="text-sm text-gray-500">{item.label}</span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-2xl text-gray-900">{item.value}</span>
            {item.unit && (
              <span className="text-sm text-gray-500">{item.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
