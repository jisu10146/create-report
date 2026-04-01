import { Badge } from "@cubig/design-system";
import type { SignalCardData } from "@/types";
import type { BadgeVariant } from "@cubig/design-system";

const BADGE_VARIANT_MAP: Record<string, BadgeVariant> = {
  red: "negative",
  orange: "cautionary",
  yellow: "cautionary",
  green: "positive",
};

export default function SignalCard({ data }: { data: SignalCardData }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {data.items.map((signal, i) => {
        const variant = BADGE_VARIANT_MAP[signal.badgeColor ?? "red"] ?? "negative";
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
                <Badge variant={variant} type="solid" size="small" text={signal.badge} />
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
