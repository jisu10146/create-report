import type { ExecutiveSummary as ExecutiveSummaryData } from "@/types";

interface Props {
  data: ExecutiveSummaryData & {
    totalResponses?: number;
    churnRate?: number;
    atRiskCount?: number;
  };
}

/* ─── Sub-blocks ─── */

function DescriptionBlock({ text }: { text: string }) {
  return (
    <p className="text-sm text-report-text-secondary leading-relaxed">
      {text}
    </p>
  );
}

function TopMetricsBlock({ metrics }: { metrics: Array<{ label: string; value: string | number }> }) {
  return (
    <div
      className="grid border-b border-report-border"
      style={{ gridTemplateColumns: `repeat(${metrics.length}, 1fr)` }}
    >
      {metrics.map((m, i) => (
        <div
          key={i}
          className={`p-5 ${i > 0 ? "border-l border-report-border" : ""}`}
        >
          <div className="text-sm text-report-text-secondary mb-1">{m.label}</div>
          <div className="font-bold text-xl text-report-text-primary">{m.value}</div>
        </div>
      ))}
    </div>
  );
}

function KeyFindingsBlock({ findings }: { findings: string[] }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
          <circle cx="9" cy="9" r="9" fill="#171719" />
          <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-semibold text-sm text-report-text-primary">Key Findings</span>
      </div>
      <ul className="space-y-2">
        {findings.map((finding, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-report-text-primary leading-relaxed">
            <span className="mt-2 w-1 h-1 rounded-full bg-report-text-secondary shrink-0" />
            {finding}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Main ─── */

export default function ExecutiveSummary({ data }: Props) {
  /* 기존 호환: totalResponses/churnRate/atRiskCount → topMetrics 변환 */
  const topMetrics: Array<{ label: string; value: string | number }> =
    data.topMetrics ? [...data.topMetrics] : [];

  if (topMetrics.length === 0) {
    if (data.totalResponses !== undefined)
      topMetrics.push({ label: "Number of respondents", value: data.totalResponses.toLocaleString() });
    if (data.churnRate !== undefined)
      topMetrics.push({ label: "이탈 위험률", value: `${data.churnRate}%` });
    if (data.atRiskCount !== undefined)
      topMetrics.push({ label: "위험 고객 수", value: data.atRiskCount.toLocaleString() });
  }

  const hasDescription = !!data.description;
  const hasMetrics = topMetrics.length > 0;
  const hasFindings = data.keyFindings.length > 0;

  return (
    <div className="space-y-4">
      {/* Description — 카드 바깥 (메트릭 없을 때) 또는 카드 안 (메트릭 있을 때) */}
      {hasDescription && !hasMetrics && (
        <DescriptionBlock text={data.description!} />
      )}

      {/* Card */}
      <div className="bg-report-card border border-report-border rounded-card shadow-card overflow-hidden">
        {/* 메트릭이 있으면: description(카드 안) + metrics + findings */}
        {hasDescription && hasMetrics && (
          <div className="px-5 pt-5 pb-3">
            <DescriptionBlock text={data.description!} />
          </div>
        )}

        {hasMetrics && <TopMetricsBlock metrics={topMetrics} />}

        {hasFindings && <KeyFindingsBlock findings={data.keyFindings} />}
      </div>
    </div>
  );
}

/* Export sub-blocks for direct composition */
export { DescriptionBlock, TopMetricsBlock, KeyFindingsBlock };
