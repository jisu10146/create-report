import type { ScoreCardData } from "@/types";

const BADGE_COLORS: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
};

export default function ScoreCard({ data }: { data: ScoreCardData }) {
  const pct = Math.round((data.score / data.maxScore) * 100);
  const badgeClass = BADGE_COLORS[data.badgeColor ?? "green"] ?? BADGE_COLORS.green;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-2xl text-gray-900">{data.score}</span>
          <span className="text-sm text-gray-500">/ {data.maxScore}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
          {data.badge}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-4">
        <div
          className="h-2 bg-gray-900 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-2">
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
