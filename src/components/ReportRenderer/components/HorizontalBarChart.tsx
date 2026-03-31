import type { HorizontalBarChartData } from "@/types";

export default function HorizontalBarChart({ data }: { data: HorizontalBarChartData }) {
  const maxVal = Math.max(...data.items.map((i) => i.value));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {data.question && (
        <p className="text-sm font-semibold text-gray-900 mb-4">{data.question}</p>
      )}
      <div className="space-y-3">
        {data.items.map((item, i) => {
          const isTop = item.value === maxVal;
          return (
            <div key={i} className="flex items-center gap-3">
              <span
                className={`text-sm w-36 shrink-0 text-right ${
                  isTop ? "font-semibold text-gray-900" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
              <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                <div
                  className={`h-6 rounded-md transition-all ${
                    isTop ? "bg-gray-900" : "bg-gray-300"
                  }`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span
                className={`text-sm w-10 shrink-0 ${
                  isTop ? "font-bold text-gray-900" : "text-gray-500"
                }`}
              >
                {item.value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
