import { Callout } from "@cubig/design-system";
import type { InsightCardData } from "@/types";

/**
 * InsightCard — 피그마 card+badge / card+interpretation / card+badge+interpretation
 *
 * 카드: bg #ffffff, radius 16, padding 24, gap 24 (vertical)
 * 내부 콘텐츠 영역: gap 16 (vertical)
 *   - Badge: radius 8, padding 4/8, 14px/500 #7b7e85, bg #f0f0f2
 *   - Value: 20px/600 #171719
 *   - Divider: bg #e6e7e9, 1px
 *   - Description: 16px/400 #171719
 * Callout (옵션): bg #fff7ed, radius 8, padding 14/12
 *   - Text: 14px/500 #ff6900
 */

export default function InsightCard({ data }: { data: InsightCardData }) {
  return (
    <div className="bg-report-card rounded-card p-[24px] flex flex-col gap-[24px]">
      {/* Content area */}
      <div className="flex flex-col gap-[16px]">
        {/* List item */}
        <div className="flex flex-col gap-[24px]">
          {data.badge && (
            <span className="self-start inline-flex items-center text-[14px] font-medium leading-[20px] rounded-[8px] px-[8px] py-[4px] bg-[#f0f0f2] text-report-text-secondary">
              {data.badge}
            </span>
          )}
          <div className="flex flex-col gap-[8px]">
            <span className="text-[20px] font-semibold leading-[28px] text-report-text-primary">
              {data.value}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-report-border" />

        {/* Description */}
        <div className="text-[16px] font-normal leading-[24px] text-report-text-primary whitespace-pre-line">
          {data.description}
        </div>
      </div>

      {/* Interpretation callout (optional) */}
      {data.interpretation && (
        <Callout
          variant="cautionary"
          size="medium"
          title={data.interpretation}
          leadingIcon
        />
      )}
    </div>
  );
}
