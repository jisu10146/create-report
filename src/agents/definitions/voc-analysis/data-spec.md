# VOC 분석 리포트 — 데이터 스펙

## 입력 데이터 형식
CSV 또는 JSON. 1행 = 1건의 고객 피드백.

## 지원 데이터 소스
- 앱 스토어 리뷰 (Google Play, App Store)
- NPS/CSAT 서술형 응답
- CS 티켓/채팅 텍스트
- 설문조사 주관식
- B2B 제품 피드백 (인앱, 기능 요청)
- 소셜 미디어 / 커뮤니티 멘션

## 컬럼 정의

### 필수 (없으면 리포트 생성 불가)

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| content | text | 고객이 작성한 피드백 원문 | "릴스 넘기다 보면 화면 갑자기 밝아져" |

### 준필수 — 감성 분류에 필요 (둘 중 하나 이상)

| 컬럼 | 타입 | 설명 | 없을 때 처리 |
|------|------|------|-------------|
| score | integer (1-5) | 별점 또는 만족도 점수 | 텍스트 기반 감성 자동 분류 |
| nps_score | integer (0-10) | NPS 점수 | NPS 분석 제외, score 또는 텍스트 감성 사용 |
| sentiment | string (positive/neutral/negative) | 사전 분류된 감성 | score 기반 자동 분류 (4-5=긍정, 3=중립, 1-2=부정) |

> score, nps_score, sentiment 모두 없으면 텍스트 기반 감성 자동 분류 수행

### 선택 — 있으면 해당 분석 활성화

| 컬럼 | 타입 | 설명 | 없을 때 영향 |
|------|------|------|-------------|
| at / date | datetime | 작성 일시 | 시간 추세 분석 제외 |
| thumbsUpCount | integer | 공감수/좋아요 수 | 공감 기반 우선순위 산출 불가, 건수 기반으로 대체 |
| channel | string | 수집 채널 (앱 리뷰, NPS, 이메일 등) | 채널별 분석 제외 |
| userName | string | 작성자 이름/ID | 동일 사용자 반복 분석 제외 |
| replyContent | text | 공식 답변 내용 | 답변률 분석 제외 |
| topic / product_area | string | 사전 분류된 토픽 | 키워드 기반 자동 분류 |
| urgency | string (high/medium/low) | 긴급도 | 긴급도 섹션 제외 |
| plan / segment | string | 고객 등급/플랜 | 세그먼트별 분석 제외 |
| account_id | string | B2B 계정 ID | 계정 가중 분석 제외 |
| ticket_id | string | CS 티켓 ID | CS 텍스트 패턴 적용 안 됨 |

## 데이터 소스 자동 감지

| 컬럼 조합 | 추정 소스 | 적용 패턴 |
|----------|----------|----------|
| score (1-5) + content | 앱 리뷰 | 토픽→감성 순서, 양극화 해석 |
| nps_score (0-10) + content | NPS 서술형 | 점수 구간(추천/중립/비추천)→토픽 순서 |
| ticket_id + content | CS 텍스트 | 진술 vs 근본원인 분리, 부정 편향 보정 |
| account_id + content | B2B 피드백 | 계정 매출 가중, RICE 우선순위 |
| 위 모두 없음 | 일반 텍스트 | 토픽→감성 기본 순서 |

## 컬럼 → 섹션 매핑

| 리포트 섹션 | 필수 컬럼 | 선택 컬럼 (있으면 강화) |
|------------|----------|---------------------|
| Executive Summary | content + (score 또는 sentiment) | 전부 |
| 감성 개요 (MetricHighlight) | score 또는 sentiment | at (추세) |
| 양극화 해석 (ClusterCard) | score, content | — |
| 토픽×감성 교차 (StackedBarChart) | content + (score 또는 sentiment) | topic (있으면 키워드 분류 불필요) |
| 부정 심층 (InsightCard) | content + (score 또는 sentiment) | thumbsUpCount (우선순위), channel |
| 긍정 분석 (InsightCard) | content + (score 또는 sentiment) | — |
| 액션 플랜 (StrategyTable) | content + (score 또는 sentiment) | 전부 |

## 최소 권장 건수
- **100건 이상**: 토픽 분류와 양극화 해석이 유의미
- **300건 이상**: 토픽별 감성 교차가 안정적
- **50건 미만**: 리포트 생성 가능하나 통계적 신뢰도 낮음 경고 표시
