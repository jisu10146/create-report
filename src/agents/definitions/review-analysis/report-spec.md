# Review Analysis 리포트 명세

> AI팀 개발 핸드오프용. **어떤 리뷰 데이터가 들어와도 동일한 8개 섹션**으로 구성되는 범용 리포트.
>
> 본 문서는 입력 데이터 정의(§1)부터 출력 리포트 골격(§3~§9)까지 단일 진입점으로 통합되어 있습니다.
>
> 관련 파일:
> - 섹션 골격 (정통) → [agent.json](./agent.json) `reportSections`
> - 비즈니스 로직 (소스별 분석 패턴) → [skills/review-analysis.md](../../skills/review-analysis.md)
> - 컴포넌트 데이터 스키마 → [src/lib/constants.ts](../../../lib/constants.ts) `COMPONENT_DATA_SCHEMAS`
> - 콘텐츠 규칙 (두괄식 등) → [sample-generator.md](../../sample-generator.md), [strategy-writer.md](../../strategy-writer.md)
> - 전처리 출력 타입 → [orchestrator/types.ts](../../orchestrator/types.ts) `VocPreprocessOutput`
> - 정통 샘플 → [sample-coupang.json](./sample-coupang.json), [sample-chatgpt.json](./sample-chatgpt.json)

---

## 1. 입력 데이터

### 1.1 입력 형식
CSV 또는 JSON. 1행 = 1건의 고객 피드백.

### 1.2 지원 데이터 소스
- 제품/서비스 리뷰 (앱스토어, 쇼핑몰, 비교 사이트 등)
- NPS/CSAT 서술형 응답
- CS 티켓/채팅 텍스트
- 설문조사 주관식
- B2B 제품 피드백 (인앱, 기능 요청)
- 소셜 미디어 / 커뮤니티 멘션

### 1.3 컬럼 정의

#### A. 필수 (없으면 리포트 생성 불가)

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `content` | text | 고객이 작성한 피드백 원문 | "릴스 넘기다 보면 화면 갑자기 밝아져" |
| `score` | integer (1-5) | 별점 또는 만족도 점수 | 1, 5 |

> 두 컬럼은 정통 8섹션 골격(별점 분포·감성 분류·QuoteCard meta)을 그대로 그리는 데 모두 사용된다.

#### B. 선택 (있으면 분석 풍부해짐)

| 컬럼 | 타입 | 설명 | 없을 때 영향 |
|------|------|------|-------------|
| `thumbsUpCount` | integer | 공감수/좋아요 수 | QuoteCard meta에 공감수 미표기, 정렬은 영역 키워드 빈도로 대체 (§4.5) |
| `at` / `date` | datetime | 작성 일시 | 시간 추세 분석 제외, 동률 시 최신순 정렬 불가 |
| `topic` / `product_area` | string | 사전 분류된 토픽 | 키워드 기반 자동 분류로 대체 |
| `channel` | string | 수집 채널 | 채널별 분석 제외 |
| `userName` | string | 작성자 이름/ID | 동일 사용자 반복 분석 제외 (프라이버시 상 리포트 노출은 항상 제외) |
| `replyContent` | text | 공식 답변 내용 | 답변률 분석 제외 |
| `urgency` | string (high/medium/low) | 긴급도 | 긴급도 섹션 제외 |
| `plan` / `segment` | string | 고객 등급/플랜 | 세그먼트별 분석 제외 |

#### C. score 대체 (score가 없는 변형 데이터 케이스)

| 컬럼 | 타입 | 설명 | 적용 |
|------|------|------|------|
| `nps_score` | integer (0-10) | NPS 점수 | 별점 분포 슬롯을 추천(9-10)/중립(7-8)/비추천(0-6) 3구간으로 매핑 |
| `sentiment` | string (positive/neutral/negative) | 사전 분류 감성 | 별점 분포 슬롯을 긍정/중립/부정 3구간으로 매핑 |
| (모두 없음) | — | — | 텍스트 기반 감성 자동 분류, "자동 분류" 표기 |

> score가 없으면 §4.2 별점 분포가 fallback 형태(3구간)로 변경된다 (§5.2). C 컬럼은 score 대체이지 score와 병용 X.

### 1.4 데이터 소스 자동 감지

| 컬럼 조합 | 추정 소스 | 적용 패턴 |
|----------|----------|----------|
| `score` (1-5) + `content` | 제품/서비스 리뷰 | 토픽→감성 순서, 양극화 해석 |
| `nps_score` (0-10) + `content` | NPS 서술형 | 점수 구간(추천/중립/비추천)→토픽 순서 |
| `ticket_id` + `content` | CS 텍스트 | 진술 vs 근본원인 분리, 부정 편향 보정 |
| `account_id` + `content` | B2B 피드백 | 계정 매출 가중, RICE 우선순위 |
| 위 모두 없음 | 일반 텍스트 | 토픽→감성 기본 순서 |

