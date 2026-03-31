import type { ReportSchema, AgentDefinition } from "@/types";
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
        <button className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition-colors">
          내보내기
        </button>
      </div>

      {/* Sequential sections, no drilldown */}
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
