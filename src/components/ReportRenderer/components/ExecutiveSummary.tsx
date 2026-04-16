import type { ExecutiveSummary as ExecutiveSummaryData } from "@/types";

interface Props {
  data: ExecutiveSummaryData & {
    totalResponses?: number;
    churnRate?: number;
    atRiskCount?: number;
  };
}

/* ─── Sub-blocks ─── */

/** 섹션 제목 + 설명 (재사용 가능) */
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h3 className="report-section-title">{title}</h3>
      {description && (
        <p className="text-base text-report-text-secondary leading-relaxed mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

/** 메트릭 카드 한 장 (#ffffff 카드) */
function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-report-card rounded-card p-[24px]">
      <div className="text-sm text-report-text-secondary mb-1">{label}</div>
      <div className="font-bold text-xl text-report-text-primary">{value}</div>
    </div>
  );
}

/** Key Findings 카드 (#ffffff 카드) */
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

/* ─── Main ─── */

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

  const headline = (data as unknown as Record<string, unknown>).headline as string | undefined;

  return (
    <div>
      {/* 타이틀 — 컨테이너 바깥 */}
      <p className="text-xs font-medium text-report-text-secondary mb-1">Executive Summary</p>
      {/* 헤드라인 — 가장 크고 굵게 */}
      {headline ? (
        <div className="mb-5">
          <h3 className="report-section-title mb-3">{headline}</h3>
          {data.description && (
            <p className="text-[15px] text-report-text-secondary leading-[24px] whitespace-pre-line">
              {data.description}
            </p>
          )}
        </div>
      ) : (
        <SectionHeader title="Executive Summary" description={data.description} />
      )}

      {/* #f7f7f8 배경 컨테이너 — 카드들만 포함 */}
      <div className="bg-report-bg rounded-section p-[8px] space-y-3">
        {/* 메트릭 카드들 */}
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

        {/* Key Findings */}
        {hasFindings && (
          <KeyFindingsCard findings={data.keyFindings} />
        )}
      </div>
    </div>
  );
}

export { SectionHeader, MetricBox, KeyFindingsCard };
