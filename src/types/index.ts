// ─── Agent Definition ──────────────────────────────────────────────────────

export type AgentCategory = "research" | "prediction" | "strategy" | "analysis" | "operational";
export type InputType = "none" | "survey-form" | "text" | "file";
export type LayoutType = "tab-grid" | "single-repeat" | "single-section";
export type ModalType = "none" | "tab-detail" | "persona-detail";

import { VALID_COMPONENT_NAMES } from "@/lib/constants";

/** VALID_COMPONENT_NAMES (constants.ts) 에서 자동 파생 */
export type ComponentType = (typeof VALID_COMPONENT_NAMES)[number] | string;

export interface TabSection {
  id: string;
  label: string;
  componentType: ComponentType;
  hasViewDetail?: boolean;
}

export interface ReportTab {
  id: string;
  label: string;
  sections: TabSection[];
}

export interface ReportSection {
  id: string;
  label: string;
  componentType: ComponentType;
  repeatsPerItem?: boolean;
  reason?: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  inputType: InputType;
  layout: LayoutType;
  modalType: ModalType;
  reportTabs?: ReportTab[];       // layout: "tab-grid" only
  reportSections?: ReportSection[]; // layout: "single-repeat" | "single-section" only
  promptTemplate: string;
}

// ─── Report Schema ─────────────────────────────────────────────────────────

export interface ReportMeta {
  agentId: string;
  agentName: string;
  createdAt: string;
}

export interface ExecutiveSummary {
  keyFindings: string[];
  description?: string;
  topMetrics?: Array<{ label: string; value: string | number }>;
  distributions?: Array<{ label: string; data: Record<string, unknown> }>;
}

export interface ReportSectionData {
  id: string;
  label: string;
  componentType: ComponentType;
  data: unknown;
}

export interface ReportTabData {
  id: string;
  label: string;
  sections: ReportSectionData[];
}

export interface ReportSchema {
  meta: ReportMeta;
  executiveSummary: ExecutiveSummary;
  tabs?: ReportTabData[];
  sections?: ReportSectionData[];
}

// ─── Component Data Types ──────────────────────────────────────────────────

export interface BulletCardData {
  title: string;
  value?: string | number;
  bullets: string[];
}

export interface BarChartItem {
  label: string;
  value: number; // percentage 0-100
  count?: number;
}

export interface HorizontalBarChartData {
  question?: string;
  items: BarChartItem[];
}

export interface InterpretationBlockData {
  title?: string;
  text: string;
}

export interface InsightCardItem {
  badge?: string;
  value: string;
  description: string;
  interpretation?: string;
}

/** 단일 또는 배열 — 배열이면 가로 그리드(최대 3열) */
export type InsightCardData = InsightCardItem | { items: InsightCardItem[] };

export interface UserCardItem {
  name: string;
  subtitle: string;
  description: string;
}

export interface UserCardData {
  items: UserCardItem[];
  hasViewDetail?: boolean;
  /** PersonaModal과 연동 — View Detail 클릭 시 모달에 표시할 데이터 */
  personaModal?: PersonaModalData;
}

export interface ClusterCardItem {
  badge: string;
  badgeColor?: string;
  title: string;
  description: string;
}

export interface ClusterCardData {
  items: ClusterCardItem[];
}

export interface StrategyTableRow {
  strategy: string;
  objective: string;
  actionPlan: string;
  expectedImpact: string;
}

export interface StrategyTableData {
  immediate: StrategyTableRow[];
  short: StrategyTableRow[];
  mid: StrategyTableRow[];
}

export interface RevenueScenario {
  label: "Upside" | "Base" | "Downside" | string;
  badge?: string;
  details?: string[];
  highlight?: string;
  value: number;
  description?: string;
}

export interface RevenueScenarioBarData {
  unit?: string;
  scenarios: RevenueScenario[];
}

export interface SectionTitleData {
  title: string;
  subtitle?: string;
}

export interface PieBarChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface PieBarChartData {
  pieTitle?: string;
  pieItems: PieBarChartItem[];
  barTitle?: string;
  barItems: PieBarChartItem[];
  legends?: Array<{ label: string; color: string }>;
}

export interface PersonaModalPersona {
  name: string;
  subtitle: string;
  description: string;
  details?: Array<{ label: string; content: string }>;
}

export interface PersonaModalData {
  title: string;
  personas: PersonaModalPersona[];
}

export interface MetricHighlightItem {
  label: string;
  value: string | number;
  sub?: string;
  description: string;
}

/** 단일 또는 배열 — 배열이면 가로 그리드(최대 3열) */
export type MetricHighlightData = MetricHighlightItem | { items: MetricHighlightItem[] };

export interface ChecklistCardData {
  title: string;
  description: string;
}

// ─── Modal Detail Types ────────────────────────────────────────────────────

export interface TabDetailData {
  title: string;
  tabs: Array<{
    id: string;
    label: string;
    subTabs?: Array<{
      id: string;
      label: string;
      sections: ReportSectionData[];
    }>;
    sections?: ReportSectionData[];
  }>;
}


// ─── Survey Form ───────────────────────────────────────────────────────────

export interface SurveyQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "number";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface SurveyFormDefinition {
  questions: SurveyQuestion[];
}
