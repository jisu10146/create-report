import React from "react";
import { VALID_COMPONENT_NAMES } from "@/lib/constants";
import BulletCard from "./BulletCard";
import HorizontalBarChart from "./HorizontalBarChart";
import InterpretationBlock from "./InterpretationBlock";
import StrategyTable from "./StrategyTable";
import ExecutiveSummary from "./ExecutiveSummary";
import DonutChart from "./DonutChart";
import DataTable from "./DataTable";
import InsightCard from "./InsightCard";
import UserCard from "./UserCard";
import ClusterCard from "./ClusterCard";
import SectionTitle from "./SectionTitle";
import PersonaModal from "./PersonaModal";
import MetricHighlight from "./MetricHighlight";
import ChecklistCard from "./ChecklistCard";
import RevenueScenarioBar from "./RevenueScenarioBar";
import PieBarChart from "./PieBarChart";
import FunnelChart from "./FunnelChart";
import StackedBarChart from "./StackedBarChart";
import TrendLineChart from "./TrendLineChart";

/**
 * COMPONENT_REGISTRY — componentType → React component
 *
 * ⚠ 이 목록은 constants.ts COMPONENT_DEFINITIONS 과 1:1 대응해야 함.
 *   아래 런타임 검증이 불일치를 자동 감지함.
 */
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<{ data: unknown }>> = {
  ExecutiveSummary: ExecutiveSummary as React.ComponentType<{ data: unknown }>,
  SectionTitle: SectionTitle as React.ComponentType<{ data: unknown }>,
  BulletCard: BulletCard as React.ComponentType<{ data: unknown }>,
  HorizontalBarChart: HorizontalBarChart as React.ComponentType<{ data: unknown }>,
  DonutChart: DonutChart as React.ComponentType<{ data: unknown }>,
  DataTable: DataTable as React.ComponentType<{ data: unknown }>,
  InterpretationBlock: InterpretationBlock as React.ComponentType<{ data: unknown }>,
  InsightCard: InsightCard as React.ComponentType<{ data: unknown }>,
  ClusterCard: ClusterCard as React.ComponentType<{ data: unknown }>,
  UserCard: UserCard as React.ComponentType<{ data: unknown }>,
  StrategyTable: StrategyTable as React.ComponentType<{ data: unknown }>,
  PersonaModal: PersonaModal as React.ComponentType<{ data: unknown }>,
  MetricHighlight: MetricHighlight as React.ComponentType<{ data: unknown }>,
  ChecklistCard: ChecklistCard as React.ComponentType<{ data: unknown }>,
  RevenueScenarioBar: RevenueScenarioBar as React.ComponentType<{ data: unknown }>,
  PieBarChart: PieBarChart as React.ComponentType<{ data: unknown }>,
  FunnelChart: FunnelChart as React.ComponentType<{ data: unknown }>,
  StackedBarChart: StackedBarChart as React.ComponentType<{ data: unknown }>,
  TrendLineChart: TrendLineChart as React.ComponentType<{ data: unknown }>,
};

/* ── 런타임 검증: VALID_COMPONENT_NAMES ↔ REGISTRY 일치 체크 ── */
if (typeof window !== "undefined" || process.env.NODE_ENV === "development") {
  const registryKeys = new Set(Object.keys(COMPONENT_REGISTRY));
  const validKeys = new Set(VALID_COMPONENT_NAMES);

  for (const name of VALID_COMPONENT_NAMES) {
    if (!registryKeys.has(name)) {
      console.warn(`[ComponentRegistry] "${name}" is in VALID_COMPONENTS but missing from REGISTRY`);
    }
  }
  for (const name of registryKeys) {
    if (!validKeys.has(name)) {
      console.warn(`[ComponentRegistry] "${name}" is in REGISTRY but missing from VALID_COMPONENTS`);
    }
  }
}

export function renderComponent(componentType: string, data: unknown): React.ReactElement | null {
  const Component = COMPONENT_REGISTRY[componentType];
  if (!Component) {
    console.warn(`Unknown componentType: "${componentType}"`);
    return null;
  }
  return React.createElement(Component, { data });
}