### 1.5 최소 권장 건수
- **100건 이상**: 토픽 분류와 양극화 해석이 유의미
- **300건 이상**: 토픽별 감성 교차가 안정적
- **50건 미만**: 리포트 생성 가능하나 통계적 신뢰도 낮음 경고 표시

---

## 2. 설계 원칙

### 2.1 단일 골격
리뷰 데이터는 제품 리뷰·CS 티켓·NPS 서술형·B2B 피드백·소셜 멘션 등 형태가 다양하지만, **리포트 골격은 동일**하다. 데이터 소스에 따라 슬롯에 들어가는 *지표 이름*과 *세부 콘텐츠*만 달라진다.

| 변하는 것 | 변하지 않는 것 |
|---|---|
| KPI의 구체 이름 (별점/NPS/CSAT) | 8섹션 순서·역할 |
| 토픽 분류 결과 (가성비 vs 결제/환불) | 영역×감성 섹션이 존재한다는 사실 |
| 분포 해석 메시지 (양극화 vs Detractor 집중) | 섹션의 목적 |
| 액션의 구체 내용 | 즉시/단기/중기 3구간 형식 |

### 2.2 "필수 슬롯" 원칙
- 모든 섹션은 **항상 자리에 있다**. 데이터가 부족하면 채우는 콘텐츠가 줄어들 뿐, 슬롯 자체는 유지.
- 단, 데이터가 0건이거나 의미 없는 경우(예: 긍정 비율 0%인데 긍정 분석)에는 **명시적 fallback 메시지**로 채움 ("이 데이터에서는 긍정 시그널이 발견되지 않았습니다").
- AI팀은 **섹션을 동적으로 빼지 않는다** — 일관된 사용자 경험.

### 2.3 3-Layer 구조 (모든 섹션 공통, 필수)

`attached: true`인 QuoteCard 섹션을 제외하고, 모든 섹션은 다음 3개 슬롯을 **항상** 채운다.

| 슬롯 | 위치 | 길이 | 역할 |
|---|---|---|---|
| `sectionName` | 섹션 객체 최상위 | 4~10자 | 섹션 카테고리 라벨 (예: "리뷰 현황", "부정 심층 분석") |
| `headline` | 섹션 객체 최상위 | 30~70자 | **두괄식 결론 한 문장** (em-dash 금지, 줄글 완전 문장) |
| `data.description` | data 안 | 1~2문장 / 50~150자 | headline 보강 — 새 수치·맥락·근거 |

> Executive Summary는 위 3개 외에 `data.topMetrics`와 `data.keyFindings`를 추가로 가짐 (§4.1).
>
> `attached: true` 섹션(negative-samples, positive-samples)은 `sectionName`·`headline` 없이 `data.items`만 가진다 (§4.5).

### 2.4 본 명세가 정의하는 것 / 정의하지 않는 것
| 정의함 | 정의하지 않음 |
|---|---|
| 8개 섹션의 순서·역할·슬롯 | 토픽 분류 알고리즘 |
| 각 슬롯이 받는 데이터의 *형태* | LLM 프롬프트 |
| 콘텐츠 규칙 (두괄식, 리뷰 분석 톤) | 컴포넌트 렌더링 코드 |
| 좋은 예 / 나쁜 예 | 소스별 디테일 (→ skills/review-analysis.md 참조) |

---

## 3. 리포트 골격 — 8개 섹션 (고정)

```
1. executive-summary    Executive Summary       — 전체 결론과 keyFindings
2. sentiment-overview   리뷰 현황                — 별점 분포 (HorizontalBarChart)
3. topic-impact         영역별 긍정/부정          — 영역×감성 (StackedBarChart)
4. negative-deep-dive   부정 심층 분석            — 영역별 부정 언급률 (HorizontalBarChart)
5. negative-samples     (앞 섹션에 attached)      — 부정 대표 리뷰 원문 (QuoteCard)
6. positive-protect     긍정 심층 분석            — 영역별 긍정 언급률 (HorizontalBarChart)
7. positive-samples     (앞 섹션에 attached)      — 긍정 대표 리뷰 원문 (QuoteCard)
8. action-plan          개선 로드맵               — 즉시/단기/중기 (StrategyTable)
```

이 순서는 **고정**. 정통 골격은 [agent.json](./agent.json) `reportSections`에 정의되어 있다.

