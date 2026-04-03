// ─── Agent Definition ──────────────────────────────────────────────────────

export type AgentCategory = "research" | "prediction" | "strategy" | "analysis";
export type InputType = "none" | "survey-form" | "text" | "file";
export type LayoutType = "tab-grid" | "single-repeat" | "single-section";
export type ModalType = "none" | "tab-detail" | "persona-detail";

export type ComponentType =
  | "MetricCard"
  | "BulletCard"
  | "ScoreCard"
  | "DoDontCard"
  | "SampleCard"
  | "HorizontalBarChart"
  | "InterpretationBlock"
  | "SyntheticPersonaCard"
  | "SignalCard"
  | "StrategyTable"
  | "RevenueScenarioBar"
  | "ExecutiveSummary"
  | "DonutChart"
  | "DataTable"
  | string; // extensible

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

export interface MetricCardData {
  items: Array<{ label: string; value: string | number; unit?: string }>;
}

export interface BulletCardData {
  title: string;
  value?: string | number;
  bullets: string[];
}

export interface ScoreCardData {
  score: number;
  maxScore: number;
  badge: string;
  badgeColor?: string; // tailwind color class
  bullets: string[];
}

export interface DoDontCardData {
  dos: string[];
  donts: string[];
}

export interface SampleCardData {
  items: Array<{ id: string; bullets: string[] }>;
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
  text: string;
}

export interface PersonaTab {
  label: "Personality" | "Lifestyle" | "Consumption" | string;
  content: string;
}

export interface SyntheticPersonaCardData {
  items: Array<{
    id: string;
    name?: string;
    gender?: string;
    age?: number;
    job?: string;
    summary?: string;
    tabs: PersonaTab[];
  }>;
}

export interface SignalCardItem {
  signalName: string;
  bullets: string[];
  badge?: string;
  badgeColor?: string;
}

export interface SignalCardData {
  items: SignalCardItem[];
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
  value: number;
  description?: string;
}

export interface RevenueScenarioBarData {
  unit?: string;
  scenarios: RevenueScenario[];
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

export interface PersonaDetailData {
  name: string;
  gender: string;
  age: number;
  job: string;
  tabs: PersonaTab[];
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
