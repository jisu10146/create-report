"use client";

import { LAYOUT_PATTERNS } from "../tokens";

const COMPONENT_COLORS: Record<string, string> = {
  ExecutiveSummary: "bg-gray-200",
  MetricCard: "bg-chart-blue-light",
  HorizontalBarChart: "bg-chart-blue",
  InterpretationBlock: "bg-chart-teal",
  DoDontCard: "bg-chart-green",
  StrategyTable: "bg-chart-purple",
  RevenueScenarioBar: "bg-chart-yellow",
  SyntheticPersonaCard: "bg-chart-blue-mid",
  SignalCard: "bg-chart-blue",
  ScoreCard: "bg-chart-purple",
  BulletCard: "bg-chart-green",
};

export default function LayoutPatternsSection() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-report-text-primary mb-1">Layout Patterns</h2>
        <p className="text-sm text-report-text-secondary">
          compact / standard / detailed 분량별 섹션 구성 미리보기.
        </p>
      </div>

      <div className="space-y-6">
        {LAYOUT_PATTERNS.map((pattern) => (
          <div
            key={pattern.volume}
            className="bg-report-card border border-report-border rounded-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-report-text-primary">{pattern.label}</h3>
                <p className="text-sm text-report-text-secondary mt-0.5">{pattern.desc}</p>
              </div>
              <span className="text-xs font-mono bg-report-bg text-report-text-secondary px-3 py-1 rounded-chip">
                {pattern.sectionCount} 섹션
              </span>
            </div>

            {/* Visual grid */}
            <div className="space-y-2">
              {pattern.sections.map((comp, i) => {
                const isFullWidth = [
                  "ExecutiveSummary",
                  "HorizontalBarChart",
                  "InterpretationBlock",
                  "StrategyTable",
                  "RevenueScenarioBar",
                ].includes(comp);
                const colorClass = COMPONENT_COLORS[comp] ?? "bg-gray-200";

                return (
                  <div
                    key={i}
                    className={`${isFullWidth ? "w-full" : "w-1/2 inline-block pr-1"}`}
                  >
                    <div
                      className={`${colorClass} rounded-sm px-3 py-2 flex items-center justify-between`}
                      style={{ opacity: 0.7 }}
                    >
                      <span className="text-xs text-white font-medium truncate">{comp}</span>
                      <span className="text-xs text-white/60 font-mono shrink-0 ml-2">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
