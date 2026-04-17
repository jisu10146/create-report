import type { StrategyTableData } from "@/types";

/**
 * StrategyTable — 피그마 raw 데이터 기준
 *
 * 테이블: cornerRadius 16, bg #ffffff
 * header: bg #fbfbfb, border #e6e7e9, 텍스트 16px/400 #7b7e85
 * Phase 뱃지: radius 8, padding 8/4, 14px/500
 * Phase sub: 18px/600 #0f0f0f
 * Cell: padding 16, 텍스트 16px/400 #171719
 * Phase 컬럼: 232px, body 컬럼: 균등 분할
 */

const PHASE_BADGE = { bg: "#eff6ff", text: "#2b7fff" };
const STRATEGY_BADGE = { bg: "#f3f4f6", text: "#171719" };

const PHASES: Array<{
  key: keyof StrategyTableData;
  label: string;
  sub: string;
}> = [
  { key: "immediate", label: "Immediate", sub: "within 1 week" },
  { key: "short", label: "Short-term", sub: "within 1 month" },
  { key: "mid", label: "Mid-term", sub: "within 3 months" },
];

const COLUMNS = ["Strategy", "Objective", "Action Plan", "Expected Impact"];

/** \n이 포함된 텍스트를 불렛 리스트로 렌더링 */
function CellText({ text }: { text: string }) {
  if (!text.includes("\n")) return <>{text}</>;
  const lines = text.split("\n").filter(Boolean);
  return (
    <ul className="list-none space-y-[4px] m-0 p-0">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-[6px]">
          <span className="mt-[10px] w-[4px] h-[4px] rounded-full bg-report-text-muted shrink-0" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function PhaseBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="inline-flex items-center text-[14px] font-medium leading-[20px] rounded-[8px] px-[8px] py-[4px]"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}

export default function StrategyTable({ data }: { data: StrategyTableData }) {
  return (
    <div className="bg-report-card border border-report-border rounded-card overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: 232 }} />
          {COLUMNS.map((_, i) => (
            <col key={i} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ backgroundColor: "#fbfbfb" }} className="border-b border-report-border">
            <th className="px-[16px] py-[16px]" />
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="text-left px-[16px] py-[16px] text-[16px] font-normal leading-[24px]"
                style={{ color: "#7b7e85" }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PHASES.map((phase) => {
            const rows = data[phase.key] ?? [];
            if (rows.length === 0) return null;
            return rows.map((row, i) => (
              <tr
                key={`${phase.key}-${i}`}
                className={`border-b border-report-border last:border-b-0 ${i > 0 ? "" : ""}`}
              >
                {i === 0 && (
                  <td
                    rowSpan={rows.length}
                    className="px-[16px] py-[16px] align-top border-r border-report-border"
                  >
                    <div className="flex flex-col items-start gap-[6px]">
                      <PhaseBadge label={phase.label} bg={PHASE_BADGE.bg} color={PHASE_BADGE.text} />
                      <span
                        className="text-[18px] font-semibold leading-[26px]"
                        style={{ color: "#0f0f0f" }}
                      >
                        {phase.sub}
                      </span>
                    </div>
                  </td>
                )}
                <td className="px-[16px] py-[16px] align-top">
                  <span
                    className="inline-flex items-center text-[14px] font-medium leading-[20px] rounded-[8px] px-[8px] py-[4px]"
                    style={{ backgroundColor: STRATEGY_BADGE.bg, color: STRATEGY_BADGE.text }}
                  >
                    {row.strategy}
                  </span>
                </td>
                <td
                  className="px-[16px] py-[18px] text-[16px] font-normal leading-[24px] align-top"
                  style={{ color: "#171719" }}
                >
                  {row.objective}
                </td>
                <td
                  className="px-[16px] py-[18px] text-[16px] font-normal leading-[24px] align-top"
                  style={{ color: "#171719" }}
                >
                  <CellText text={row.actionPlan} />
                </td>
                <td
                  className="px-[16px] py-[18px] text-[16px] font-normal leading-[24px] align-top"
                  style={{ color: "#171719" }}
                >
                  <CellText text={row.expectedImpact} />
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}