### 3.1 스토리라인
> 별점 분포 현황 → 영역별 긍정/부정 → 부정 영역 심층 비교 → 긍정 가치와 리스크 → 개선 로드맵

각 섹션의 `headline`을 1→8 순서대로 읽으면 **하나의 이야기**가 되어야 한다 (헤드라인 연속 읽기 원칙).

### 3.2 키 디시전
이 리포트가 답해야 하는 핵심 질문: **부정 영역 중 어디에 우선 투자할 것인가**

---

## 4. 섹션별 슬롯 명세

### 4.1 섹션 1 — Executive Summary

| 필드 | 위치 | 타입 | 규칙 |
|---|---|---|---|
| `sectionName` | 최상위 | string | "Executive Summary" 고정 |
| `headline` | 최상위 | string | 리포트 전체 결론 한 문장 (조건절 + 발견 + 행동 함의) |
| `componentType` | 최상위 | "ExecutiveSummary" | 고정 |
| `data.description` | data | string | **리포트 전체 요약** — 분석 대상 + 핵심 발견 + 행동 함의를 줄글로 압축 |

> **`data.topMetrics` / `data.keyFindings`는 deprecated.** 현 정통 구조는 `data.description` 한 필드만 사용한다. 옛 instagram 샘플엔 남아 있지만 새 샘플(coupang/chatgpt) 작성 시 사용 금지.

#### description 구조 — "한 단락 줄글"
한 문단 안에 다음 4가지를 순서대로 담는다 (별도 슬롯이 아니라 줄글 안의 흐름).

| # | 역할 | 예시 |
|---|---|---|
| 1 | 분석 대상 메타 | "쿠팡 캐리어 리뷰 1,000건을 별점·감성·영역별로 분석했습니다" |
| 2 | 현황 (만족도 대표값) | "평균 4.5점으로 전반적 만족도가 높고, 5점 리뷰가 77.5%를 차지합니다" |
| 3 | 발견 + 우선순위 | "부정은 7.9%(79건)에 불과하지만 배송/CS(44%)와 지퍼/잠금장치(35%)에 집중됩니다. 공감 598 리뷰는 재질 표기 문제로 신뢰를 직접 타격합니다" |
| 4 | 행동 방향 | "배송 품질 관리와 출고 검수를 강화하면 부정률을 절반 가까이 줄일 수 있습니다" |

#### description 작성 규칙
- **두괄식 미적용** — 메타 설명 → 발견 → 행동 순서로 자연스럽게 흐름
- 한 단락 줄글 (bullet list 금지, em-dash로 끊지 말기)
- 길이: 200~400자 권장
- **수치 4개 슬롯 제한** (메모리 규칙: Executive number count) — 한 단락에 핵심 수치 4개까지, 8~10개 몰지 말 것
- 만족도 대표값은 다음 우선순위로 본문에 포함 (§5.1과 동일):
  ```
  정통 케이스 (score 필수):
    score → "평균 별점 X.X점" 또는 "평균 X.X / 5.0"

  score 대체 케이스 (§1.3-C):
    nps_score → "NPS X점"
    sentiment → "긍정 비율 X%"
    자동 감성 → "긍정 비율 X% (자동 분류)"
  ```

---

### 4.2 섹션 2 — 리뷰 현황 (별점 분포)

| 필드 | 타입 | 규칙 |
|---|---|---|
| `sectionName` | string | "리뷰 현황" |
| `headline` | string | 분포의 모양(편중/양극화/평탄) + 특이점 |
| `componentType` | "HorizontalBarChart" | 고정 |
| `data.description` | string | 4-5점 합산 비율 + 분포 안의 미세 패턴 (양극화 단서) |
| `data.chartTitle` | string | "별점 분포" |
| `data.items` | `[{label, value, count}]` | 5개 (1점~5점) |

#### items 규칙
- `label`: "5점", "4점", "3점", "2점", "1점" — 항상 이 5개
- `value`: % 수치 (소수점 1자리), 합 = 100 (반올림 보정)
- `count`: 절대 건수 (정수)
- 정렬: 5점 → 1점 (내림차순) 권장

#### headline 패턴
- 편중형: "5점 리뷰가 N%로 압도적이며, 부정(1-2점)은 M%에 불과하지만 [특이점]"
- 양극화형: "평균 X점이지만 1점과 5점에 N%가 몰려 있어, 점수가 실제 만족도보다 [높게/낮게] 보입니다"
- 평탄형: "별점이 1~5점에 고르게 분포해, 모든 구간 사용자 경험에 격차가 없습니다"

---

