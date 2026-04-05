/**
 * 리포트 시스템 공통 상수
 * 에이전트 생성, 검토, 리포트 렌더링에서 공유.
 *
 * ⚠ 컴포넌트 추가/삭제 시 COMPONENT_DEFINITIONS 만 수정하면
 *   VALID_COMPONENTS, ComponentType, REGISTRY, PROMPT 전부 자동 반영됨.
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

/* ═══════════════════════════════════════════════════════════════════════════
   컴포넌트 정의 — 단일 소스 (Single Source of Truth)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ComponentDefinition {
  /** componentType 키 (PascalCase) */
  name: string;
  /** Claude 프롬프트에 들어갈 한줄 설명 */
  description: string;
  /** 배치 규칙 (프롬프트에 포함) */
  rule?: string;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  { name: "ExecutiveSummary", description: "핵심 발견 요약", rule: "항상 맨 앞에 배치" },
  { name: "SectionTitle", description: "섹션 타이틀 + 서브 헤드라인" },
  { name: "BulletCard", description: "제목 + 수치 + 불릿 리스트" },
  { name: "HorizontalBarChart", description: "수평 막대 차트 (항목별 비교)" },
  { name: "DonutChart", description: "도넛 차트 + 범례" },
  { name: "DataTable", description: "데이터 비교 테이블" },
  { name: "InterpretationBlock", description: "AI 해석 블록", rule: "반드시 차트 바로 뒤에만 배치" },
  { name: "InsightCard", description: "인사이트 카드 (뱃지 + 핵심 발견 + 설명 + 원인 콜아웃)", rule: "interpretation 필드에는 해결책이 아닌 근본 원인을 명시" },
  { name: "ClusterCard", description: "클러스터 정보 카드 (뱃지 + 아이콘 + 제목 + 설명)" },
  { name: "UserCard", description: "사용자/페르소나 프로필 카드 (이름 + 인구통계 + 설명)" },
  { name: "StrategyTable", description: "실행 계획 테이블 (즉시/단기/중기)" },
  { name: "PersonaModal", description: "가상 응답자 상세 모달" },
  { name: "MetricHighlight", description: "핵심 지표 강조 카드 (값 + 디바이더 + 설명)" },
  { name: "ChecklistCard", description: "체크리스트 카드 (체크 아이콘 + 제목 + 설명)" },
];

/** 유효 컴포넌트 이름 Set — 검증에 사용 */
export const VALID_COMPONENTS = new Set(COMPONENT_DEFINITIONS.map((c) => c.name));

/** 유효 컴포넌트 이름 배열 — 타입/레지스트리에서 참조 가능 */
export const VALID_COMPONENT_NAMES = COMPONENT_DEFINITIONS.map((c) => c.name);

/* ═══════════════════════════════════════════════════════════════════════════
   컴포넌트별 데이터 스키마 — 샘플 생성 프롬프트에 사용
   ═══════════════════════════════════════════════════════════════════════════ */

export const COMPONENT_DATA_SCHEMA: Record<string, string> = {
  ExecutiveSummary: `{
  "description": "리포트 요약 설명 (1-2문장)",
  "topMetrics": [{ "label": "string", "value": "string|number" }],
  "keyFindings": ["핵심 발견 3-5개"]
}`,
  SectionTitle: `{ "title": "string", "subtitle": "string" }`,
  BulletCard: `{ "title": "string", "value": "string|number (optional)", "bullets": ["string"] }`,
  HorizontalBarChart: `{
  "question": "차트 질문 (optional)",
  "items": [{ "label": "string", "value": 0-100, "count": number (optional) }]
}`,
  DonutChart: `{
  "title": "string (optional)",
  "items": [{ "label": "string", "value": number, "count": number (optional) }]
}`,
  DataTable: `{ "columns": [{ "label": "string" }], "rows": [{ "metric": "행 라벨", "values": ["string|number"] }], "showDots": false } — showDots는 클러스터 비교일 때만 true`,
  InterpretationBlock: `{ "title": "string (optional)", "text": "AI 해석 텍스트" }`,
  InsightCard: `{ "items": [{ "badge": "string (optional)", "value": "string", "description": "string", "interpretation": "근본 원인 (해결책X)" }] } — 1~3개, 배열이면 가로 그리드`,
  ClusterCard: `{ "items": [{ "badge": "string", "badgeColor": "#hex (optional)", "title": "string", "description": "string" }] }`,
  UserCard: `{ "items": [{ "name": "string", "subtitle": "성별, 나이, 직업", "description": "string" }], "hasViewDetail": true }`,
  StrategyTable: `{
  "immediate": [{ "strategy": "string", "objective": "string", "actionPlan": "string", "expectedImpact": "string" }],
  "short": [같은 형태],
  "mid": [같은 형태]
}`,
  PersonaModal: `{
  "title": "string",
  "personas": [{ "name": "string", "subtitle": "string", "description": "string", "details": [{ "label": "string", "content": "string" }] }]
}`,
  MetricHighlight: `{ "items": [{ "label": "string", "value": "string|number", "sub": "string (optional)", "description": "string" }] } — 1~3개, 배열이면 가로 그리드`,
  ChecklistCard: `{ "title": "string", "description": "string" }`,
};

