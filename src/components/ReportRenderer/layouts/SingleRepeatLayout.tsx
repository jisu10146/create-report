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
        {sections.map((section) => (
          <div key={section.id}>
            {section.label && section.componentType !== "ExecutiveSummary" && (
              <h3 className="report-section-title mb-2">
                {section.label}
              </h3>
            )}
            {section.componentType === "ExecutiveSummary" ? (
              renderComponent(section.componentType, section.data)
            ) : (
              <div className="bg-report-bg rounded-container p-[24px]">
                {renderComponent(section.componentType, section.data)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
