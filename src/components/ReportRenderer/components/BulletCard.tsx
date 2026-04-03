import type { BulletCardData } from "@/types";
import BulletText from "./BulletText";

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
          <BulletText items={data.bullets} />
        </div>
      </div>
    </div>
  );
}
