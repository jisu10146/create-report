"use client";

import { ResponsivePie } from "@nivo/pie";
import { Badge } from "@cubig/design-system";
import type { ScoreCardData } from "@/types";
import type { BadgeVariant } from "@cubig/design-system";
import { SCORECARD_COLORS, SCORECARD_REMAINING_COLOR } from "@/lib/report-chart-spec";
import { reportNivoTheme } from "@/lib/report-nivo-theme";

export default function ScoreCard({ data }: { data: ScoreCardData }) {
  const pct = Math.round((data.score / data.maxScore) * 100);
  const spec = SCORECARD_COLORS[data.badgeColor ?? "green"] ?? SCORECARD_COLORS.green;
  const arcColor = spec.arc;
  const badgeVariant = spec.badge as BadgeVariant;

  const pieData = [
    { id: "score", label: "Score", value: data.score },
    { id: "remaining", label: "Remaining", value: data.maxScore - data.score },
  ];

  return (
    <div className="bg-report-card border border-report-border rounded-card p-5 shadow-card">
      <div className="flex items-start gap-5">
        {/* Gauge chart */}
        <div className="w-24 h-14 shrink-0 relative">
          <div className="w-24 h-24 absolute -top-1" style={{ clipPath: "inset(0 0 50% 0)" }}>
            <ResponsivePie
              data={pieData}
              startAngle={-90}
              endAngle={90}
              innerRadius={0.7}
              padAngle={2}
              cornerRadius={3}
              colors={[arcColor, SCORECARD_REMAINING_COLOR]}
              enableArcLabels={false}
              enableArcLinkLabels={false}
              isInteractive={false}
              theme={reportNivoTheme}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <span className="font-bold text-lg text-report-text-primary">{pct}%</span>
          </div>
        </div>

        {/* Score + Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-2xl text-report-text-primary">{data.score}</span>
              <span className="text-sm text-report-text-secondary">/ {data.maxScore}</span>
            </div>
            <Badge variant={badgeVariant} type="solid" size="small" text={data.badge} />
          </div>
        </div>
      </div>

      <ul className="space-y-2 mt-4">
        {data.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-report-text-primary">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-report-text-muted shrink-0" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
