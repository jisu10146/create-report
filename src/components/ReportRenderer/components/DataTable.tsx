"use client";

import { CHART_COLOR_SEQUENCE, CHART_PALETTE } from "@/lib/report-chart-spec";

export interface DataTableColumn {
  label: string;
  color?: string;
}

export interface DataTableRow {
  metric: string;
  values: (string | number)[];
}

export interface DataTableData {
  columns: DataTableColumn[];
  rows: DataTableRow[];
}

export default function DataTable({ data }: { data: DataTableData }) {
  return (
    <table className="w-full">
      {/* Header */}
      <thead>
        <tr className="border-b border-report-border">
          <th className="text-left py-[16px] pr-[24px]" />
          {data.columns.map((col, i) => (
            <th key={i} className="text-center py-[16px] px-[16px]">
              <div className="flex items-center justify-center gap-[8px]">
                <span
                  className="w-[10px] h-[10px] rounded-full shrink-0"
                  style={{ backgroundColor: col.color ?? CHART_COLOR_SEQUENCE[i] ?? CHART_PALETTE.gray200 }}
                />
                <span className="text-sm font-medium text-report-text-primary">
                  {col.label}
                </span>
              </div>
            </th>
          ))}
        </tr>
      </thead>

      {/* Body */}
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i} className="border-b border-report-border last:border-b-0">
            <td className="text-sm text-report-text-secondary py-[16px] pr-[24px] whitespace-nowrap">
              {row.metric}
            </td>
            {row.values.map((val, j) => (
              <td key={j} className="text-center text-base font-semibold text-report-text-primary py-[16px] px-[16px]">
                {val}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
