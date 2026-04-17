import { IconIdentityPlatformOutline24 } from "@cubig/design-system";
import type { ClusterCardData } from "@/types";

/**
 * ClusterCard — 피그마 cluster card (1:10524)
 *
 * 카드: bg #ffffff, radius 16, padding 24, gap 24 (horizontal)
 * cluster 내부: vertical, gap 32
 *   - Badge pill: radius 9999, padding 6/10, bg #eff6ff, gap 6
 *     - dot: 원형 bg #2b7fff
 *     - text: 13px/500 #2b7fff
 *   - cluster info: horizontal, gap 20
 *     - icon: 60x60, radius 15, bg #f7f7f8, stroke #e6e7e9
 *       - icon_identity-platform outline 30x30, fill #7b7e85
 *     - text group: vertical, gap 8
 *       - title: 20px/600 #171719
 *       - description: 16px/400 #7b7e85
 */

export default function ClusterCard({ data }: { data: ClusterCardData }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {data.items.map((cluster, i) => (
        <div
          key={i}
          className="p-[24px] flex flex-row gap-[24px]"
        >
          <div className="flex flex-col gap-[32px] flex-1">
            {/* Badge pill */}
            <div className="self-start flex items-center gap-[6px] rounded-full px-[10px] py-[6px] bg-[#eff6ff]">
              <span
                className="w-[8px] h-[8px] rounded-full shrink-0"
                style={{ backgroundColor: cluster.badgeColor ?? "#2b7fff" }}
              />
              <span
                className="text-[13px] font-medium leading-[18px]"
                style={{ color: cluster.badgeColor ?? "#2b7fff" }}
              >
                {cluster.badge}
              </span>
            </div>

            {/* Cluster info */}
            <div className="flex items-start gap-[20px]">
              <div className="w-[60px] h-[60px] rounded-[15px] bg-[#f7f7f8] border border-report-border flex items-center justify-center shrink-0">
                <IconIdentityPlatformOutline24 width={30} height={30} style={{ color: "#7b7e85" }} />
              </div>
              <div className="flex flex-col gap-[8px]">
                <span className="text-[20px] font-semibold leading-[28px] text-report-text-primary">
                  {cluster.title}
                </span>
                <span className="text-[16px] font-normal leading-[24px] text-report-text-secondary">
                  {cluster.description}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
