import type { BulletCardData } from "@/types";

export default function BulletCard({ data }: { data: BulletCardData }) {
  return (
    <div className="bg-report-card border border-report-border rounded-card p-[24px]">
      <div className="flex gap-[40px]">
        {/* 왼쪽: 라벨 + 값 */}
        <div className="shrink-0 min-w-[160px]">
          <div className="text-sm text-report-text-secondary">{data.title}</div>
          {data.value !== undefined && (
            <div className="font-bold text-2xl text-report-text-primary mt-1">
              {data.value}
            </div>
          )}
        </div>

        {/* 세로 구분선 */}
        <div className="w-px bg-report-border shrink-0" />

        {/* 오른쪽: bullet 리스트 */}
        <div className="flex-1">
          <ul className="flex flex-col gap-[8px]">
            {data.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-[8px] text-[16px] leading-[24px] text-report-text-primary">
                <span className="mt-[10px] w-[4px] h-[4px] rounded-full bg-report-text-muted shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
