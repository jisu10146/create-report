import type { BulletCardData } from "@/types";

export default function BulletCard({ data }: { data: BulletCardData }) {
  return (
    <div className="bg-report-card border border-report-border rounded-card p-5 shadow-card">
      <h4 className="font-semibold text-report-text-primary mb-3">{data.title}</h4>
      <ul className="space-y-2">
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
