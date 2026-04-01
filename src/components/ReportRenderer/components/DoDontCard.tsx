import { Badge } from "@cubig/design-system";
import type { DoDontCardData } from "@/types";

export default function DoDontCard({ data }: { data: DoDontCardData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* DO */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="positive" type="strong" size="small" text="✓" />
          <span className="font-semibold text-sm" style={{ color: "#15803d" }}>DO</span>
        </div>
        <ul className="space-y-2">
          {data.dos.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#4ade80" }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {/* DON'T */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="negative" type="strong" size="small" text="✕" />
          <span className="font-semibold text-sm" style={{ color: "#b91c1c" }}>DON&apos;T</span>
        </div>
        <ul className="space-y-2">
          {data.donts.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#f87171" }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
