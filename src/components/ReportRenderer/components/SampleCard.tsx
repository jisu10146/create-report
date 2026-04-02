import { Badge } from "@cubig/design-system";
import type { SampleCardData } from "@/types";

export default function SampleCard({ data }: { data: SampleCardData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {data.items.map((item) => (
        <div
          key={item.id}
          className="bg-report-card border border-report-border rounded-card p-4 shadow-card"
        >
          <div className="mb-3">
            <Badge variant="secondary" type="outline" size="small" text={item.id} />
          </div>
          <ul className="space-y-1.5">
            {item.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-report-text-primary">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-report-text-muted shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
