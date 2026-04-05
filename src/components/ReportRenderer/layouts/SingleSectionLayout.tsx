"use client";

import type { ReportSchema, AgentDefinition } from "@/types";
import { Chip } from "@cubig/design-system";
import { renderComponent } from "../components";

interface Props {
  report: ReportSchema;
  agent: AgentDefinition;
}

export default function SingleSectionLayout({ report, agent }: Props) {
  const sections = report.sections ?? [];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-report-text-primary">{agent.name}</h2>
          <p className="text-sm text-report-text-secondary mt-1">{agent.description}</p>
        </div>
        <Chip type="outline" size="medium" text="내보내기" radius="rounded-2" />
      </div>

      {/* Sequential sections */}
      <div className="space-y-8">
        {(() => {
          const elements: React.ReactNode[] = [];
          let i = 0;
          while (i < sections.length) {
            const section = sections[i];

            // DonutChart → 다음 섹션과 2열 그리드로 묶기
            if (section.componentType === "DonutChart" && i + 1 < sections.length) {
              const next = sections[i + 1];
              elements.push(
                <div key={section.id} className="bg-report-bg rounded-container p-[24px]">
                  <div className="grid grid-cols-2 gap-[24px]">
                    <div>
                      {section.label && (
                        <h3 className="report-section-title mb-3">{section.label}</h3>
                      )}
                      {renderComponent(section.componentType, section.data)}
                    </div>
                    <div>
                      {next.label && next.componentType !== "ExecutiveSummary" && (
                        <h3 className="report-section-title mb-3">{next.label}</h3>
                      )}
                      {renderComponent(next.componentType, next.data)}
                    </div>
                  </div>
                </div>
              );
              i += 2;
              continue;
            }

            // ExecutiveSummary — 자체 컨테이너
            if (section.componentType === "ExecutiveSummary") {
              elements.push(
                <div key={section.id}>
                  {renderComponent(section.componentType, section.data)}
                </div>
              );
              i++;
              continue;
            }

            // 기본 — bg-report-bg 컨테이너로 감쌈
            elements.push(
              <div key={section.id}>
                {section.label && (
                  <h3 className="report-section-title mb-3">{section.label}</h3>
                )}
                <div className="bg-report-bg rounded-container p-[24px]">
                  {renderComponent(section.componentType, section.data)}
                </div>
              </div>
            );
            i++;
          }
          return elements;
        })()}
      </div>
    </div>
  );
}
