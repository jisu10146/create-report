import type { ReportSchema, AgentDefinition } from "@/types";
import TabGridLayout from "./layouts/TabGridLayout";
import SingleRepeatLayout from "./layouts/SingleRepeatLayout";
import SingleSectionLayout from "./layouts/SingleSectionLayout";

interface Props {
  report: ReportSchema;
  agent: AgentDefinition;
}

/**
 * ReportRenderer — routes to the correct layout based on agent.layout.
 * Adding a new layout: create the layout component and add a case here.
 */
export default function ReportRenderer({ report, agent }: Props) {
  switch (agent.layout) {
    case "tab-grid":
      return <TabGridLayout report={report} agent={agent} />;
    case "single-repeat":
      return <SingleRepeatLayout report={report} agent={agent} />;
    case "single-section":
      return <SingleSectionLayout report={report} agent={agent} />;
    default:
      return (
        <div className="text-sm text-red-500 p-4 border border-red-200 rounded-xl">
          알 수 없는 레이아웃: {(agent as AgentDefinition).layout}
        </div>
      );
  }
}
