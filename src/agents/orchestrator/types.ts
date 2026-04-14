/**
 * 멀티 에이전트 오케스트레이션 — 에이전트 간 공유 타입
 *
 * 흐름:
 *   서비스 입력 (OrchestratorInput)
 *     → 1단계: Data Analyst + Domain Expert (병렬)
 *     → 2단계: Strategy Writer
 *     → 3단계: Chart Specialist
 *     → 4단계: PM 조립 + 검증 → AgentBlueprint
 *     → 5단계: Sample Generator → ReportSchema
 *     → 6단계: Preview 렌더링
 */

// ─── 서비스 입력 ───────────────────────────────────────────────

export interface DataProfile {
  /** 데이터셋 요약 */
  rowCount: number;
  columnCount: number;
  columns: Array<{
    name: string;
    type: "numeric" | "categorical" | "datetime" | "text";
    nullRate: number;
    uniqueCount: number;
    summary?: string;
  }>;
  /** 서비스에서 이미 파악한 특이사항 */
  notes?: string[];
}

export interface OrchestratorInput {
  agentName: string;
  description: string;
  /** 서비스에서 프로파일링 완료된 데이터 (없으면 mock 기반으로 진행) */
  dataProfile?: DataProfile;
  /** VOC 원문 데이터 (있으면 코드 전처리 → LLM에 요약만 전달) */
  vocRawData?: Array<Record<string, unknown>>;
  /** 분량 힌트 */
  volume?: "compact" | "standard" | "detailed";
  /** 독자 힌트 */
  audience?: string;
}

// ─── VOC 전처리 출력 (코드가 생성, LLM 토큰 절약) ────────────

export interface VocPreprocessOutput {
  /** 데이터 소스 추정 */
  source: "review" | "nps" | "cs-text" | "b2b-feedback" | "social" | "general";
  /** 기본 통계 */
  stats: {
    total: number;
    avgScore: number | null;
    scoreDistribution: Record<string, number>; // { "1": 102, "2": 13, ... }
    sentimentCounts: { positive: number; neutral: number; negative: number };
    sentimentRates: { positive: number; neutral: number; negative: number }; // %
    dateRange: { from: string; to: string } | null;
  };
  /** 양극화 분석 (별점 있을 때만) */
  polarization: {
    detected: boolean;
    extremeRate: number; // 1점+5점 합산 %
    proxy: {
      avgLength: Record<string, number>; // 점수별 평균 글자수
      shortReviewRate: Record<string, number>; // 점수별 5자 이하 비율 %
    };
  } | null;
  /** 토픽 분류 결과 */
  topics: Array<{
    name: string;
    count: number;
    weight: number; // %
    sentimentBreakdown: { positive: number; neutral: number; negative: number }; // %
    negativeRate: number; // %
    impact: number; // weight × negativeRate / 100
    /** 대표 verbatim (thumbsUp 높은 순, 최대 3개) */
    topVerbatims: Array<{
      content: string;
      score: number;
      thumbsUp: number;
    }>;
  }>;
  /** 긍정 테마 */
  positiveThemes: Array<{
    name: string;
    count: number;
    topVerbatims: Array<{ content: string; score: number }>;
  }>;
  /** 경쟁사 언급 */
  competitorMentions: {
    total: number;
    competitors: Array<{
      name: string;
      count: number;
      contexts: Array<{ content: string; score: number; context: "churn" | "comparison" | "positive" }>;
    }>;
  };
  /** 공감수 분석 (thumbsUp 데이터 있을 때만) */
  thumbsUpAnalysis: {
    highThumbsReviews: Array<{ content: string; score: number; thumbsUp: number }>;
    negativeRateInHighThumbs: number; // %
  } | null;
}

// ─── 1단계: Data Analyst 출력 ─────────────────────────────────

export interface DataAnalystOutput {
  /** 추천 분석 방법론 */
  methodology: string;
  /** 핵심 지표 + 어떤 컬럼에서 도출할지 */
  keyMetrics: Array<{
    name: string;
    source: string;
    rationale: string;
    /** 비교 가능한 벤치마크 유형 */
    benchmarkHint?: string;
  }>;
  /** 그룹/클러스터 구조 판단 */
  segments?: Array<{
    name: string;
    criteria: string;
    /** 이 세그먼트의 예상 차별점 */
    expectedDiff?: string;
  }>;
  /** 교차 분석 축 제안 */
  crossAxes?: Array<{
    axis1: string;
    axis2: string;
    rationale: string;
  }>;
  /** 전환 경로 패턴 (시퀀스 데이터 감지 시) */
  pathPatterns?: Array<{
    pattern: string;
    conversionRate: string;
    insight: string;
  }>;
  /** 시계열 분석 포인트 (datetime 컬럼 + 4주 이상 데이터 시) */
  timeSeriesHints?: string[];
  /** 분석 시 주의할 점 */
  dataFlags: string[];
}

// ─── 1단계: Domain Expert 출력 ────────────────────────────────