### 4.3 섹션 3 — 영역별 긍정/부정 (영역×감성)

| 필드 | 타입 | 규칙 |
|---|---|---|
| `sectionName` | string | "영역별 긍정/부정" |
| `headline` | string | 부정률 1~2위 영역명 + 그 외 긍정률 |
| `componentType` | "StackedBarChart" | 고정 |
| `data.description` | string | 긍정 우세 영역 그룹 + 부정 영역 강조 + 전체 구도 |
| `data.chartTitle` | string | "영역별 감성 분포 (부정 영향이 큰 순서)" |
| `data.categories` | `["긍정", "중립", "부정"]` | 고정 |
| `data.colors` | `["#7ccf00", "#e6e7e9", "#f87171"]` | 고정 |
| `data.unit` | "%" | 고정 |
| `data.items` | `[{label, values: [긍정,중립,부정]}]` × 6~10 | 영역 |

#### items 규칙
- `label`: `"{영역명} ({전체 리뷰 비중}%)"` 형식 — **비중을 라벨에 반드시 포함**
- `values`: `[긍정, 중립, 부정]` 순서, 합 = 100
- 정렬: **부정률 내림차순** (부정 영향이 큰 영역이 먼저)
- 영역 수: 6~10개

#### headline 패턴
- "대부분 영역에서 긍정이 N%+이지만, X(부정 N%)와 Y(부정 M%)는 눈에 띄게 낮습니다"
- "X·Y·Z 세 영역은 부정 비율이 N~M%로 가장 높고, 전체 리뷰 비중도 큽니다"

---

### 4.4 섹션 4 — 부정 심층 분석

| 필드 | 타입 | 규칙 |
|---|---|---|
| `sectionName` | string | "부정 심층 분석" |
| `headline` | string | 부정 Top 3 영역명 + 부정의 공통 뿌리 |
| `componentType` | "HorizontalBarChart" | 고정 |
| `data.description` | string | 영역별 1문장씩 — **무엇이 / 왜** (3~4문장 줄글) |
| `data.chartTitle` | string | "부정 리뷰 중 각 영역 언급률" |
| `data.items` | `[{label, value, count, isOther?}]` × 4~5 | Top 3~4 + "기타" |

#### items 규칙
- 부정 리뷰 안에서 각 영역 언급률 (한 리뷰가 여러 영역 언급 가능)
- Top 3~4 영역 + 마지막에 "기타"
- "기타": `"isOther": true` — 회색 빗금 처리
- `value`: 부정 리뷰 중 해당 영역 언급률 (%, 소수점 1자리)
- `count`: 해당 영역 언급한 부정 리뷰 건수
- 정렬: value 내림차순, "기타"는 항상 맨 아래

#### description 작성 규칙
- 각 영역에 **1문장씩** 할당 (3~4영역 = 3~4문장)
- 형식: `"{영역}은 {구체 행동/현상}{이고/이며}"`
- 줄글로 자연스럽게 연결, bullet list 금지
- "분노/좌절/무력감" 같은 감정 명사 금지 → "불만/부정/이탈 위험" 등 중립 표현 (메모리 규칙)

#### headline 패턴
- "부정 리뷰 대부분이 X·Y·Z 세 영역에 집중되며, 제품 설계보다 [근본 원인]"
- "X·Y·Z에 부정 리뷰 불만이 집중됩니다. 공통점은 [근본 원인]"

---

### 4.5 섹션 5 — negative-samples (attached QuoteCard)

> **이 섹션은 `attached: true`로 앞 섹션(부정 심층 분석)에 시각적으로 붙는다.**
> `sectionName`·`headline` 슬롯이 **없다.**

| 필드 | 타입 | 규칙 |
|---|---|---|
| `id` | "negative-samples" | 고정 |
| `componentType` | "QuoteCard" | 고정 |
| `data.items` | `[{tag, meta, quote}]` × 3 | 부정 Top 3 영역의 대표 리뷰 |

#### items 규칙
- 1건 = 부정 Top 3 영역 1개 (3건 = 영역 3개)
- `tag`: 영역명 (1~10자, 예: "배송/CS", "기능/UX")
- `meta`: 다음 우선순위로 채움
  - thumbsUpCount 있음 → `"{별점} · 공감 {수}"` (예: `"1점 · 공감 598"`)
  - thumbsUpCount 없음 → `"{별점}"` (예: `"1점"`)
  - score 대체 케이스(sentiment) → `"{감성}"` (예: `"부정"`)
- `quote`: 원문 그대로(paraphrase 금지), 30~150자 — 길이별 처리는 아래 발췌 규칙 참조
- 사용자명·전화번호 등 PII 노출 금지

