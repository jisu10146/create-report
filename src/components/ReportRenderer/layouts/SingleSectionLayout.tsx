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
          <h2 className="text-xl font-semibold text-gray-900">{agent.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
        </div>
        <Chip type="outline" size="medium" text="내보내기" radius="rounded-2" />
      </div>

      {/* Sequential sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id}>
            {section.label && section.componentType !== "ExecutiveSummary" && (
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                {section.label}
              </h3>
            )}
            {renderComponent(section.componentType, section.data)}
          </div>
        ))}
      </div>
    </div>
  );
}
