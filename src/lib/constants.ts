/**
 * 리포트 시스템 공통 상수
 * 에이전트 생성, 검토, 리포트 렌더링에서 공유.
 *
 * ⚠ 컴포넌트 추가/삭제 시 COMPONENT_DEFINITIONS 만 수정하면
 *   VALID_COMPONENTS, ComponentType, REGISTRY, PROMPT 전부 자동 반영됨.
 *
 * 프롬프트는 .md 파일에서 관리:
 *   - src/agents/strategy-writer.md  → 설계 원칙 + 스토리 구조
 *   - src/agents/pm.md               → 품질 체크리스트
 *   - src/agents/chart-specialist.md → 컴포넌트 선택 기준
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
   ⚠ components.md와 동기화 유지
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ComponentDefinition {
  name: string;
  description: string;
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
  { name: "QuoteCard", description: "원문 발췌 인용 카드 (카테고리 태그 + 메타 + 인용문)", rule: "VOC·리뷰 원문을 paraphrase 없이 발췌 노출할 때 사용. headline 없으면 앞 섹션에 attached." },
  { name: "StrategyTable", description: "실행 계획 테이블 (즉시/단기/중기)" },
  { name: "PersonaModal", description: "가상 응답자 상세 모달" },
  { name: "MetricHighlight", description: "핵심 지표 강조 카드 (값 + 디바이더 + 설명)" },
  { name: "ChecklistCard", description: "체크리스트 카드 (체크 아이콘 + 제목 + 설명)" },
  { name: "RevenueScenarioBar", description: "수익/성과 시나리오 비교 세로 막대 차트 (Upside/Base/Downside)" },
  { name: "PieBarChart", description: "파이 차트 + 바 차트 조합 카드" },
  { name: "FunnelChart", description: "퍼널 차트 — 단계별 건수 감소와 이탈 시각화", rule: "전환/처리 흐름에서 단계별 드롭오프를 보여줄 때 사용" },
  { name: "StackedBarChart", description: "스택형 수평 막대 — 항목별 내부 구성 비교", rule: "하나의 항목 안에서 구성요소를 분해·비교할 때 사용" },
  { name: "TrendLineChart", description: "시계열 꺾은선 차트 — 추세 + 벤치마크 기준선", rule: "시간 축 변화와 벤치마크 대비를 동시에 보여줄 때 사용" },
];

export const VALID_COMPONENTS = new Set(COMPONENT_DEFINITIONS.map((c) => c.name));
export const VALID_COMPONENT_NAMES = COMPONENT_DEFINITIONS.map((c) => c.name);

/* ═══════════════════════════════════════════════════════════════════════════
   컴포넌트별 데이터 스키마 — 샘플 생성 프롬프트에 사용
   ⚠ components.md "데이터 스키마" 섹션과 동기화 유지
   ═══════════════════════════════════════════════════════════════════════════ */

export const COMPONENT_DATA_SCHEMA: Record<string, string> = {
  ExecutiveSummary: `{ "description": "리포트 요약 설명 (1-2문장)", "topMetrics": [{ "label": "string", "value": "string|number" }], "keyFindings": ["핵심 발견 3-5개"] }`,
  SectionTitle: `{ "title": "string", "subtitle": "string" }`,
  BulletCard: `{ "title": "string", "value": "string|number (optional)", "bullets": ["string"] }`,
  HorizontalBarChart: `{ "question": "차트 질문 (optional)", "items": [{ "label": "string", "value": 0-100, "count": number (optional) }] }`,
  DonutChart: `{ "title": "string (optional)", "items": [{ "label": "string", "value": number, "count": number (optional) }] }`,
  DataTable: `{ "columns": [{ "label": "string" }], "rows": [{ "metric": "행 라벨", "values": ["string|number"] }], "showDots": false } — showDots는 클러스터 비교일 때만 true`,
  InterpretationBlock: `{ "title": "string (optional)", "text": "AI 해석 텍스트" }`,
  InsightCard: `{ "items": [{ "badge": "string (optional)", "title": "string", "description": "string", "interpretation": "근본 원인 (해결책X)" }] } — 1~3개, 배열이면 가로 그리드. title은 한 줄 이내 핵심 발견(두괄식, 메시지 우선)`,
  ClusterCard: `{ "items": [{ "badge": "string", "badgeColor": "#hex (optional)", "title": "string", "description": "string" }] }`,
  UserCard: `{ "items": [{ "name": "string", "subtitle": "성별, 나이, 직업", "description": "string" }], "hasViewDetail": true }`,
  QuoteCard: `{ "items": [{ "tag": "카테고리/영역", "meta": "부가 정보 예: 1점·공감 99 (optional)", "quote": "원문 발췌" }] } — 1~3개, 배열 개수에 따라 가로 그리드 자동`,
  StrategyTable: `{ "immediate": [{ "strategy": "string", "objective": "string", "actionPlan": "string", "expectedImpact": "string" }], "short": [같은 형태], "mid": [같은 형태] }`,
  PersonaModal: `{ "title": "string", "personas": [{ "name": "string", "subtitle": "string", "description": "string", "details": [{ "label": "string", "content": "string" }] }] }`,
  MetricHighlight: `{ "items": [{ "label": "string", "value": "string|number", "sub": "string (optional)", "description": "string" }] } — 1~3개, 배열이면 가로 그리드`,
  ChecklistCard: `{ "title": "string", "description": "string" }`,
  RevenueScenarioBar: `{ "scenarios": [{ "label": "Upside|Base|Downside", "badge": "string (optional)", "details": ["string (optional)"], "highlight": "string (optional)", "value": number }] }`,
  PieBarChart: `{ "pieTitle": "string (optional)", "pieItems": [{ "label": "string", "value": number }], "barTitle": "string (optional)", "barItems": [{ "label": "string", "value": number }], "legends": [{ "label": "string", "color": "#hex" }] (optional) }`,
  FunnelChart: `{ "title": "string (optional)", "stages": [{ "label": "단계명", "value": number, "dropLabel": "이탈 설명 (optional)", "dropValue": number (optional) }] }`,
  StackedBarChart: `{ "title": "string (optional)", "categories": ["구성요소1", "구성요소2"], "colors": ["#hex"] (optional), "items": [{ "label": "항목명", "values": [숫자1, 숫자2] }], "unit": "h|%|건 (optional)" }`,
  TrendLineChart: `{ "title": "string (optional)", "xLabels": ["1월", "2월", "3월"], "series": [{ "id": "시리즈명", "values": [숫자], "unit": "점|h|% (optional)" }], "benchmarks": [{ "id": "기준선명", "value": number, "unit": "string (optional)" }] (optional) }`,
};

/* ─── 유틸 ─── */

/** 컴포넌트 목록을 프롬프트용 텍스트로 변환 — orchestrator에서 사용 */
export function buildComponentPromptList(): string {
  return COMPONENT_DEFINITIONS.map((c) => {
    const rule = c.rule ? ` (${c.rule})` : "";
    return `- ${c.name}: ${c.description}${rule}`;
  }).join("\n");
}