#### 후보 선정 우선순위

```
1. 영역 매칭 — 영역 키워드가 등장한 리뷰만 후보
2. 감성 강도:
   - 부정: score=1 → score=2 → sentiment=negative
3. 정렬:
   - thumbsUpCount 있음 → 공감수 내림차순
   - thumbsUpCount 없음 → 영역 키워드 등장 빈도 내림차순
4. 동률 시: 작성 일시 최신순 (at/date 없으면 등록 순서)
```

#### 발췌 규칙 (원문 → quote 변환)

| 원문 길이 | 처리 |
|---|---|
| 30자 미만 | **후보 제외** (단순 반응, 정보량 부족) |
| 30~150자 | **전체 인용** (원문 그대로) |
| 150자 초과 | **핵심 발췌** — 영역 키워드 등장 문장 + 앞뒤 1문장 (50~150자 목표) |

핵심 발췌 시 준수 사항:
- 문장 단위로 통째로 가져옴 (단어 변경·요약 금지)
- 잘리는 자리에 `…` 표시 (앞·뒤 모두)
- 잘린 부분에 **의미 반전 표현(`근데`, `하지만`, `다만`, `그런데`, `그래도`)이 없을 것** — 있으면 반전 이후 부분까지 포함하거나 다른 후보 선택
- 위 조건을 만족하는 발췌가 불가능하면 다음 후보로 넘어감

---

### 4.6 섹션 6 — 긍정 심층 분석

| 필드 | 타입 | 규칙 |
|---|---|---|
| `sectionName` | string | "긍정 심층 분석" |
| `headline` | string | 긍정 Top 영역 + 만족의 공통 뿌리 |
| `componentType` | "HorizontalBarChart" | 고정 |
| `data.description` | string | 영역별 1문장 + 만족의 구조적 위험(있을 때) |
| `data.chartTitle` | string | "긍정 리뷰 중 각 영역 언급률" |
| `data.items` | `[{label, value, count, isOther?}]` × 3~5 | Top + "기타" |

> 구조는 §4.4와 동일하되 **긍정 버전**.

#### items 규칙 (§4.4와 차이점)
- 긍정 리뷰 안에서 각 영역 언급률
- Top 3~4 + "기타" (또는 "기타" 없이 Top만 표시도 허용)
- `value`: 긍정 리뷰 중 해당 영역 언급률 (%, 소수점 1자리)

#### description 추가 규칙
- "지켜야 할 가치"와 함께 **구조적 위험**도 한 문장 추가 권장
  - 예: "가성비 기반 만족은 가격이 오르면 흔들릴 수 있어 현재 가격대를 유지하는 것이 중요합니다"
  - 예: "5점 리뷰의 64%가 10자 이하로 만족이 얕아, 대체 앱이 등장하면 빠르게 이탈할 수 있습니다"

#### headline 패턴
- "긍정 리뷰의 N%가 X를 언급하며, [핵심 인식]"
- "긍정의 핵심은 X·Y·Z 세 영역이며, [공통 뿌리]"

---

### 4.7 섹션 7 — positive-samples (attached QuoteCard)

> §4.5와 동일 구조, 긍정 버전.

| 필드 | 타입 | 규칙 |
|---|---|---|
| `id` | "positive-samples" | 고정 |
| `componentType` | "QuoteCard" | 고정 |
| `data.items` | `[{tag, meta, quote}]` × 3 | 긍정 Top 3 영역 대표 리뷰 |

#### items 규칙 (§4.5와 차이점)
- 1건 = 긍정 Top 3 영역 1개
- `meta` 형식 — 긍정은 보통 `score=5` → `"5점 · 공감 N"` / `"5점"` / `"긍정"`
- 그 외 필드 형식·발췌 규칙은 §4.5와 동일

#### 후보 선정 우선순위

```
1. 영역 매칭 — 영역 키워드가 등장한 리뷰만 후보
2. 감성 강도:
   - 긍정: score=5 → score=4 → sentiment=positive
3. 정렬:
   - thumbsUpCount 있음 → 공감수 내림차순
   - thumbsUpCount 없음 → 영역 키워드 등장 빈도 내림차순
4. 동률 시: 작성 일시 최신순
```

#### 추가 필터 — 단순 반응 제외
긍정 리뷰는 단순 반응이 많아 별도 필터 필요:
- 영역 키워드를 1회 이상 명시 (영역명·동의어 포함)
- 30자 미만 또는 "좋아요/최고/굿/추천" 등 단순 형용 위주 리뷰는 후보 제외
- 영역에 대한 구체적 묘사(이유·상황·비교)가 있는 리뷰 우선

