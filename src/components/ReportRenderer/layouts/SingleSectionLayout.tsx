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
            // 타이틀은 박스 밖, DonutChart 5 : 우측 7 비율
            if (section.componentType === "DonutChart" && i + 1 < sections.length) {
              const next = sections[i + 1];
              elements.push(
                <div key={section.id}>
                  <div className="grid grid-cols-12 gap-[24px] mb-3">
                    <div className="col-span-5">
                      {section.label && (
                        <h3 className="report-section-title">{section.label}</h3>
                      )}
                    </div>
                    <div className="col-span-7">
                      {next.label && next.componentType !== "ExecutiveSummary" && (
                        <h3 className="report-section-title">{next.label}</h3>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-[24px] items-stretch">
                    <div className="col-span-5 flex flex-col">
                      <div className="bg-report-bg rounded-section p-[8px] flex-1">
                        {renderComponent(section.componentType, section.data)}
                      </div>
                    </div>
                    <div className="col-span-7">
                      <div className="bg-report-bg rounded-section p-[8px] h-full">
                        {renderComponent(next.componentType, next.data)}
                      </div>
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

            // InterpretationBlock / ChecklistCard — 타이틀 없이 앞 섹션에 붙임 (독립 렌더링 시)
            if (section.componentType === "InterpretationBlock" || section.componentType === "ChecklistCard") {
              elements.push(
                <div key={section.id} className="-mt-4">
                  <div className="bg-report-bg rounded-section p-[8px]">
                    {renderComponent(section.componentType, section.data)}
                  </div>
                </div>
              );
              i++;
              continue;
            }

            // 기본 — bg-report-bg 컨테이너로 감쌈
            // 다음 섹션이 InterpretationBlock/ChecklistCard이면 같은 박스에 포함
            {
              const attached: typeof sections = [];
              let j = i + 1;
              while (j < sections.length && (sections[j].componentType === "InterpretationBlock" || sections[j].componentType === "ChecklistCard")) {
                attached.push(sections[j]);
                j++;
              }

              elements.push(
                <div key={section.id}>
                  {section.label && (
                    <h3 className="report-section-title mb-3">{section.label}</h3>
                  )}
                  <div className="bg-report-bg rounded-section p-[8px] flex flex-col gap-[8px]">
                    {renderComponent(section.componentType, section.data)}
                    {attached.map((att) => (
                      <div key={att.id}>{renderComponent(att.componentType, att.data)}</div>
                    ))}
                  </div>
                </div>
              );
              i = j;
            }
          }
          return elements;
        })()}
      </div>
    </div>
  );
}
