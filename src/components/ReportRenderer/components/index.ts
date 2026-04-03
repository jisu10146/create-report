import React from "react";
import BulletCard from "./BulletCard";
import HorizontalBarChart from "./HorizontalBarChart";
import InterpretationBlock from "./InterpretationBlock";
import StrategyTable from "./StrategyTable";
import RevenueScenarioBar from "./RevenueScenarioBar";
import ExecutiveSummary from "./ExecutiveSummary";
import DonutChart from "./DonutChart";
import DataTable from "./DataTable";
import InsightCard from "./InsightCard";
import UserCard from "./UserCard";
import ClusterCard from "./ClusterCard";
import SectionTitle from "./SectionTitle";
import PieBarChart from "./PieBarChart";
import PersonaModal from "./PersonaModal";

// Registry: componentType string → React component
// Adding a new component: import it above and add the entry here.
// No other file needs to change.
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<{ data: unknown }>> = {
  BulletCard: BulletCard as React.ComponentType<{ data: unknown }>,
  HorizontalBarChart: HorizontalBarChart as React.ComponentType<{ data: unknown }>,
  InterpretationBlock: InterpretationBlock as React.ComponentType<{ data: unknown }>,
  StrategyTable: StrategyTable as React.ComponentType<{ data: unknown }>,
  RevenueScenarioBar: RevenueScenarioBar as React.ComponentType<{ data: unknown }>,
  ExecutiveSummary: ExecutiveSummary as React.ComponentType<{ data: unknown }>,
  DonutChart: DonutChart as React.ComponentType<{ data: unknown }>,
  DataTable: DataTable as React.ComponentType<{ data: unknown }>,
  InsightCard: InsightCard as React.ComponentType<{ data: unknown }>,
  UserCard: UserCard as React.ComponentType<{ data: unknown }>,
  ClusterCard: ClusterCard as React.ComponentType<{ data: unknown }>,
  SectionTitle: SectionTitle as React.ComponentType<{ data: unknown }>,
  PieBarChart: PieBarChart as React.ComponentType<{ data: unknown }>,
  PersonaModal: PersonaModal as React.ComponentType<{ data: unknown }>,
};

export function renderComponent(componentType: string, data: unknown): React.ReactElement | null {
  const Component = COMPONENT_REGISTRY[componentType];
  if (!Component) {
    console.warn(`Unknown componentType: "${componentType}"`);
    return null;
  }
  return React.createElement(Component, { data });
}
