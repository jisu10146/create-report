"use client";

import { useState } from "react";
import { IconIdentityPlatformOutline24 } from "@cubig/design-system";
import type { PersonaModalData } from "@/types";

/**
 * PersonaModal — 피그마 Synthetic Respondent Samples_modal (6:1818)
 *
 * 모달: radius 16, width 960, stroke #e6e7e9
 * Heading: pad 24/24/12/24, bg #ffffff
 *   - title: 18px/600 #171719
 *   - icon_close: 24x24, fill #171719
 * Content: pad 24, bg #ffffff, gap 10
 *   - content: gap 16
 *     - persona: horizontal, pad 24, radius 16, gap 16, stroke #e6e7e9
 *       - icon: 48x48, radius 12, bg #f7f7f8, stroke #e6e7e9
 *       - name: 14px/600 #0f0f10
 *       - subtitle: 13px/400 #7b7e85
 *     - persona detail: pad 8, radius 16, bg #f7f7f8, stroke #f0f0f2, gap 10
 *       - detail card: pad 20, radius 12, bg #ffffff, gap 10
 *         - label: 14px/500
 *         - content: 16px/500
 * Action: pad 12/24/24/24, bg #ffffff
 *   - 취소: pad 8/16, radius 8, bg #ffffff, stroke #e6e7e9, 16px/500 #0f0f10
 *   - Close: pad 8/16, radius 8, bg #303135, stroke #7b7e85, 16px/500 #ffffff
 */

/** 모달 내부 콘텐츠만 인라인으로 렌더링 (디자인 시스템 페이지용) */
export function PersonaModalInline({ data }: { data: PersonaModalData }) {
  const persona = data.personas[0];
  if (!persona) return null;

  return (
    <div className="w-[960px] rounded-[16px] border border-report-border overflow-hidden flex flex-col">
      {/* Heading */}
      <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[12px] bg-report-card">
        <h2 className="text-[18px] font-semibold leading-[26px]" style={{ color: "#0f0f10" }}>
          {data.title}
        </h2>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#171719" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Content */}
      <div className="p-[24px] bg-report-card">
        <div className="flex flex-col gap-[16px]">
          <div className="flex items-center gap-[16px] p-[24px] rounded-[16px] border border-report-border">
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#f7f7f8] border border-report-border flex items-center justify-center shrink-0">
              <IconIdentityPlatformOutline24 style={{ color: "#7b7e85" }} />
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[14px] font-semibold leading-[20px]" style={{ color: "#0f0f10" }}>{persona.name}</span>
              <span className="text-[13px] font-normal leading-[18px] text-report-text-secondary">{persona.subtitle}</span>
            </div>
          </div>
          <div className="rounded-[16px] bg-[#f7f7f8] border border-[#f0f0f2] p-[8px] flex flex-col gap-[8px]">
            {persona.details?.map((detail, i) => (
              <div key={i} className="bg-report-card rounded-[12px] p-[20px] flex flex-col gap-[10px]">
                <span className="text-[14px] font-medium leading-[20px] text-report-text-secondary">{detail.label}</span>
                <p className="text-[16px] font-medium leading-[24px] text-report-text-primary">{detail.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action area */}
      <div className="flex justify-end px-[24px] pt-[12px] pb-[24px] bg-report-card">
        <span className="px-[16px] py-[8px] rounded-[8px] text-[16px] font-medium leading-[24px] text-white" style={{ backgroundColor: "#303135", borderColor: "#7b7e85", borderWidth: 1, borderStyle: "solid" }}>Close</span>
      </div>
    </div>
  );
}

export default function PersonaModal({ data }: { data: PersonaModalData }) {
  const [open, setOpen] = useState(false);

  const persona = data.personas[0];
  if (!persona) return null;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-[8px] bg-[#f7f7f8] border border-report-border px-[16px] py-[12px] text-[16px] font-medium leading-[24px]"
        style={{ color: "#0f0f10" }}
      >
        {data.title}
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-[960px] max-h-[80vh] rounded-[16px] border border-report-border overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Heading */}
            <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[12px] bg-report-card">
              <h2 className="text-[18px] font-semibold leading-[26px]" style={{ color: "#0f0f10" }}>
                {data.title}
              </h2>
              <button onClick={() => setOpen(false)} className="text-report-text-primary">
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
                      {persona.name}
                    </span>
                    <span className="text-[13px] font-normal leading-[18px] text-report-text-secondary">
                      {persona.subtitle}
                    </span>
                  </div>
                </div>

                {/* Detail cards */}
                <div className="rounded-[16px] bg-[#f7f7f8] border border-[#f0f0f2] p-[8px] flex flex-col gap-[8px]">
                  {persona.details?.map((detail, i) => (
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
              </div>
            </div>

            {/* Action area */}
            <div className="flex justify-end px-[24px] pt-[12px] pb-[24px] bg-report-card">
              <button
                onClick={() => setOpen(false)}
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
