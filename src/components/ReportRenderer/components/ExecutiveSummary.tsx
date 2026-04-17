import type { ExecutiveSummary as ExecutiveSummaryData } from "@/types";

interface Props {
  data: ExecutiveSummaryData & {
    totalResponses?: number;
    churnRate?: number;
    atRiskCount?: number;
  };
}

/**
 * ExecutiveSummary — topMetrics + keyFindings 카드만 렌더링.
 * sectionLabel / label(헤드라인) / body(디스크립션)는 레이아웃이 처리.
 * topMetrics·keyFindings가 없으면 아무것도 렌더링하지 않음.
 */

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-report-card rounded-card p-[24px]">
      <div className="text-sm text-report-text-secondary mb-1">{label}</div>
      <div className="font-bold text-xl text-report-text-primary">{value}</div>
    </div>
  );
}

function KeyFindingsCard({ findings }: { findings: string[] }) {
  return (
    <div className="bg-report-card rounded-card p-[24px]">
      <div className="flex items-center gap-2 mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <circle cx="10" cy="10" r="10" fill="#171719" />
          <path d="M6 10.5L8.5 13L14 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-bold text-base text-report-text-primary">Key Findings</span>
      </div>
      <ul className="flex flex-col gap-[8px]">
        {findings.map((item, i) => (
          <li key={i} className="flex items-start gap-[8px] text-[16px] leading-[24px] text-report-text-primary">
            <span className="mt-[10px] w-[4px] h-[4px] rounded-full bg-report-text-muted shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExecutiveSummary({ data }: Props) {
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

  const hasMetrics = topMetrics.length > 0;
  const hasFindings = (data.keyFindings ?? []).length > 0;

  if (!hasMetrics && !hasFindings) return null;

  return (
    <div className="bg-report-bg rounded-section p-[8px] space-y-3">
      {hasMetrics && (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${topMetrics.length}, 1fr)` }}
        >
          {topMetrics.map((m, i) => (
            <MetricBox key={i} label={m.label} value={m.value} />
          ))}
        </div>
      )}
      {hasFindings && (
        <KeyFindingsCard findings={data.keyFindings} />
      )}
    </div>
  );
}

export { MetricBox, KeyFindingsCard };
