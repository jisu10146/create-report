import type { SectionTitleData } from "@/types";

/**
 * SectionTitle — 피그마 title (6:1891)
 *
 * 컨테이너: vertical, gap 8
 *   - title: 20px/600 #0f0f10
 *   - subtitle: 16px/400 #7b7e85
 */

export default function SectionTitle({ data }: { data: SectionTitleData }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <h3 className="text-[20px] font-semibold leading-[28px]" style={{ color: "#0f0f10" }}>
        {data.title}
      </h3>
      {data.subtitle && (
        <p className="text-[16px] font-normal leading-[24px] text-report-text-secondary">
          {data.subtitle}
        </p>
      )}
    </div>
  );
}
