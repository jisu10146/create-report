import { Callout } from "@cubig/design-system";
import type { InsightCardData, InsightCardItem } from "@/types";

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
 *
 * items 배열이면 가로 그리드(최대 3열)로 렌더링
 */

function SingleCard({ item }: { item: InsightCardItem }) {
  return (
    <div className="bg-report-card rounded-card p-[24px] flex flex-col gap-[24px]">
      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[24px]">
          {item.badge && (
            <span className="self-start inline-flex items-center text-[14px] font-medium leading-[20px] rounded-[8px] px-[8px] py-[4px] bg-[#f0f0f2] text-report-text-secondary">
              {item.badge}
            </span>
          )}
          <span className="text-[20px] font-semibold leading-[28px] text-report-text-primary">
            {item.value}
          </span>
        </div>
        <div className="h-px bg-report-border" />
        <div className="text-[16px] font-normal leading-[24px] text-report-text-primary whitespace-pre-line">
          {item.description}
        </div>
      </div>
      {item.interpretation && (
        <Callout variant="cautionary" size="medium" title={item.interpretation} leadingIcon />
      )}
    </div>
  );
}

export default function InsightCard({ data }: { data: InsightCardData }) {
  // items 배열 형태
  if ("items" in data && Array.isArray(data.items)) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {data.items.map((item, i) => (
          <SingleCard key={i} item={item} />
        ))}
      </div>
    );
  }

  // 단일 카드 (하위 호환)
  return <SingleCard item={data as InsightCardItem} />;
}
