# VOC 분석 리포트 — 데이터 스펙

## 입력 데이터 형식
CSV 또는 JSON. 1행 = 1건의 고객 피드백.

## 컬럼 정의

### 필수 (없으면 리포트 생성 불가)

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| content | text | 고객이 작성한 피드백 원문 | "릴스 넘기다 보면 화면 갑자기 밝아져" |
| score | integer (1-5) | 별점 또는 만족도 점수 | 1 |

### 선택 — 있으면 해당 분석 활성화

| 컬럼 | 타입 | 설명 | 없을 때 영향 |
|------|------|------|-------------|
| at / date | datetime | 작성 일시 | 월별 추세 분석 제외 |
| thumbsUpCount | integer | 공감수/좋아요 수 | 공감 기반 우선순위 산출 불가, 건수 기반으로 대체 |
| channel | string | 수집 채널 (앱 리뷰, NPS, 이메일 등) | 채널별 분석 제외 |
| userName | string | 작성자 이름/ID | 동일 사용자 반복 분석 제외 |
| replyContent | text | 공식 답변 내용 | 답변률 분석 제외 |
| sentiment | string (positive/neutral/negative) | 사전 분류된 감성 | score 기반으로 자동 분류 (4-5=긍정, 3=중립, 1-2=부정) |
| topic / product_area | string | 사전 분류된 토픽 | 키워드 기반 자동 분류 |
| urgency | string (high/medium/low) | 긴급도 | 긴급도 섹션 제외 |
| nps_score | integer (0-10) | NPS 점수 | NPS 분석 제외 |
| plan / segment | string | 고객 등급/플랜 | 세그먼트별 분석 제외 |

## 컬럼 → 섹션 매핑

| 리포트 섹션 | 필수 컬럼 | 선택 컬럼 (있으면 강화) |
|------------|----------|---------------------|
| Executive Summary | score, content | 전부 |
| 감성 개요 (MetricHighlight) | score | at (추세) |
| 양극화 해석 (ClusterCard) | score, content | — |
| 토픽×감성 교차 (StackedBarChart) | score, content | topic (있으면 키워드 분류 불필요) |
| 부정 심층 (InsightCard) | score, content | thumbsUpCount (우선순위), channel |
| 긍정 분석 (InsightCard) | score, content | — |
| 액션 플랜 (StrategyTable) | score, content | 전부 |

## 최소 권장 건수
- **100건 이상**: 토픽 분류와 양극화 해석이 유의미
- **300건 이상**: 토픽별 감성 교차가 안정적
- **50건 미만**: 리포트 생성 가능하나 통계적 신뢰도 낮음 경고 표시
