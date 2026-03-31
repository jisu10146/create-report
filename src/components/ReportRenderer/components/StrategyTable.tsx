import type { StrategyTableData } from "@/types";

const PHASES: Array<{ key: keyof StrategyTableData; label: string; color: string }> = [
  { key: "immediate", label: "즉시 (0-2주)", color: "bg-red-50 text-red-700" },
  { key: "short", label: "단기 (1-3개월)", color: "bg-orange-50 text-orange-700" },
  { key: "mid", label: "중기 (3-6개월)", color: "bg-blue-50 text-blue-700" },
];

export default function StrategyTable({ data }: { data: StrategyTableData }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-semibold text-gray-700 w-24">단계</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">실행 항목</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 w-28">담당</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 w-32">측정 지표</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 w-16">우선순위</th>
          </tr>
        </thead>
        <tbody>
          {PHASES.map((phase) =>
            (data[phase.key] ?? []).map((row, i) => (
              <tr
                key={`${phase.key}-${i}`}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                {i === 0 ? (
                  <td
                    rowSpan={data[phase.key].length}
                    className="px-4 py-3 align-top"
                  >
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${phase.color}`}
                    >
                      {phase.label}
                    </span>
                  </td>
                ) : null}
                <td className="px-4 py-3 text-gray-800">{row.action}</td>
                <td className="px-4 py-3 text-gray-600">{row.owner}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{row.metric}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold text-gray-900">{row.priority}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