발췌 규칙은 §4.5와 동일.

---

### 4.8 섹션 8 — 개선 로드맵

| 필드 | 타입 | 규칙 |
|---|---|---|
| `sectionName` | string | "개선 로드맵" |
| `headline` | string | Top 액션 3개 요약 + 정량 목표 |
| `componentType` | "StrategyTable" | 고정 |
| `data.description` | string | 로드맵 전체 의도 + 긍정 유지·부정 축소 균형 |
| `data.phases` | `{immediate, short, mid}` | label·sub 메타 정보 |
| `data.immediate` | row[] × 1~2 | 즉시 (1주 이내) |
| `data.short` | row[] × 1~2 | 단기 (1개월 이내) |
| `data.mid` | row[] × 1~2 | 중기 (3개월 이내) |

#### phases 메타
```json
{
  "immediate": { "label": "즉시", "sub": "1주 이내" },
  "short":     { "label": "단기", "sub": "1개월 이내" },
  "mid":       { "label": "중기", "sub": "3개월 이내" }
}
```
시간대 3구간 **고정**. label·sub 텍스트도 위와 동일 권장.

#### row 4필드
| 필드 | 길이 | 규칙 |
|---|---|---|
| `strategy` | ~15자 | 행동 지향 명사구 (예: "배송 포장 강화") |
| `objective` | 1줄 | "{지표/근거}을(를) 줄이기/높이기" 형식 (수치 근거 포함) |
| `actionPlan` | 1~2줄 | 실행 방법, `\n`으로 줄바꿈 |
| `expectedImpact` | 1줄 | **정량 변화값 필수** (예: "배송/CS 부정 비율 19%→8%") |

#### 매칭 규칙
- 각 `strategy`는 **§4.4 부정 심층 영역과 1:1 연결** (원인 → 해결책)
- 마지막 mid row의 `expectedImpact`는 **전체 부정률 목표** (예: "전체 부정률 7.9%→4% 이하")

---

## 5. 슬롯 채우기 로직 — 어떤 데이터가 들어와도 동일 골격

### 5.1 만족도 대표값 표기 (§4.1 description 안)

§1.3에서 `score`가 필수이므로 정통 케이스는 항상 `score` 사용. `score`가 없는 변형 케이스(§1.3-C)에서만 fallback 적용.

```
정통 (score 있음):
  score 컬럼 (1-5) → "평균 별점 X.X점" 또는 "평균 X.X / 5.0"

score 대체 (§1.3-C):
  nps_score (0-10)         → "NPS X점"
  csat_score               → "CSAT X.X / 5.0"
  sentiment                → "긍정 비율 X%"
  텍스트 자동 감성 분류     → "긍정 비율 X% (자동 분류)"
```

### 5.2 별점 분포 슬롯 (§4.2)
```
1순위: score (1-5) → 5개 막대
2순위: nps_score (0-10) → 추천(9-10)/중립(7-8)/비추천(0-6) 3개 막대로 매핑
3순위: sentiment → 긍정/중립/부정 3개 막대
4순위: 모두 없음 → 자동 감성 분류 결과 3개 막대 + "자동 분류" 표기
```

### 5.3 영역×감성 슬롯 (§4.3)
```
1순위: topic 컬럼 (사전 분류) → 영역 그대로 사용
2순위: 키워드 기반 자동 토픽 분류 → 추출된 영역
3순위: 토픽 분류 결과 < 3개 → "유효 토픽 부족, 단일 카드로 표시" fallback
```

### 5.4 QuoteCard 정렬 가중 (§4.5, §4.7)
영역 매칭 + 감성 강도 필터링을 통과한 후보 안에서 다음 우선순위로 정렬한다.

```
1순위: thumbsUpCount (리뷰)         → 공감수 내림차순
2순위: ticket_priority (CS)         → 우선순위 내림차순
3순위: account_revenue (B2B)         → 매출 내림차순
4순위: 영역 키워드 등장 빈도         → 빈도 내림차순 (구체성 프록시)
5순위: 작성 일시 최신순 (at/date)
6순위: 등록 순서 (random fallback)
```

> 정통 리뷰 데이터(score + thumbsUpCount)는 1순위에서 결정. 4순위는 thumbsUpCount가 없는 데이터셋에서만 적용.
> 글자 수는 정렬 기준에서 제외 — 길이 30~150자 필터(§4.5 발췌 규칙)에서 처리하며, 정렬 신호로 쓰면 발췌 규칙과 충돌한다.

---

## 6. 컴포넌트 데이터 스키마 (참조)

