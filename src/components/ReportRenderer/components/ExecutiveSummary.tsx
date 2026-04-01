import { Badge, Divider } from "@cubig/design-system";
import type { ExecutiveSummary as ExecutiveSummaryData } from "@/types";

interface Props {
  data: ExecutiveSummaryData & { totalResponses?: number; churnRate?: number; atRiskCount?: number };
}

export default function ExecutiveSummary({ data }: Props) {
  const hasMetrics =
    data.totalResponses !== undefined ||
    data.churnRate !== undefined ||
    data.atRiskCount !== undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Executive Summary</h3>

      {/* Optional quick metrics */}
      {hasMetrics && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {data.totalResponses !== undefined && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="font-bold text-2xl text-gray-900">
                  {data.totalResponses.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">총 응답자</div>
              </div>
            )}
            {data.churnRate !== undefined && (
              <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#fef2f2" }}>
                <div className="font-bold text-2xl" style={{ color: "#b91c1c" }}>
                  {data.churnRate}%
                </div>
                <div className="text-xs text-gray-500 mt-0.5">이탈 위험률</div>
              </div>
            )}
            {data.atRiskCount !== undefined && (
              <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#fff7ed" }}>
                <div className="font-bold text-2xl" style={{ color: "#c2410c" }}>
                  {data.atRiskCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">위험 고객 수</div>
              </div>
            )}
          </div>
          <Divider orientation="horizontal" thickness={1} />
          <div className="mt-4" />
        </>
      )}

      <ul className="space-y-2">
        {data.keyFindings.map((finding, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <Badge variant="primary" type="strong" size="small" text={String(i + 1)} />
            <span className="pt-0.5">{finding}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
