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
  { name: "RevenueScenarioBar", description: "수익/성과 시나리오 비교 세로 막대 차트 (Upside/Base/Downside)" },
  { name: "PieBarChart", description: "파이 차트 + 바 차트 조합 카드" },
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
  RevenueScenarioBar: `{
  "scenarios": [
    { "label": "Upside|Base|Downside", "badge": "string (optional)", "details": ["string (optional)"], "highlight": "string (optional)", "value": number }
  ]
}`,
  PieBarChart: `{
  "pieTitle": "string (optional)", "pieItems": [{ "label": "string", "value": number }],
  "barTitle": "string (optional)", "barItems": [{ "label": "string", "value": number }],
  "legends": [{ "label": "string", "color": "#hex" }] (optional)
}`,
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

## 카테고리별 권장 흐름
카테고리를 먼저 결정하고 그 흐름에 맞게 섹션을 배치할 것:

research (조사/분석):
현황 파악 → 분포 분석 → 원인 진단 → 시사점

prediction (예측):
현재 상태 → 위험 신호 → 예측 근거 → 대응 방향

strategy (전략):
목표 설정 → 현황 갭 분석 → 전략 옵션 → 실행 계획

analysis (심층 분석):
문제 정의 → 데이터 탐색 → 패턴 발견 → 인사이트 도출

## 분량별 인사이트 깊이

compact:
- "무엇이 문제인가"만 답하면 됨
- 원인 분석 섹션 불필요
- 결론과 핵심 액션만

standard:
- "무엇이 문제이고 왜인가"까지
- 원인 1개 이상 포함
- 실행 방향 포함

detailed:
- "무엇이, 왜, 누가, 어떻게"까지
- 세그먼트/군집 분석 포함
- 구체적 실행 계획 포함

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
에이전트 특성에 맞으면 어떤 조합이든 허용하되, 매번 같은 패턴이 반복되지 않도록 주의해.
아래 대체 컴포넌트를 적극 검토해서 에이전트 성격에 더 맞는 것이 있으면 교체:
- 개별 사례가 중요한 에이전트 → 차트 대신 DataTable
- 사람/프로필이 핵심인 에이전트 → InsightCard 대신 UserCard
- 분류/군집이 핵심인 에이전트 → InsightCard 대신 ClusterCard
- 기준/체크가 핵심인 에이전트 → StrategyTable 대신 ChecklistCard
- 구성비가 핵심인 에이전트 → HorizontalBarChart 대신 DonutChart

피해야 할 패턴 — 에이전트 특성 무시하고 기본 패턴 반복:
ExecutiveSummary → MetricHighlight → HorizontalBarChart → InterpretationBlock → InsightCard → StrategyTable
이 패턴이 나오면 에이전트 설명을 다시 읽고 재설계할 것.

피해야 할 패턴 — 의사결정과 무관한 섹션 포함:
- 경영진 리포트에 InterpretationBlock (설명 과다)
- 실무자 리포트에 섹션 4개 이하 (정보 부족)
- 재무 데이터인데 UserCard 포함 (데이터 특성 무시)

## 좋은 구성안 예시

예시 1 — 가격 분석 에이전트 (경영진, standard):
storyLine: "적정 가격대 현황 → 구간별 수용도 분포 → 최적가 근거 → 시나리오별 매출 영향"
sections: ExecutiveSummary → MetricHighlight(최적가/수용범위/한계가격) → HorizontalBarChart(가격 구간별 수용도) → InterpretationBlock(분포 해석) → StrategyTable(가격 론칭 시나리오)

예시 2 — 이탈 분석 에이전트 (실무자, detailed):
storyLine: "이탈 현황 파악 → 고위험 군집 식별 → 행동 패턴 원인 → 세그먼트별 대응 전략"
sections: ExecutiveSummary → MetricHighlight(이탈률/위험군 수/평균 세션) → ClusterCard(고위험 군집 3개) → DataTable(군집별 행동 지표 비교) → InsightCard(핵심 이탈 원인) → StrategyTable(세그먼트별 리텐션 액션)

## 배치 규칙
- ExecutiveSummary는 항상 첫 번째
- 각 섹션의 label은 한국어로
- 섹션 수는 의사결정에 필요한 최소한으로

## reason 작성 기준
각 섹션의 reason은 반드시 아래 형식으로:
"[앞 섹션]에서 [발견한 것]을 바탕으로, [이 섹션]에서 [무엇을] 보여줌으로써 독자가 [어떤 판단]을 내릴 수 있게 함"

예시:
"MetricHighlight에서 이탈률 32%를 확인한 독자가 ClusterCard에서 어떤 군집이 위험한지 파악함으로써 집중 대응 타겟을 결정할 수 있게 함"

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
