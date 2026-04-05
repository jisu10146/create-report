import type { MetricHighlightData, MetricHighlightItem } from "@/types";

/**
 * MetricHighlight — 피그마 content (10:145)
 *
 * 카드: bg #ffffff, radius 16, pad 24, gap 16
 * 상단: label 14px/500 + value 24px/600 + sub 14px/400
 * Divider: #e6e7e9
 * 하단: description 16px/400
 *
 * items 배열이면 가로 그리드(최대 3열)로 렌더링
 */

function SingleCard({ item }: { item: MetricHighlightItem }) {
  return (
    <div className="bg-report-card rounded-card p-[24px] flex flex-col gap-[16px]">
      {/* Metric */}
      <div className="flex flex-col gap-[10px]">
        <span className="text-[14px] font-medium leading-[20px] text-report-text-primary">
          {item.label}
        </span>
        <div className="flex items-baseline gap-[2px]">
          <span className="text-[24px] font-semibold leading-[32px] text-report-text-primary">
            {item.value}
          </span>
          {item.sub && (
            <span className="text-[14px] font-normal leading-[20px] text-report-text-secondary ml-[4px]">
              {item.sub}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-report-border" />

      {/* Description */}
      <p className="text-[16px] font-normal leading-[24px] text-report-text-primary">
        {item.description}
      </p>
    </div>
  );
}

export default function MetricHighlight({ data }: { data: MetricHighlightData }) {
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
  return <SingleCard item={data as MetricHighlightItem} />;
}
