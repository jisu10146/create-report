import { Badge } from "@cubig/design-system";
import type { StrategyTableData } from "@/types";
import type { BadgeVariant } from "@cubig/design-system";

const PHASES: Array<{ key: keyof StrategyTableData; label: string; variant: BadgeVariant }> = [
  { key: "immediate", label: "즉시 (0-2주)", variant: "negative" },
  { key: "short", label: "단기 (1-3개월)", variant: "cautionary" },
  { key: "mid", label: "중기 (3-6개월)", variant: "info" },
];

export default function StrategyTable({ data }: { data: StrategyTableData }) {
  return (
    <div className="bg-report-card border border-report-border rounded-card overflow-hidden shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-report-border bg-report-bg">
            <th className="text-left px-4 py-3 font-semibold text-report-text-secondary w-28">단계</th>
            <th className="text-left px-4 py-3 font-semibold text-report-text-secondary">실행 항목</th>
            <th className="text-left px-4 py-3 font-semibold text-report-text-secondary w-28">담당</th>
            <th className="text-left px-4 py-3 font-semibold text-report-text-secondary w-32">측정 지표</th>
            <th className="text-left px-4 py-3 font-semibold text-report-text-secondary w-16">우선순위</th>
          </tr>
        </thead>
        <tbody>
          {PHASES.map((phase) =>
            (data[phase.key] ?? []).map((row, i) => (
              <tr
                key={`${phase.key}-${i}`}
                className="border-b border-report-border last:border-b-0 hover:bg-report-bg"
              >
                {i === 0 ? (
                  <td
                    rowSpan={data[phase.key].length}
                    className="px-4 py-3 align-top"
                  >
                    <Badge variant={phase.variant} type="solid" size="small" text={phase.label} />
                  </td>
                ) : null}
                <td className="px-4 py-3 text-report-text-primary">{row.action}</td>
                <td className="px-4 py-3 text-report-text-secondary">{row.owner}</td>
                <td className="px-4 py-3 text-report-text-secondary text-xs">{row.metric}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold text-report-text-primary">{row.priority}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
