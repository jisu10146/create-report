"use client";

import type { RevenueScenarioBarData } from "@/types";

/**
 * RevenueScenarioBar — 피그마 bar graph (Revenue) (6:1769)
 *
 * 카드: bg #ffffff, radius 16, padding 40/60, gap 40 (vertical)
 * 내부: horizontal, gap 32, 3개 Bar Container
 * Bar Container: vertical, padding 10/40/0/40, gap 20
 *   - label: vertical, gap 16
 *     - Badge: radius 8, pad 4/8, bg #f0f0f2
 *     - details: 18px/400 #171719
 *     - highlight: 18px/600 #171719
 *   - Bar: vertical, gap 12
 *     - 배경 Bar: bg #f7f7f8
 *     - 실제 Bar: 높이 비례
 *   - Bar Label: 16px/400 #171719
 *
 * 색상: Upside=#2b7fff, Base=#7ccf00, Downside=#e6e7e9
 */

const SCENARIO_COLORS: Record<string, string> = {
  Upside: "#2b7fff",
  Base: "#7ccf00",
  Downside: "#e6e7e9",
};

const MAX_BAR_HEIGHT = 200;

export default function RevenueScenarioBar({ data }: { data: RevenueScenarioBarData }) {
  const maxVal = Math.max(...data.scenarios.map((s) => s.value), 1);

  return (
    <div className="bg-report-card rounded-card px-[60px] py-[40px]">
      <div className="flex gap-[32px]">
        {data.scenarios.map((scenario, i) => {
          const barHeight = Math.round((scenario.value / maxVal) * MAX_BAR_HEIGHT);
          const color = SCENARIO_COLORS[scenario.label] ?? "#e6e7e9";

          return (
            <div
              key={i}
              className="flex-1 flex flex-col gap-[20px] px-[40px] pt-[10px]"
            >
              {/* Label area */}
              <div className="flex flex-col gap-[16px]">
                {scenario.badge && (
                  <span className="self-start inline-flex items-center text-[14px] font-medium leading-[20px] rounded-[8px] px-[8px] py-[4px] bg-[#f0f0f2] text-report-text-secondary">
                    {scenario.badge}
                  </span>
                )}
                <div className="flex flex-col">
                  {scenario.details?.map((detail, j) => (
                    <span key={j} className="text-[18px] font-normal leading-[26px] text-report-text-primary">
                      {detail}
                    </span>
                  ))}
                  {scenario.highlight && (
                    <span className="text-[18px] font-semibold leading-[26px] text-report-text-primary">
                      {scenario.highlight}
                    </span>
                  )}
                </div>
              </div>

              {/* Bar */}
              <div className="flex flex-col gap-[12px]">
                <div
                  className="relative w-full rounded-[4px] bg-[#f7f7f8]"
                  style={{ height: MAX_BAR_HEIGHT }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-[4px]"
                    style={{ height: barHeight, backgroundColor: color }}
                  />
                </div>
              </div>

              {/* Bar Label */}
              <span className="text-[16px] font-normal leading-[24px] text-report-text-primary">
                {scenario.label} scenario
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
