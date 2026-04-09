import React from "react";
import { VALID_COMPONENT_NAMES } from "@/lib/constants";
import { DS_COMPONENT_MAP } from "@/lib/design-system/ds-adapter";
import DSClientSwap from "@/lib/design-system/DSClientSwap";

// ─── 자체 컴포넌트 (fallback) ───
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

// ─── DS 컴포넌트 (디자이너 디자인 시스템) ───
import {
  DSDonutChart,
  DSHBarChart,
  DSStackedBarChart,
  DSTrendLineChart,
  canDSHandleStackedBar,
} from "@/lib/design-system/ds-adapter";

/**
 * FALLBACK_REGISTRY — 자체 구현 컴포넌트 (DS에 없을 때 사용)
 */
const FALLBACK_REGISTRY: Record<string, React.ComponentType<{ data: unknown }>> = {
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

/**
 * DS_REGISTRY — 디자이너 디자인 시스템 컴포넌트 (DS에 있는 것만)
 */
const DS_REGISTRY: Record<string, React.ComponentType<{ data: unknown }>> = {
  DonutChart: DSDonutChart as React.ComponentType<{ data: unknown }>,
  HorizontalBarChart: DSHBarChart as React.ComponentType<{ data: unknown }>,
  StackedBarChart: DSStackedBarChart as React.ComponentType<{ data: unknown }>,
  TrendLineChart: DSTrendLineChart as React.ComponentType<{ data: unknown }>,
};

/**
 * useDesignSystem — DS 모드 토글
 * true: DS 컴포넌트 우선, 없으면 fallback
 * false: 항상 자체 컴포넌트
 */
let USE_DS = true;
export function setUseDesignSystem(use: boolean) { USE_DS = use; }
export function getUseDesignSystem() { return USE_DS; }

/**
 * COMPONENT_REGISTRY — 최종 렌더링에 사용되는 레지스트리
 * DS 모드면 DS 우선 → fallback, 아니면 fallback만
 */
export const COMPONENT_REGISTRY = new Proxy(FALLBACK_REGISTRY, {
  get(target, prop: string) {
    if (USE_DS && DS_REGISTRY[prop]) {
      return DS_REGISTRY[prop];
    }
    return target[prop];
  },
});

/* ── 런타임 검증: 3곳(constants, registry, DS map) 일치 체크 ── */
if (typeof window !== "undefined" || process.env.NODE_ENV === "development") {
  const registryKeys = new Set(Object.keys(FALLBACK_REGISTRY));
  const validKeys = new Set(VALID_COMPONENT_NAMES);
  const dsKeys = new Set(Object.keys(DS_COMPONENT_MAP));

  // 1. constants ↔ registry
  for (const name of VALID_COMPONENT_NAMES) {
    if (!registryKeys.has(name)) {
      console.warn(`[Sync] "${name}" is in constants.ts but missing from FALLBACK_REGISTRY`);
    }
  }
  for (const name of registryKeys) {
    if (!validKeys.has(name)) {
      console.warn(`[Sync] "${name}" is in FALLBACK_REGISTRY but missing from constants.ts`);
    }
  }

  // 2. DS map에 있는데 registry에 없는 컴포넌트 (DS 매핑이 무의미)
  for (const name of dsKeys) {
    if (!registryKeys.has(name)) {
      console.warn(`[Sync] "${name}" is in DS_COMPONENT_MAP but missing from FALLBACK_REGISTRY`);
    }
  }

  // 3. registry에 있는데 DS map에 없는 컴포넌트 (DS 커버리지 누락)
  const unmapped = [...registryKeys].filter((name) => !dsKeys.has(name));
  if (unmapped.length > 0) {
    console.warn(`[Sync] DS_COMPONENT_MAP에 누락: ${unmapped.join(", ")}`);
  }

  // DS 커버리지 요약
  const { getDSCoverageReport } = require("@/lib/design-system/ds-adapter");
  const report = getDSCoverageReport();
  console.log(`[DS] ${report.mapped}/${report.total} 컴포넌트 매핑 (${report.coveragePercent}%)`);
  if (report.missingComponents.length > 0) {
    console.log(`[DS] 디자인 시스템 고도화 필요:`);
    report.missingComponents.forEach((c: { name: string; note: string }) => console.log(`  ❌ ${c.name}: ${c.note}`));
  }
}

/**
 * renderComponent — 3단계 컴포넌트 매칭
 *
 * 1단계: DS에 있으면 DS (현재 SSR 이슈로 fallback 사용, DS 준비되면 전환)
 * 2단계: 자체 컴포넌트에 있으면 자체
 * 3단계: 둘 다 없으면 DesignNeeded 플레이스홀더
 */
function DesignNeededPlaceholder({ componentType, data }: { componentType: string; data: unknown }) {
  const spec = (data as { _newComponentSpec?: string })?._newComponentSpec;
  return React.createElement("div", {
    className: "bg-report-card rounded-card p-[24px] border-2 border-dashed border-report-border",
  },
    React.createElement("div", { className: "flex items-center gap-2 mb-2" },
      React.createElement("span", { className: "text-xs font-semibold text-report-text-secondary bg-report-bg px-2 py-1 rounded" }, "디자인 필요"),
      React.createElement("span", { className: "text-sm font-semibold text-report-text-primary" }, componentType),
    ),
    spec && React.createElement("p", { className: "text-xs text-report-text-secondary" }, spec),
  );
}

export function renderComponent(componentType: string, data: unknown): React.ReactElement | null {
  const BuiltIn = FALLBACK_REGISTRY[componentType];
  const DSComp = USE_DS ? DS_REGISTRY[componentType] : null;

  // 1단계: DS에 있고 + 자체에도 있으면 → DSClientSwap (서버: fallback, 클라이언트: DS)
  if (DSComp && BuiltIn) {
    // StackedBarChart: 커스텀 colors가 있으면 DS 불가 → fallback만
    if (componentType === "StackedBarChart" && !canDSHandleStackedBar(data)) {
      return React.createElement(BuiltIn, { data });
    }
    return React.createElement(DSClientSwap, {
      fallback: React.createElement(BuiltIn, { data }),
      ds: React.createElement(DSComp, { data }),
    });
  }

  // 2단계: 자체 컴포넌트만 있으면
  if (BuiltIn) {
    return React.createElement(BuiltIn, { data });
  }

  // 3단계: 둘 다 없으면 → 디자인 필요 플레이스홀더
  console.warn(`[디자인 필요] "${componentType}" — DS에도 자체에도 없는 컴포넌트`);
  return React.createElement(DesignNeededPlaceholder, { componentType, data });
}
