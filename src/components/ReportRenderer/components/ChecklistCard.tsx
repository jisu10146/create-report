/**
 * ChecklistCard — 피그마 content (10:159)
 *
 * 카드: bg #ffffff, radius 16, pad L:16 R:16 T:20 B:20
 * 내부 content: HORIZONTAL, gap 24, align center
 *   - 왼쪽: VERTICAL, gap 12
 *     - list-item: HORIZONTAL, gap 6, align center
 *       - icon_check: 20x20, fill #171719
 *       - title: 18px/600 #171719
 *   - Divider: VERTICAL, width 1, fill #e6e7e9
 *   - 오른쪽 description: VERTICAL, gap 8
 *     - text: 16px/400 #171719
 */

export interface ChecklistCardData {
  title: string;
  description: string;
}

export default function ChecklistCard({ data }: { data: ChecklistCardData }) {
  return (
    <div className="bg-report-card rounded-card px-[16px] py-[20px]">
      <div className="flex items-center gap-[24px]">
        {/* 왼쪽: 아이콘 + 타이틀 */}
        <div className="flex flex-col gap-[12px] shrink-0">
          <div className="flex items-center gap-[6px]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
              <circle cx="10" cy="10" r="10" fill="#171719" />
              <path d="M6 10.5L8.5 13L14 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[18px] font-semibold leading-[26px] text-report-text-primary">
              {data.title}
            </span>
          </div>
        </div>

        {/* 세로 Divider */}
        <div className="w-px self-stretch bg-report-border shrink-0" />

        {/* 오른쪽: 설명 */}
        <div className="flex flex-col gap-[8px] flex-1">
          <p className="text-[16px] font-normal leading-[24px] text-report-text-primary">
            {data.description}
          </p>
        </div>
      </div>
    </div>
  );
}
