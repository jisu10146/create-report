import type { InterpretationBlockData } from "@/types";

/**
 * InterpretationBlock — 피그마 Interpretation card (2:1440)
 *
 * 카드: bg #ffffff, radius 16, padding 24/24/20/20, gap 40 (vertical)
 * title 영역: horizontal, gap 6, align center
 *   - circlecheck 아이콘: 16x16, fill #171719
 *   - title: 18px/600 #171719, lineHeight 26
 * description: 16px/400 #171719, lineHeight 24
 */

export default function InterpretationBlock({ data }: { data: InterpretationBlockData }) {
  return (
    <div className="bg-report-card rounded-card px-[24px] pt-[20px] pb-[20px] flex flex-col gap-[8px]">
      {/* Title with icon */}
      <div className="flex items-center gap-[6px]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334Zm3.024-8.31a.667.667 0 0 0-.943-.943L7.333 8.163 5.92 6.748a.667.667 0 1 0-.943.943l1.886 1.886a.667.667 0 0 0 .943 0l3.22-3.22Z"
            fill="#171719"
          />
        </svg>
        <span className="text-[18px] font-semibold leading-[26px] text-report-text-primary">
          {data.title ?? "Interpretation"}
        </span>
      </div>

      {/* Description */}
      <p className="text-[16px] font-normal leading-[24px] text-report-text-primary">
        {data.text}
      </p>
    </div>
  );
}
