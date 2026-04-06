"use client";

import { useState } from "react";
import { IconIdentityPlatformOutline24 } from "@cubig/design-system";
import type { UserCardData, PersonaModalPersona } from "@/types";

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
 *   → View Detail 클릭 시 PersonaModal 열림
 */

export default function UserCard({ data }: { data: UserCardData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaModalPersona | null>(null);

  const handleViewDetail = (index: number) => {
    const persona = data.personaModal?.personas[index];
    if (persona) {
      setActivePersona(persona);
      setModalOpen(true);
    }
  };

  return (
    <>
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
                onClick={() => handleViewDetail(i)}
                className="w-full rounded-[8px] bg-[#f7f7f8] border border-report-border px-[16px] py-[12px] text-[16px] font-medium leading-[24px]"
                style={{ color: "#0f0f10" }}
              >
                View Detail
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PersonaModal */}
      {modalOpen && activePersona && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-[960px] max-h-[80vh] rounded-[16px] border border-report-border overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Heading */}
            <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[12px] bg-report-card">
              <h2 className="text-[18px] font-semibold leading-[26px]" style={{ color: "#0f0f10" }}>
                {data.personaModal?.title ?? "Detail"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-report-text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#171719" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-[24px] bg-report-card">
              <div className="flex flex-col gap-[16px]">
                {/* Persona header */}
                <div className="flex items-center gap-[16px] p-[24px] rounded-[16px] border border-report-border">
                  <div className="w-[48px] h-[48px] rounded-[12px] bg-[#f7f7f8] border border-report-border flex items-center justify-center shrink-0">
                    <IconIdentityPlatformOutline24 style={{ color: "#7b7e85" }} />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[14px] font-semibold leading-[20px]" style={{ color: "#0f0f10" }}>
                      {activePersona.name}
                    </span>
                    <span className="text-[13px] font-normal leading-[18px] text-report-text-secondary">
                      {activePersona.subtitle}
                    </span>
                  </div>
                </div>

                {/* Detail cards */}
                {activePersona.details && activePersona.details.length > 0 && (
                  <div className="rounded-[16px] bg-[#f7f7f8] border border-[#f0f0f2] p-[8px] flex flex-col gap-[8px]">
                    {activePersona.details.map((detail, i) => (
                      <div
                        key={i}
                        className="bg-report-card rounded-[12px] p-[20px] flex flex-col gap-[10px]"
                      >
                        <span className="text-[14px] font-medium leading-[20px] text-report-text-secondary">
                          {detail.label}
                        </span>
                        <p className="text-[16px] font-medium leading-[24px] text-report-text-primary">
                          {detail.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action area */}
            <div className="flex justify-end px-[24px] pt-[12px] pb-[24px] bg-report-card">
              <button
                onClick={() => setModalOpen(false)}
                className="px-[16px] py-[8px] rounded-[8px] text-[16px] font-medium leading-[24px] text-white"
                style={{ backgroundColor: "#303135", borderColor: "#7b7e85", borderWidth: 1, borderStyle: "solid" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
