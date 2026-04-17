import type { ClusterCardData } from "@/types";

/**
 * ClusterCard — 리포트 스타일
 *
 * 좌측 컬러 보더로 그룹을 구분하고, 타이틀 + 본문으로 구성.
 * 아이콘 박스, 카드 배경 없이 텍스트 중심 레이아웃.
 */

export default function ClusterCard({ data }: { data: ClusterCardData }) {
  return (
    <div className="flex flex-col gap-[32px]">
      {data.items.map((cluster, i) => (
        <div
          key={i}
          className="border-l-[3px] pl-[20px] flex flex-col gap-[10px]"
          style={{ borderColor: cluster.badgeColor ?? "#2b7fff" }}
        >
          {/* Badge */}
          <span
            className="text-[13px] font-semibold tracking-wide"
            style={{ color: cluster.badgeColor ?? "#2b7fff" }}
          >
            {cluster.badge}
          </span>

          {/* Title */}
          <span className="text-[18px] font-semibold leading-[26px] text-report-text-primary">
            {cluster.title}
          </span>

          {/* Description */}
          <p className="text-[15px] font-normal leading-[24px] text-report-text-secondary">
            {cluster.description}
          </p>
        </div>
      ))}
    </div>
  );
}
