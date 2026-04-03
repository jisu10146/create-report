import { IconIdentityPlatformOutline24 } from "@cubig/design-system";
import type { UserCardData } from "@/types";

/**
 * UserCard — 피그마 User Card (2:74)
 *
 * 카드: bg #ffffff, radius 20, padding 32/32/26/32, gap 20 (vertical)
 * User 영역: horizontal, gap 16
 *   - 아이콘: 48x48, radius 12, bg #f7f7f8, stroke #e6e7e9
 *     - icon_identity-platform outline 24x24, fill #7b7e85
 *   - 이름: 18px/600 #171719
 *   - 부가정보: 14px/400 #7b7e85
 * Divider: 1px
 * 설명: 16px/400 #171719
 * 버튼: radius 8, padding 12/16, bg #f7f7f8, 16px/500 #0f0f10
 */

export default function UserCard({ data }: { data: UserCardData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.items.map((user, i) => (
        <div
          key={i}
          className="bg-report-card rounded-[20px] pt-[32px] px-[32px] pb-[26px] flex flex-col gap-[20px]"
        >
          {/* User info */}
          <div className="flex items-center gap-[16px]">
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#f7f7f8] border border-report-border flex items-center justify-center shrink-0">
              <IconIdentityPlatformOutline24 style={{ color: "#7b7e85" }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-semibold leading-[26px] text-report-text-primary">
                {user.name}
              </span>
              <span className="text-[14px] font-normal leading-[20px] text-report-text-secondary">
                {user.subtitle}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-report-border" />

          {/* Description */}
          <p className="text-[16px] font-normal leading-[24px] text-report-text-primary">
            {user.description}
          </p>

          {/* Button */}
          {data.hasViewDetail && (
            <button
              className="w-full rounded-[8px] bg-[#f7f7f8] border border-report-border px-[16px] py-[12px] text-[16px] font-medium leading-[24px]"
              style={{ color: "#0f0f10" }}
            >
              View Detail
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
