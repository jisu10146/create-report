import type { QuoteCardData } from "@/types";

/**
 * QuoteCard — 사용자 리뷰/VOC 등 원문 발췌 인용 카드
 *
 * 구조: tag(카테고리) + meta(부가 정보) + quote(원문 발췌)
 * 레이아웃: 항목 수에 따라 1/2/3열 자동 (최대 3열)
 * 스타일: 좌측 보더 액센트로 인용 느낌, paraphrase 없이 원문 그대로 표시
 */

export default function QuoteCard({ data }: { data: QuoteCardData }) {
  const count = data.items.length;
  const colClass =
    count >= 3 ? "md:grid-cols-3" : count === 2 ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-[16px]`}>
      {data.items.map((item, i) => (
        <div
          key={i}
          className="bg-report-card rounded-card p-[24px] flex flex-col gap-[14px]"
        >
          {/* Tag + Meta */}
          <div className="flex items-center justify-between gap-[8px] flex-wrap">
            <span className="inline-flex items-center px-[10px] py-[4px] rounded-full bg-report-bg text-[13px] font-semibold text-report-text-primary">
              {item.tag}
            </span>
            {item.meta && (
              <span className="text-[12px] text-report-text-secondary">
                {item.meta}
              </span>
            )}
          </div>

          {/* Quote — 좌측 보더 액센트 */}
          <p className="text-[15px] leading-[24px] text-report-text-primary border-l-[3px] border-report-border pl-[12px] whitespace-pre-line">
            {item.quote}
          </p>
        </div>
      ))}
    </div>
  );
}