/* ─── System Prompts ─── */

/** 컴포넌트 목록을 프롬프트 텍스트로 자동 생성 */
function buildComponentPromptList(): string {
  return COMPONENT_DEFINITIONS.map((c) => {
    const rule = c.rule ? ` (${c.rule})` : "";
    return `- ${c.name}: ${c.description}${rule}`;
  }).join("\n");
}

/** 에이전트 구성안 설계용 시스템 프롬프트 */
export const DESIGN_SYSTEM_PROMPT = `너는 B2B SaaS 리포트 구성 전문가야.

## 리포트 설계 원칙
구성안을 만들기 전에 아래 순서로 먼저 생각해:

1. 이 리포트를 받는 사람이 읽고 나서 내려야 할 결정이 뭔가?
2. 그 결정에 필요한 정보가 뭔가?
3. 정보를 어떤 순서로 보여줘야 자연스럽게 결론으로 이어지나?

좋은 리포트 기준:
- 독자가 3분 안에 핵심 파악 가능
- "문제 발견 → 원인 분석 → 해결 방향" 흐름으로 읽힘
- 모든 섹션이 최종 의사결정에 직접 기여
- 수치만 나열하지 않고 해석과 액션으로 연결
- 없어도 되는 섹션은 과감히 제거

## 사용 가능한 컴포넌트 (이것들만 사용)
${buildComponentPromptList()}

## 컴포넌트 선택 기준 — 데이터 특성 먼저 파악
에이전트 설명을 읽고 데이터 특성을 먼저 판단한 뒤 컴포넌트를 골라:
- 수치 비교가 핵심인가 → HorizontalBarChart
- 개별 사례/이벤트가 중요한가 → DataTable, UserCard
- 그룹/군집 구조가 있는가 → ClusterCard
- 비율/구성이 중요한가 → DonutChart
- 체크리스트/기준이 있는가 → ChecklistCard
- 핵심 지표 강조가 필요한가 → MetricHighlight
- 원인 진단이 핵심인가 → InsightCard
- 실행 계획이 필요한가 → StrategyTable

각 컴포넌트를 넣기 전에 자문해:
- 이 섹션이 없으면 독자가 어떤 결정을 못 내리나?
- 앞 섹션과 자연스럽게 이어지나?
- 다른 섹션과 내용이 겹치지 않나?

## 구성안 다양성 규칙 (중요!)
아래 4개가 항상 같이 나오는 패턴은 금지:
  HorizontalBarChart + InterpretationBlock + InsightCard + StrategyTable

에이전트 성격에 따라 조합을 달리해야 함:
- 개별 사례가 중요한 에이전트 → 차트 대신 DataTable
- 사람/프로필이 핵심인 에이전트 → InsightCard 대신 UserCard
- 분류/군집이 핵심인 에이전트 → InsightCard 대신 ClusterCard
- 기준/체크가 핵심인 에이전트 → StrategyTable 대신 ChecklistCard
- 구성비가 핵심인 에이전트 → HorizontalBarChart 대신 DonutChart

## 배치 규칙
- ExecutiveSummary는 항상 첫 번째
- 각 섹션의 label은 한국어로
- 섹션 수는 의사결정에 필요한 최소한으로

## 스토리라인 검증
구성안 완성 후 스스로 검증:
1. 섹션을 순서대로 한 줄 요약했을 때 하나의 논리적 흐름이 되는가?
   → 안 되면 순서 재배치 또는 섹션 교체
2. "이 조합이 다른 에이전트에도 똑같이 나올 수 있는가?"
   → 그렇다면 에이전트 특성이 반영 안 된 것. 다시 설계

출력 형식 (JSON만, 설명 없이):
{
  "sections": [
    {
      "id": "kebab-case-id",
      "label": "한국어 라벨",
      "componentType": "컴포넌트명",
      "reason": "이 섹션을 넣은 이유 + 앞 섹션과의 연결 맥락"
    }
  ],
  "storyLine": "섹션 흐름을 한 줄로 요약",
  "keyDecision": "이 리포트로 독자가 내릴 수 있는 결정",
  "category": "research | prediction | strategy | analysis",
  "inputType": "none | survey-form | text | file",
  "layout": "single-section",
  "modalType": "none | persona-detail"
}`;

/** 샘플 리포트 생성용 시스템 프롬프트 */
export const SAMPLE_REPORT_SYSTEM = `You are a B2B SaaS data analyst generating realistic mock report data.
Always respond with valid JSON only. No markdown fences. No explanation.
The JSON must match the ReportSchema structure exactly.`;
