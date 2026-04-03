/**
 * 리포트 시스템 공통 상수
 * 에이전트 생성, 검토, 리포트 생성에서 공유.
 */

/* ─── Volume ─── */

export const VOLUME_GUIDE: Record<string, string> = {
  compact: "3~4개 섹션. 핵심 지표 + 결론만.",
  standard: "6~8개 섹션. 분석 + 인사이트 + 실행안.",
  detailed: "8~12개 섹션. 데이터 심층 분석 + 페르소나 + 전략.",
};

export const VOLUME_LIMITS: Record<string, number> = {
  compact: 4,
  standard: 8,
  detailed: 12,
};

/* ─── Audience ─── */

export const AUDIENCE_GUIDE: Record<string, string> = {
  "경영진 (C-level)": "수치 중심, 요약 우선, 실행 결정에 필요한 정보만.",
  "팀 리더 / 매니저": "인사이트 + 실행안 균형.",
  "실무 담당자": "상세 데이터, 차트, 해석 포함.",
  "외부 클라이언트": "깔끔한 시각화, 전문적 톤.",
};

/* ─── Valid Components ─── */

export const VALID_COMPONENTS = new Set([
  "ExecutiveSummary", "BulletCard", "HorizontalBarChart", "InterpretationBlock",
  "StrategyTable", "RevenueScenarioBar", "DonutChart", "DataTable",
  "InsightCard", "UserCard", "ClusterCard",
  "SectionTitle", "PieBarChart", "PersonaModal",
]);

/* ─── System Prompts ─── */

/** 에이전트 구성안 설계용 시스템 프롬프트 */
export const DESIGN_SYSTEM_PROMPT = `너는 B2B SaaS 리포트 구성 전문가야.
에이전트 설명을 읽고, 이 리포트를 받는 사람이 어떤 결정을 내려야 하는지 먼저 파악해.
그 결정에 필요한 섹션만 골라서 구성안을 만들어줘.

사용 가능한 컴포넌트 (이것들만 사용):
- ExecutiveSummary: 핵심 발견 요약 (항상 맨 앞에 배치)
- SectionTitle: 섹션 타이틀 + 서브 헤드라인
- BulletCard: 제목 + 수치 + 불릿 리스트
- HorizontalBarChart: 수평 막대 차트 (항목별 비교)
- DonutChart: 도넛 차트 + 범례
- PieBarChart: 파이 차트 + 바 차트 조합
- DataTable: 데이터 비교 테이블
- InterpretationBlock: AI 해석 블록 (반드시 차트 바로 뒤에만 배치)
- InsightCard: 인사이트 카드 (뱃지 + 핵심 발견 + 설명 + 해석 콜아웃)
- ClusterCard: 클러스터 정보 카드 (뱃지 + 아이콘 + 제목 + 설명)
- UserCard: 사용자/페르소나 프로필 카드 (이름 + 인구통계 + 설명)
- StrategyTable: 실행 계획 테이블 (즉시/단기/중기)
- RevenueScenarioBar: 수익/성과 시나리오 비교 차트
- PersonaModal: 가상 응답자 상세 모달

규칙:
- ExecutiveSummary는 항상 첫 번째
- InterpretationBlock은 HorizontalBarChart 바로 뒤에만 올 수 있음
- 같은 컴포넌트를 중복 사용하지 않음 (MetricCard만 예외)
- 각 섹션의 label은 한국어로

출력 형식 (JSON만, 설명 없이):
{
  "sections": [
    {
      "id": "kebab-case-id",
      "label": "한국어 라벨",
      "componentType": "컴포넌트명",
      "reason": "이 섹션을 넣은 이유"
    }
  ],
  "category": "research | prediction | strategy | analysis",
  "inputType": "none | survey-form | text | file",
  "layout": "single-section",
  "modalType": "none | persona-detail"
}`;

/** 샘플 리포트 생성용 시스템 프롬프트 (agentGenerator.ts에서 보존) */
export const SAMPLE_REPORT_SYSTEM = `You are a B2B SaaS data analyst generating realistic mock report data.
Always respond with valid JSON only. No markdown fences. No explanation.
The JSON must match the ReportSchema structure exactly.`;
