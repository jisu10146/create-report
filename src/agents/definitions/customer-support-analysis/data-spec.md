# CS 티켓 분석 리포트 — 데이터 스펙

## 입력 데이터 형식
CSV 또는 JSON. 1행 = 1건의 지원 티켓.

## 컬럼 정의

### 필수 (없으면 리포트 생성 불가)

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| ticket_id | string | 티켓 고유 ID | TK-00883 |
| category | string | 문의 카테고리 | 결제/환불, 기능 오류, 계정/인증 |
| status | string | 처리 상태 | resolved, open, pending |

### 선택 — 있으면 해당 분석 활성화

| 컬럼 | 타입 | 설명 | 없을 때 영향 |
|------|------|------|-------------|
| created_at | datetime | 티켓 생성 일시 | 월별 추세·해결시간 분석 제외 |
| resolved_at | datetime | 해결 완료 일시 | 해결시간 계산 불가, StackedBarChart(대기 vs 처리) 제외 |
| priority | string | 우선순위 (Critical/High/Normal/Low) | 우선순위별 SLA 분석 제외 |
| channel | string | 접수 채널 (채팅, 이메일, 전화, 웹폼) | 채널별 성과 분석 제외 |
| agent_id | string | 담당 에이전트 ID | 에이전트 성과 비교 제외 |
| escalated | boolean | 에스컬레이션 여부 | 에스컬레이션율·근본원인 분석 제외 |
| csat_score | integer (1-5) | 고객 만족도 점수 | CSAT 분석 제외, NPS만으로 만족도 대체 |
| nps_score | integer (0-10) | NPS 점수 | NPS 분포 분석 제외 |

## 컬럼 → 섹션 매핑

| 리포트 섹션 | 필수 컬럼 | 선택 컬럼 (있으면 강화) |
|------------|----------|---------------------|
| Executive Summary | category, status | 전부 |
| KPI 개요 (MetricHighlight) | category, status | csat_score, escalated, created_at+resolved_at |
| SLA 현황 (DataTable) | category | escalated, created_at+resolved_at, csat_score |
| 해결시간 분해 (StackedBarChart) | category, created_at, resolved_at | — |
| 에이전트 성과 (DataTable) | agent_id | escalated, csat_score, created_at+resolved_at |
| NPS 분포 (StackedBarChart) | nps_score | category |
| 채널 성과 (DataTable) | channel | escalated, csat_score, nps_score, created_at+resolved_at |
| 근본 원인 (InsightCard) | category, escalated | agent_id, created_at+resolved_at |
| 액션 플랜 (StrategyTable) | category | 전부 |

## 섹션 자동 포함/제외 규칙

| 조건 | 포함되는 섹션 | 제외되는 섹션 |
|------|------------|------------|
| 기본 (category+status만) | ES, KPI개요, SLA, 근본원인, 액션플랜 | 해결시간분해, 에이전트, NPS, 채널 |
| + created_at, resolved_at | + 해결시간 분해 (StackedBarChart) | |
| + agent_id | + 에이전트 성과 (DataTable) | |
| + nps_score | + NPS 분포 (StackedBarChart) | |
| + channel | + 채널 성과 (DataTable) | |
| + escalated | 에스컬레이션 분석 강화 | |
| + csat_score | CSAT 데이터 포함 | |

## 최소 권장 건수
- **200건 이상**: 카테고리별 교차 분석이 유의미
- **500건 이상**: 에이전트 성과 비교가 안정적 (에이전트당 30건+)
- **100건 미만**: 리포트 생성 가능하나 통계적 신뢰도 낮음 경고 표시