상세는 [src/lib/constants.ts](../../../lib/constants.ts) `COMPONENT_DATA_SCHEMAS`. 본 명세에 등장하는 컴포넌트만 요약:

```ts
ExecutiveSummary: {
  description: string                               // 한 단락 줄글 (200-400자)
  // topMetrics, keyFindings는 옛 구조에서만 사용 — 현 정통 샘플은 description만
}

HorizontalBarChart: {
  chartTitle?: string,
  items: [{ label, value, count?, isOther? }]       // value 0-100
}

StackedBarChart: {
  chartTitle?: string,
  categories: string[],                             // ["긍정","중립","부정"]
  colors?: string[],                                // ["#7ccf00","#e6e7e9","#f87171"]
  items: [{ label, values: number[] }],             // values 합 = 100
  unit?: "h" | "%" | "건"
}

QuoteCard: {
  items: [{ tag, meta?, quote }]                    // 1-3개, 가로 그리드
}

StrategyTable: {
  phases: { immediate, short, mid },                // {label, sub}
  immediate: [{ strategy, objective, actionPlan, expectedImpact }],
  short:     [...],
  mid:       [...]
}
```

---

## 7. 콘텐츠 규칙

### 7.1 헤드라인 (`headline`) 작성 — 모든 섹션 공통
- ✅ **줄글 완전 문장** — 동사 종결, 명사구 단독 금지
- ✅ **두괄식** — 결론 먼저, 그 뒤에 수치/근거
- ✅ 1→8 순서대로 읽으면 전체 스토리가 이해되어야 함
- ❌ **em-dash(—) 금지** → 쉼표·접속사·문장 분리 사용
- ❌ 단순 사실 나열("별점 분포") 금지 — 항상 해석 포함

```
나쁜 예: "별점 분포 — 5점이 가장 많음"
좋은 예: "5점 리뷰가 77.5%로 압도적이며, 부정(1-2점)은 7.9%에 불과하지만 불만의 강도가 높습니다"
```

### 7.2 description 작성 — 섹션 2~8 공통
- 헤드라인의 **수치를 그대로 반복하지 않는다** (보강만)
- 1~2문장, 50~150자 권장
- "왜 그런지" 또는 "그 외 어떤 사실이 있는지"를 다룸
- bullet list 금지, 줄글 권장

### 7.3 수치 표기

| 케이스 | 표기 | 예시 |
|---|---|---|
| 비율 + 절대건수 | `N%(M건)` | `7.9%(79건)` |
| 변화 표현 | `A%→B%` | `19%→8%` |
| 평균 별점 | `X.X / 5.0` | `4.5 / 5.0` |
| 영역 라벨 (§4.3) | `"{영역명} ({비중}%)"` | `"배송/CS (18.2%)"` |
| QuoteCard meta | `"{별점} · 공감 {수}"` | `"1점 · 공감 598"` |
| 큰 수 | 천 단위 콤마 | `1,000건` |
| 소수점 | 1자리 통일 | `7.94%` → `7.9%` |

### 7.4 수치 밀도 — 4개 슬롯 제한 (메모리 규칙: Executive number count)
한 문장당 수치는 **최대 4개**. 8~10개를 한 문장에 몰지 말 것.

```
나쁜 예 (수치 9개):
"총 1,000건 중 5점 775건(77.5%), 4점 89건(8.9%), 부정 79건(7.9%) 중 배송 35건(44%)..."

좋은 예 (수치 4개):
"평균 4.5점으로 만족도가 높고, 부정 79건(7.9%) 중 44%가 배송에 집중됩니다"
```

### 7.5 톤 — 감정 판단 표현 금지
- ❌ "분노/좌절/무력감/억울함" 등 감정 명사
- ✅ "불만/부정/이탈 위험" 등 중립 표현
- 이유: 리뷰는 고객 텍스트 기반이라 LLM이 감정 명사를 과도하게 사용하는 경향

### 7.6 한국어 자연스러움 (메모리 규칙: Keep natural English)
영어가 자연스러운 용어는 **그대로 유지**:
- ✅ Executive Summary, Key Findings, NPS, CSAT, KPI
- ❌ "총괄 요약", "핵심 발견 사항" (어색)

### 7.7 고객 원문 인용 위치
- 고객 verbatim은 **QuoteCard `quote` 필드에서만** 따옴표 없이 발췌
- description에서 인용할 때만 작은따옴표 `'…'`로 감쌈 (예: `'좋아요', '최고' 등 짧은 표현이 대부분`)
- headline에는 어떤 경우에도 인용 금지
- 사용자명·전화번호 등 PII는 마스킹 또는 제거

---

## 8. AI팀 검수 체크리스트

