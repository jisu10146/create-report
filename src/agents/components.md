# 컴포넌트 정의

컴포넌트 추가/삭제 시 이 파일만 수정하면
VALID_COMPONENTS, ComponentType, REGISTRY, PROMPT 전부 자동 반영됨.

## 컴포넌트 목록

| name | description | rule |
|------|------------|------|
| ExecutiveSummary | 핵심 발견 요약 | 항상 맨 앞에 배치 |
| SectionTitle | 섹션 타이틀 + 서브 헤드라인 | |
| BulletCard | 제목 + 수치 + 불릿 리스트 | |
| HorizontalBarChart | 수평 막대 차트 (항목별 비교) | |
| DonutChart | 도넛 차트 + 범례 | |
| DataTable | 데이터 비교 테이블 | |
| InterpretationBlock | AI 해석 블록 | 반드시 차트 바로 뒤에만 배치 |
| InsightCard | 인사이트 카드 (뱃지 + 핵심 발견 + 설명 + 원인 콜아웃) | interpretation 필드에는 해결책이 아닌 근본 원인을 명시 |
| ClusterCard | 클러스터 정보 카드 (뱃지 + 아이콘 + 제목 + 설명) | |
| UserCard | 사용자/페르소나 프로필 카드 (이름 + 인구통계 + 설명) | |
| StrategyTable | 실행 계획 테이블 (즉시/단기/중기) | |
| PersonaModal | 가상 응답자 상세 모달 | |
| MetricHighlight | 핵심 지표 강조 카드 (값 + 디바이더 + 설명) | |
| ChecklistCard | 체크리스트 카드 (체크 아이콘 + 제목 + 설명) | |
| RevenueScenarioBar | 수익/성과 시나리오 비교 세로 막대 차트 (Upside/Base/Downside) | |
| PieBarChart | 파이 차트 + 바 차트 조합 카드 | |

## 데이터 스키마

### ExecutiveSummary
```json
{
  "description": "리포트 요약 설명 (1-2문장)",
  "topMetrics": [{ "label": "string", "value": "string|number" }],
  "keyFindings": ["핵심 발견 3-5개"]
}
```

### SectionTitle
```json
{ "title": "string", "subtitle": "string" }
```

### BulletCard
```json
{ "title": "string", "value": "string|number (optional)", "bullets": ["string"] }
```

### HorizontalBarChart
```json
{
  "question": "차트 질문 (optional)",
  "items": [{ "label": "string", "value": 0-100, "count": "number (optional)" }]
}
```

### DonutChart
```json
{
  "title": "string (optional)",
  "items": [{ "label": "string", "value": "number", "count": "number (optional)" }]
}
```

### DataTable
```json
{
  "columns": [{ "label": "string" }],
  "rows": [{ "metric": "행 라벨", "values": ["string|number"] }],
  "showDots": false
}
```
showDots는 클러스터 비교일 때만 true

### InterpretationBlock
```json
{ "title": "string (optional)", "text": "AI 해석 텍스트" }
```

### InsightCard
```json
{
  "items": [
    { "badge": "string (optional)", "value": "string", "description": "string", "interpretation": "근본 원인 (해결책X)" }
  ]
}
```
1~3개, 배열이면 가로 그리드

### ClusterCard
```json
{
  "items": [
    { "badge": "string", "badgeColor": "#hex (optional)", "title": "string", "description": "string" }
  ]
}
```

### UserCard
```json
{
  "items": [{ "name": "string", "subtitle": "성별, 나이, 직업", "description": "string" }],
  "hasViewDetail": true
}
```

### StrategyTable
```json
{
  "immediate": [{ "strategy": "string", "objective": "string", "actionPlan": "string", "expectedImpact": "string" }],
  "short": ["같은 형태"],
  "mid": ["같은 형태"]
}
```

### PersonaModal
```json
{
  "title": "string",
  "personas": [{ "name": "string", "subtitle": "string", "description": "string", "details": [{ "label": "string", "content": "string" }] }]
}
```

### MetricHighlight
```json
{
  "items": [{ "label": "string", "value": "string|number", "sub": "string (optional)", "description": "string" }]
}
```
1~3개, 배열이면 가로 그리드

### ChecklistCard
```json
{ "title": "string", "description": "string" }
```

### RevenueScenarioBar
```json
{
  "scenarios": [
    { "label": "Upside|Base|Downside", "badge": "string (optional)", "details": ["string (optional)"], "highlight": "string (optional)", "value": "number" }
  ]
}
```

### PieBarChart
```json
{
  "pieTitle": "string (optional)",
  "pieItems": [{ "label": "string", "value": "number" }],
  "barTitle": "string (optional)",
  "barItems": [{ "label": "string", "value": "number" }],
  "legends": [{ "label": "string", "color": "#hex" }]
}
```
legends는 optional
