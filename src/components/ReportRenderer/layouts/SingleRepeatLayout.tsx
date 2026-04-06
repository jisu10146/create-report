"use client";

import type { ReportSchema, AgentDefinition } from "@/types";
import { Chip } from "@cubig/design-system";
import { renderComponent } from "../components";

interface Props {
  report: ReportSchema;
  agent: AgentDefinition;
}

export default function SingleRepeatLayout({ report, agent }: Props) {
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

      {/* Sections */}
      <div className="space-y-6">
        {(() => {
          const elements: React.ReactNode[] = [];
          let i = 0;
          while (i < sections.length) {
            const section = sections[i];

            if (section.componentType === "ExecutiveSummary") {
              elements.push(
                <div key={section.id}>
                  {renderComponent(section.componentType, section.data)}
                </div>
              );
              i++;
              continue;
            }

            // InterpretationBlock / ChecklistCard 단독 — 타이틀 없이 앞에 붙임
            if (section.componentType === "InterpretationBlock" || section.componentType === "ChecklistCard") {
              elements.push(
                <div key={section.id} className="-mt-2">
                  <div className="bg-report-bg rounded-section p-[8px]">
                    {renderComponent(section.componentType, section.data)}
                  </div>
                </div>
              );
              i++;
              continue;
            }

            // 기본 — 다음 섹션이 IB/CC이면 같은 박스에 포함
            const attached: typeof sections = [];
            let j = i + 1;
            while (j < sections.length && (sections[j].componentType === "InterpretationBlock" || sections[j].componentType === "ChecklistCard")) {
              attached.push(sections[j]);
              j++;
            }

            elements.push(
              <div key={section.id}>
                {section.label && (
                  <h3 className="report-section-title mb-2">{section.label}</h3>
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
          return elements;
        })()}
      </div>
    </div>
  );
}
