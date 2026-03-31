import type { ExecutiveSummary as ExecutiveSummaryData } from "@/types";

interface Props {
  data: ExecutiveSummaryData & { totalResponses?: number; churnRate?: number; atRiskCount?: number };
}

export default function ExecutiveSummary({ data }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Executive Summary</h3>

      {/* Optional quick metrics */}
      {(data.totalResponses !== undefined ||
        data.churnRate !== undefined ||
        data.atRiskCount !== undefined) && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {data.totalResponses !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="font-bold text-2xl text-gray-900">{data.totalResponses.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-0.5">총 응답자</div>
            </div>
          )}
          {data.churnRate !== undefined && (
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="font-bold text-2xl text-red-700">{data.churnRate}%</div>
              <div className="text-xs text-gray-500 mt-0.5">이탈 위험률</div>
            </div>
          )}
          {data.atRiskCount !== undefined && (
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="font-bold text-2xl text-orange-700">{data.atRiskCount.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-0.5">위험 고객 수</div>
            </div>
          )}
        </div>
      )}

      <ul className="space-y-2">
        {data.keyFindings.map((finding, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            {finding}
          </li>
        ))}
      </ul>
    </div>
  );
}
