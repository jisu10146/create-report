"use client";

import type { RevenueScenarioBarData } from "@/types";

/**
 * RevenueScenarioBar — 피그마 bar graph (Revenue) (6:1769)
 *
 * 카드: bg #ffffff, radius 16, padding 40/60, gap 40 (vertical)
 * 내부: horizontal, gap 32, 3개 Bar Container
 * Bar Container: hSize FILL, vertical, padding 10/40/0/40, gap 20, crossAlign CENTER
 *   - label: vertical, gap 16
 *     - Badge: radius 8, pad 4/8, bg #f0f0f2
 *     - details: 18px/400 #171719
 *     - highlight: 18px/600 #171719
 *   - Bar frame: 높이 202px, gap 12
 *     - 배경 Bar: full height, bg #f7f7f8, radius 0
 *     - 실제 Bar: 높이 비례, radius 0
 *   - Bar Label: 16px/400 #171719, textAlign CENTER
 *
 * 색상: Upside=#2b7fff, Base=#7ccf00, Downside=#e6e7e9
 */

const SCENARIO_COLORS: Record<string, string> = {
  Upside: "#2b7fff",
  Base: "#7ccf00",
  Downside: "#e6e7e9",
};

const BAR_FRAME_HEIGHT = 202;

export default function RevenueScenarioBar({ data }: { data: RevenueScenarioBarData }) {
  const maxVal = Math.max(...data.scenarios.map((s) => s.value), 1);

  return (
    <div className="bg-report-card rounded-card px-[60px] py-[40px]">
      <div className="flex justify-center gap-[32px]">
        {data.scenarios.map((scenario, i) => {
          const barHeight = Math.round((scenario.value / maxVal) * BAR_FRAME_HEIGHT);
          const color = SCENARIO_COLORS[scenario.label] ?? "#e6e7e9";

          return (
            <div
              key={i}
              className="flex flex-col items-center gap-[20px] pt-[10px] px-[40px]"
              style={{ width: 347 }}
            >
              {/* Label area — 중앙 정렬 */}
              <div className="flex flex-col items-center gap-[16px]">
                {scenario.badge && (
                  <span className="inline-flex items-center text-[14px] font-medium leading-[20px] rounded-[8px] px-[8px] py-[4px] bg-[#f0f0f2] text-report-text-secondary">
                    {scenario.badge}
                  </span>
                )}
                <div className="flex flex-col items-center">
                  {scenario.details?.map((detail, j) => (
                    <span key={j} className="text-[18px] font-normal leading-[26px] text-report-text-primary text-center">
                      {detail}
                    </span>
                  ))}
                  {scenario.highlight && (
                    <span className="text-[18px] font-semibold leading-[26px] text-report-text-primary text-center">
                      {scenario.highlight}
                    </span>
                  )}
                </div>
              </div>

              {/* Bar frame — 고정 높이 202px, 배경 위에 실제 바 겹침 */}
              <div
                className="relative w-full bg-[#f7f7f8] rounded-t-[16px]"
                style={{ height: BAR_FRAME_HEIGHT }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-[12px]"
                  style={{ height: barHeight, backgroundColor: color }}
                />
              </div>

              {/* Bar Label — 중앙 정렬 */}
              <span className="text-[16px] font-normal leading-[24px] text-report-text-primary text-center">
                {scenario.label} scenario
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
