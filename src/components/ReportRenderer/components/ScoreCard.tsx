"use client";

import { ResponsivePie } from "@nivo/pie";
import { Badge } from "@cubig/design-system";
import type { ScoreCardData } from "@/types";
import type { BadgeVariant } from "@cubig/design-system";

const COLOR_MAP: Record<string, { arc: string; badge: BadgeVariant }> = {
  green: { arc: "#22c55e", badge: "positive" },
  red: { arc: "#ef4444", badge: "negative" },
  orange: { arc: "#f97316", badge: "cautionary" },
  blue: { arc: "#3b82f6", badge: "info" },
  yellow: { arc: "#eab308", badge: "cautionary" },
};

export default function ScoreCard({ data }: { data: ScoreCardData }) {
  const pct = Math.round((data.score / data.maxScore) * 100);
  const colors = COLOR_MAP[data.badgeColor ?? "green"] ?? COLOR_MAP.green;

  const pieData = [
    { id: "score", label: "Score", value: data.score },
    { id: "remaining", label: "Remaining", value: data.maxScore - data.score },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
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
              colors={[colors.arc, "#f3f4f6"]}
              enableArcLabels={false}
              enableArcLinkLabels={false}
              isInteractive={false}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <span className="font-bold text-lg text-gray-900">{pct}%</span>
          </div>
        </div>

        {/* Score + Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-2xl text-gray-900">{data.score}</span>
              <span className="text-sm text-gray-500">/ {data.maxScore}</span>
            </div>
            <Badge variant={colors.badge} type="solid" size="small" text={data.badge} />
          </div>
        </div>
      </div>

      <ul className="space-y-2 mt-4">
        {data.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