export interface DomainExpertOutput {
  /** 업계 기준치 */
  benchmarks: Array<{
    metric: string;
    value: string;
    source: string;
    /** 적용 맥락 (시장/규모/지역) */
    context?: string;
  }>;
  /** 도메인 용어 매핑 */
  terminology: Record<string, string>;
  /** 독자가 내릴 결정 + 필요 정보 */
  decisionFrame: {
    keyDecision: string;
    requiredInfo: string[];
    /** 판단 기준 (예: X% 이상이면 양호) */
    decisionCriteria?: string[];
  };
  /** 이 산업에서 유의미한 세그먼트 축 */
  segmentAxes?: string[];
  /** 사용한 skill 이름 */
  skillUsed?: string;
}

// ─── 2단계: Strategy Writer 출력 ──────────────────────────────

export interface StrategySectionDraft {
  id: string;
  label: string;
  reason: string;
  /** Chart Specialist에게 전달할 데이터 특성 힌트 */
  dataHint: string;
}

export interface StrategyWriterOutput {
  storyLine: string;
  keyDecision: string;
  category: "research" | "prediction" | "strategy" | "analysis" | "operational";
  headlines: string[];
  sections: StrategySectionDraft[];
  executiveSummary: {
    keyFindings: string[];
    description?: string;
  };
}

// ─── PM 검증 결과 ────────────────────────────────────────────

export interface PMFeedback {
  passed: boolean;
  issues: Array<{
    checkItem: string;        // 체크리스트 항목명
    sectionId?: string;       // 문제가 있는 섹션 (없으면 전체)
    problem: string;          // 무엇이 문제인지
    fix: string;              // 어떻게 고쳐야 하는지
    targetAgent: "strategy-writer" | "chart-specialist" | "sample-generator";
  }>;
}

// ─── 3단계: Chart Specialist 출력 ─────────────────────────────

export interface ChartSectionMapping {
  id: string;
  componentType: string;
  /** 컴포넌트 출처: ds(디자인시스템) | built-in(자체) | new(신규 제안) */
  source: "ds" | "built-in" | "new";
  /** source가 new일 때 디자인 필요 여부 */
  designNeeded?: boolean;
  /** source가 new일 때 신규 컴포넌트 설명 */
  newComponentSpec?: string;
  rationale: string;
  /** 시각화 파라미터 힌트 (색상, 축, 정렬 등) */
  visualParams?: Record<string, unknown>;
}

export interface ChartSpecialistOutput {
  sections: ChartSectionMapping[];
}

// ─── Persona Critic 출력 ─────────────────────────────────────

export interface PersonaCriticOutput {
  persona: string;
  sections: Array<{
    sectionId: string;
    priority: "high" | "medium" | "low";
    reason: string;
  }>;
  missing: Array<{
    what: string;
    why: string;
    suggestedPosition: string;
  }>;
  reorder: Array<{
    sectionId: string;
    moveTo: string;
    reason: string;
  }>;
  remove: Array<{
    sectionId: string;
    reason: string;
  }>;
}

// ─── 4단계: PM 최종 조립 결과 ─────────────────────────────────

export interface AgentSection {
  id: string;
  label: string;
  componentType: string;
  reason: string;
}

export interface AgentBlueprint {
  id: string;
  name: string;
  description: string;
  category: "research" | "prediction" | "strategy" | "analysis" | "operational";
  inputType: "none" | "survey-form" | "text" | "file";
  layout: "single-section" | "single-repeat" | "tab-grid";
  modalType: "none" | "persona-detail";
  reportSections: AgentSection[];
  storyLine: string;
  keyDecision: string;
  /** PM 검증 결과 */
  validation: {
    passed: boolean;
    violations: string[];
    qualityScore: number;
  };
}

// ─── 5단계: Sample Generator 출력 ─────────────────────────────
// → 기존 ReportSchema 타입 그대로 사용 (@/types)

// ─── Data Analyst 요약 (토큰 절약용) ─────────────────────────

/** Sample Generator 등 후속 단계에 전달할 DA 출력 요약 */
export interface DataAnalystSummary {
  methodology: string;
  keyMetricNames: string[];
  segmentNames: string[];
  dataFlags: string[];
  /** VoC 분석 시 토픽 목록만 전달 */
  topicNames?: string[];
  /** NPS 분석 시 점수만 전달 */
  npsScore?: number;
}

// ─── 전체 파이프라인 결과 ─────────────────────────────────────

export interface OrchestratorResult {
  blueprint: AgentBlueprint;
  /** 각 에이전트의 중간 출력 (디버깅/감사용) */
  trace: {
    dataAnalyst: DataAnalystOutput;
    domainExpert: DomainExpertOutput;
    strategyWriter: StrategyWriterOutput;
    chartSpecialist: ChartSpecialistOutput;
    /** VOC 전처리 결과 (vocRawData가 있었을 때만) */
    vocPreprocess?: VocPreprocessOutput;
  };
  /** 생성된 샘플 리포트 (ReportSchema) */
  sampleReport: unknown;
  /** 토큰 사용량 */
  tokenUsage?: {
    log: Array<{ stage: string; inputTokens: number; outputTokens: number; totalTokens: number }>;
    totals: { input: number; output: number; total: number };
  };
  /** Preview URL */
  previewUrl?: string;
}
