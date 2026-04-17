import type { InsightCardData, InsightCardItem } from "@/types";

/**
 * InsightCard — 리포트 스타일
 *
 * 뱃지(카테고리) + 타이틀 + 본문 + 인과 해석(좌측 보더).
 * 카드 배경·디바이더·Callout 제거, 텍스트 계층으로 구분.
 */

function SingleCard({ item }: { item: InsightCardItem }) {
  return (
    <div className="flex flex-col gap-[16px]">
      {/* Badge + Title */}
      <div className="flex flex-col gap-[6px]">
        {item.badge && (
          <span className="text-[13px] font-semibold tracking-wide uppercase text-report-text-secondary">
            {item.badge}
          </span>
        )}
        <span className="text-[18px] font-semibold leading-[26px] text-report-text-primary">
          {item.title}
        </span>
      </div>

      {/* Description */}
      <p className="text-[15px] font-normal leading-[24px] text-report-text-primary whitespace-pre-line">
        {item.description}
      </p>

      {/* Interpretation — 좌측 보더 인과 블록 */}
      {item.interpretation && (
        <div className="border-l-[3px] border-[#d4a574] pl-[16px] py-[2px]">
          <p className="text-[14px] leading-[22px] text-report-text-secondary">
            {item.interpretation}
          </p>
        </div>
      )}
    </div>
  );
}

export default function InsightCard({ data }: { data: InsightCardData }) {
  if ("items" in data && Array.isArray(data.items)) {
    return (
      <div className="flex flex-col">
        {data.items.map((item, i) => (
          <div
            key={i}
            className={i > 0 ? "mt-8 pt-8 border-t border-report-border" : ""}
          >
            <SingleCard item={item} />
          </div>
        ))}
      </div>
    );
  }

  return <SingleCard item={data as InsightCardItem} />;
}