### 8.1 골격 일관성
- [ ] 어떤 입력 데이터든 8개 섹션이 모두 렌더링되는가
- [ ] 데이터 부재 시 슬롯을 비우지 않고 fallback 메시지로 채우는가
- [ ] 섹션 순서가 1→8 고정인가
- [ ] negative-samples / positive-samples는 `attached: true`로 앞 섹션에 붙는가

### 8.2 3-Layer 구조 (메모리 규칙)
- [ ] attached가 아닌 모든 섹션에 `sectionName` + `headline` + `data.description`이 모두 채워졌는가
- [ ] `headline`에 em-dash(—)가 없는가
- [ ] `headline`이 줄글 완전 문장인가 (명사구 단독 X)
- [ ] 1→8 헤드라인을 순서대로 읽으면 스토리가 되는가

### 8.3 Executive Summary
- [ ] `data`에 `description` 한 필드만 사용했는가 (topMetrics·keyFindings 사용 안 함)
- [ ] description이 [메타 → 현황 → 발견 → 행동] 순서로 흐르는 한 단락 줄글인가
- [ ] description 안 핵심 수치가 4개 이하인가

### 8.4 슬롯 채우기
- [ ] §5.1 만족도 대표값 우선순위가 정확히 적용되는가
- [ ] §5.2 별점 분포 fallback이 작동하는가
- [ ] §5.4 공감 가중이 데이터 소스에 따라 적절히 선택되는가

### 8.5 데이터 정합성
- [ ] §4.2 별점 분포 items 5개, value 합 = 100
- [ ] §4.3 StackedBarChart 각 행의 values 합 = 100
- [ ] §4.3 영역 라벨에 비중(%)이 포함되는가
- [ ] §4.3 정렬: 부정률 내림차순
- [ ] §4.4 / §4.6 마지막 row가 "기타"이고 `isOther: true`인가
- [ ] §4.5 / §4.7 QuoteCard items 3개, meta 형식이 데이터 가용성에 맞게 적용됐는가 (thumbsUpCount 있음 → `"X점 · 공감 N"`, 없음 → `"X점"`)
- [ ] §4.5 / §4.7 quote 길이가 30~150자 범위, 150자 초과 시 핵심 발췌 + `…` 적용
- [ ] §4.5 / §4.7 발췌 시 의미 반전 표현(`근데`/`하지만`/`다만`)이 잘려 의미가 뒤집히지 않았는가
- [ ] §4.8 StrategyTable의 strategy ↔ §4.4 부정 영역과 1:1 매칭
- [ ] §4.8 마지막 mid row의 expectedImpact가 전체 부정률 목표인가

### 8.6 콘텐츠 규칙
- [ ] 모든 description / headline이 두괄식인가
- [ ] 감정 명사("분노/좌절") 사용 안 하는가
- [ ] 영어 용어("Executive Summary", "NPS")가 그대로 유지되는가
- [ ] QuoteCard quote에 사용자명·PII 없는가

---

## 9. 미해결 / 결정 필요

본 명세에 명시 못 한 항목 — AI팀과 협의 필요:

- **NPS·CS·B2B 데이터의 preprocessor 확장**: 현재 `voc-preprocessor.ts`는 리뷰(score 컬럼) 위주. NPS Detractor 비율, CS 에스컬레이션율, B2B 계정 가중 등을 preprocessor에 추가해야 §5의 슬롯 채우기가 가능.
- **시계열 섹션 추가 여부**: `dateRange`가 있고 분석 기간이 4주 이상일 때 "시계열 추세" 섹션을 9번째 슬롯으로 추가할지 (현재 명세는 8개 고정).
- **양극화 해석 섹션 추가 여부**: 1+5점 합산 70%+ 양극화가 감지될 때, ClusterCard 기반 "분포 패턴 해석" 섹션을 §4.2와 §4.3 사이에 추가할지 (옛 7섹션 구조에서 사용하던 슬롯, 현 정통 8섹션엔 없음. instagram 샘플은 옛 구조 사용 중).
- **비율 합 보정**: items의 value/values가 반올림으로 100이 안 될 때, 렌더링 직전 가장 큰 값에 ±1% 보정 룰 명문화 필요.
- **Verbatim 익명화**: 고객 원문에 개인정보(이름·전화번호 등) 포함될 가능성. preprocessor에서 자동 마스킹 필요한지 결정.
- **샘플 통합**: instagram 샘플과 sample.json은 옛 7섹션 구조(MetricHighlight·ClusterCard·InsightCard 사용). 현 정통 8섹션 구조로 마이그레이션 또는 폐기 결정 필요.
