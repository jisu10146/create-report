import React from "react";
import MetricCard from "./MetricCard";
import BulletCard from "./BulletCard";
import ScoreCard from "./ScoreCard";
import DoDontCard from "./DoDontCard";
import SampleCard from "./SampleCard";
import HorizontalBarChart from "./HorizontalBarChart";
import InterpretationBlock from "./InterpretationBlock";
import SyntheticPersonaCard from "./SyntheticPersonaCard";
import SignalCard from "./SignalCard";
import StrategyTable from "./StrategyTable";
import RevenueScenarioBar from "./RevenueScenarioBar";
import ExecutiveSummary from "./ExecutiveSummary";

// Registry: componentType string → React component
// Adding a new component: import it above and add the entry here.
// No other file needs to change.
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<{ data: unknown }>> = {
  MetricCard: MetricCard as React.ComponentType<{ data: unknown }>,
  BulletCard: BulletCard as React.ComponentType<{ data: unknown }>,
  ScoreCard: ScoreCard as React.ComponentType<{ data: unknown }>,
  DoDontCard: DoDontCard as React.ComponentType<{ data: unknown }>,
  SampleCard: SampleCard as React.ComponentType<{ data: unknown }>,
  HorizontalBarChart: HorizontalBarChart as React.ComponentType<{ data: unknown }>,
  InterpretationBlock: InterpretationBlock as React.ComponentType<{ data: unknown }>,
  SyntheticPersonaCard: SyntheticPersonaCard as React.ComponentType<{ data: unknown }>,
  SignalCard: SignalCard as React.ComponentType<{ data: unknown }>,
  StrategyTable: StrategyTable as React.ComponentType<{ data: unknown }>,
  RevenueScenarioBar: RevenueScenarioBar as React.ComponentType<{ data: unknown }>,
  ExecutiveSummary: ExecutiveSummary as React.ComponentType<{ data: unknown }>,
};

export function renderComponent(componentType: string, data: unknown): React.ReactElement | null {
  const Component = COMPONENT_REGISTRY[componentType];
  if (!Component) {
    console.warn(`Unknown componentType: "${componentType}"`);
    return null;
  }
  return React.createElement(Component, { data });
}
