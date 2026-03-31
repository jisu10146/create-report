import type { SignalCardData } from "@/types";

const BADGE_COLORS: Record<string, string> = {
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
};

export default function SignalCard({ data }: { data: SignalCardData }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {data.items.map((signal, i) => {
        const badgeClass =
          BADGE_COLORS[signal.badgeColor ?? "red"] ?? BADGE_COLORS.red;
        return (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="font-semibold text-sm text-gray-900 leading-snug">
                {signal.signalName}
              </span>
              {signal.badge && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}
                >
                  {signal.badge}
                </span>
              )}
            </div>
            <ul className="space-y-1.5">
              {signal.bullets.map((bullet, j) => (
                <li
                  key={j}
                  className="flex items-start gap-1.5 text-xs text-gray-600"
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
