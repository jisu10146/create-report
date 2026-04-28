# Ad Performance ROAS Analysis 리포트 명세

> AI팀 개발 핸드오프용. **광고 성과 데이터 + 매출(ROAS) 데이터가 함께 들어왔을 때 동일한 9개 슬롯**으로 구성되는 범용 리포트. 매출 컬럼이 없으면 [ad-performance-analysis](../ad-performance-analysis/report-spec.md) 사용.
>
> 관련 파일:
> - 도메인 지식 → [skills/marketing-funnel.md](../../skills/marketing-funnel.md), [skills/marketing-attribution.md](../../skills/marketing-attribution.md)
> - 컴포넌트 데이터 스키마 → [src/lib/constants.ts](../../../lib/constants.ts) `COMPONENT_DATA_SCHEMAS`
> - 콘텐츠 규칙 → [sample-generator.md](../../sample-generator.md), [strategy-writer.md](../../strategy-writer.md)

---

## 1. 입력 데이터

### 1.1 입력 형식
CSV 또는 JSON. 1행 = 1(일자 × 매체 × 캠페인)의 집계 데이터.

### 1.2 컬럼 정의

#### 필수 (없으면 리포트 생성 불가)

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `날짜` (date) | date | 집계 일자 | 2025-03-01 |
| `매체` (channel/media) | string | 광고 매체 | 구글, 네이버, 메타, 카카오 |
| `캠페인명` (campaign) | string | 캠페인 식별자 | [구글]_브랜드검색_CPC |
| `노출수` (impressions) | integer | 일일 노출 수 | 27099 |
| `클릭수` (clicks) | integer | 일일 클릭 수 | 1652 |
| `비용` (cost) | integer | 일일 광고비 (원) | 1568093 |
| `전환수` (conversions) | integer | 일일 전환 수 | 247 |
| `매출` (revenue) | integer | 일일 광고 기여 매출 (원) | 12830000 |

> 이 에이전트는 매출 컬럼을 **필수**로 본다. ROAS·CPA 두 축 분석이 핵심이기 때문. 매출이 없으면 [ad-performance-analysis](../ad-performance-analysis/report-spec.md)를 사용.

**매출 컬럼 정의**: 해당 (날짜·매체·캠페인) 단위에서 발생한 결제 금액 합계. 광고 매체의 전환값 또는 GA4·내부 DB의 utm 매핑으로 산출. 환불·어트리뷰션 모델 차이가 있을 수 있어 산출 방법을 메타에 명시 권장.

#### 선택 — 있으면 해당 분석 활성화

| 컬럼 | 타입 | 설명 | 없을 때 영향 |
|------|------|------|-------------|
| `디바이스` (device) | string | 모바일/PC | 디바이스별 교차 분석 비활성 |
| `타겟_세그먼트` (audience) | string | 타겟 세그먼트 | 타겟 세그먼트별 비교 비활성 |

### 1.3 컬럼 → 섹션 강화 매핑

| 리포트 섹션 | 필수 컬럼만으로 가능한 것 | 선택 컬럼이 있으면 강화 |
|------------|----------|---------------------|
| Executive Summary | 광고비·매출 총합, 전체 ROAS, 매체 ROAS 편차 | — |
| 매체 비용 구성 (DonutChart) | 매체별 비용 점유율 | 항상 채워짐 |
| 매체 매출 기여도 (DonutChart) | 매체별 매출 점유율 | 항상 채워짐 |
| 핵심 효율 KPI (MetricHighlight) | ROAS·CPA·CVR + 매체 편차 | — |
| 매체별 효율 비교 (DataTable) | CTR·CVR·CPA·매출·ROAS | 디바이스 → 모바일/PC 행 분리 옵션 |
| 수익성 우수 캠페인 (DataTable) | ROAS desc TOP 5 + CPA 컬럼 | 타겟 세그먼트 → 타겟별 ROAS 추가 |
| 수익성 낮은 캠페인 (DataTable) | ROAS asc BOTTOM 5 + CPA 컬럼 | 동일 |
| 주별 ROAS 추이 (TrendLineChart) | 주별 매체 ROAS | — |
| 예산 재배분 (StrategyTable) | 매체·캠페인 ROAS 기반 액션 | — |

### 1.4 최소 권장 건수
- **100행 이상**: 매체별 일 단위 추이 분석이 유의미 (매체 4개 × 25일+)
- **300행 이상**: 캠페인별 주별 교차가 안정적
- **30행 미만**: 리포트 생성 가능하나 "통계적 신뢰도 낮음" 경고 표시

### 1.5 데이터 기간 요구
- **4주 이상 권장** — 주별 추이(섹션 8)가 의미를 가지려면 최소 3주
- **4주 미만**: TrendLineChart를 MetricHighlight(일별 ROAS 변동계수)로 대체

---

## 2. 설계 원칙

### 단일 골격
광고 매체·캠페인·전환 정의는 도메인마다 다양하지만, **리포트 골격은 동일**하다. 슬롯에 들어가는 *매체 이름*과 *캠페인 이름*만 달라진다.

| 변하는 것 | 변하지 않는 것 |
|---|---|
| 매체 종류 (구글/네이버/메타 vs TikTok/Twitter) | "매체별 비용·매출 구성" 두 도넛 |
| 캠페인 네이밍 규칙 | 캠페인 ROAS TOP/BOTTOM 비교 슬롯 |
| 객단가·전환 정의 | "ROAS 기준 효율" 해석 프레임 |
| 기간 길이 (4주/3개월/1년) | 주별 ROAS 추이 섹션 |

### "필수 슬롯" 원칙
- 9개 섹션은 **항상 자리에 있다**. 데이터에 따라 채우는 콘텐츠가 줄어들 뿐, 슬롯 자체는 유지.
- AI팀이 구현 시 **섹션을 동적으로 빼지 않는다** — 일관된 사용자 경험.

### CPA vs ROAS 두 축 원칙
- **단일 지표 정렬 금지**: 캠페인 TOP/BOTTOM은 ROAS 기준으로 정렬하되, CPA 컬럼도 함께 표시.
- 이유: CPA가 낮아도 ROAS가 낮을 수 있고(객단가 낮은 전환), CPA가 높아도 ROAS가 높을 수 있음(쇼핑 인텐트). 둘 다 보여줘야 의사결정 가능.

---

## 3. 리포트 골격 — 9개 섹션 (고정)

```
1. Executive Summary           — 전체 요약
2. 매체 비용 구성              — 매체별 비용 점유율
3. 매체별 매출 기여도          — 매체별 매출 점유율 (§2와 2열 그리드 자동 페어링)
4. 핵심 효율 KPI               — ROAS·CPA·CVR + 매체 편차
5. 매체별 효율 비교            — 매체 × 지표 교차 테이블 (CTR·CVR·CPA·매출·ROAS)
6. 수익성 우수 캠페인 TOP 5    — ROAS desc 정렬 (CPA 컬럼 포함)
7. 수익성 낮은 캠페인 BOTTOM 5 — ROAS asc 정렬 (CPA 컬럼 포함)
8. 주별 ROAS 추이              — 매체별 주별 ROAS 변화
9. 예산 재배분                 — 즉시/단기/중기 (ROAS 목표 포함)
```

이 순서는 **고정**. PM/Strategy Writer는 이 순서를 임의로 바꾸지 않는다.

---

## 4. 섹션별 슬롯 명세

### 섹션 1. Executive Summary
- **컴포넌트**: `ExecutiveSummary`
- **목적**: 리포트를 1분 안에 파악할 수 있게 핵심만 압축
- **슬롯**: `description` (3-5문장 한 문단)
  - 분석 메타 (기간·매체 수)
  - 현황 (총 비용·매출·평균 ROAS·매체 편차)
  - 원인 (비용↔매출 점유율 어긋남)
  - 해결 방향 (액션 → 목표 ROAS)
- **수치 슬롯**: 4개 한도 ([feedback_executive_number_count.md] 준수)

---

### 섹션 2-3. 매체 비용 구성 + 매체별 매출 기여도 (DonutChart 페어)

**§2 매체 비용 구성**
- **컴포넌트**: `DonutChart`
- 슬롯: `title`, `items` (매체명·점유율·비용액)
- 헤드라인: 1위 매체 비용 집중도

**§3 매체별 매출 기여도**
- **컴포넌트**: `DonutChart`
- 슬롯: `title`, `items` (매체명·점유율·매출액)
- 헤드라인: 비용 점유율과 매출 점유율의 어긋남 정량화 (예: "구글은 비용 59.9% 대비 매출 67.9%")

**레이아웃 규칙**: DonutChart 다음에 DonutChart가 와도 SingleSectionLayout에서 2열 그리드로 자동 묶임.

---

### 섹션 4. 핵심 효율 KPI
- **컴포넌트**: `MetricHighlight` (items 정확히 3개)
- **목적**: ROAS 중심 효율을 3개 지표로 요약

| 슬롯 | 역할 | 채우는 예시 |
|---|---|---|
| `items[0]` | **ROAS** + 매체 편차 (가장 강조) | "평균 ROAS 382% (매체별 101~432%, 편차 4.3배)" |
| `items[1]` | **CPA** + 매체 편차 + ROAS 격차 비교 | "평균 CPA ₩15,022 (편차 2.4배 — ROAS 격차보다 좁음)" |
| `items[2]` | **CVR** + 매체 편차 | "전체 CVR 5.47% (1.20~6.85%, 편차 5.7배)" |

- **콘텐츠 규칙**:
  - ROAS를 첫 카드로 → 수익성 관점이 비용 관점에 우선
  - CPA description에 "ROAS 격차에 비하면 CPA 격차가 좁다"는 메타 인사이트 포함

---

### 섹션 5. 매체별 효율 비교
- **컴포넌트**: `DataTable`
- **목적**: 매체별 효율 지표를 한 표로 교차 비교

| 슬롯 | 역할 |
|---|---|
| `columns` | 매체 목록 (비용 내림차순) |
| `rows` | CTR · CVR · CPA · 매출 · ROAS (5개 고정) |
| `showDots` | `false` |

- **행 순서**: CTR → CVR → CPA → 매출 → ROAS (효율 funnel + 결과 지표)
- **제외**: 비용은 §2 도넛에, 노출/클릭은 §4 KPI에 있으므로 행으로 넣지 않음

---

### 섹션 6-7. 캠페인 ROAS TOP/BOTTOM
- **컴포넌트**: `DataTable` × 2섹션
- **목적**: 개별 캠페인 단위에서 확대·중단 결정 가능한 정보 제공

| 슬롯 | 역할 |
|---|---|
| `columns` | **지표 목록 (고정 5개)** — 비용 / CPA / 전환수 / 매출 / ROAS |
| `rows` | **캠페인 목록 (가변 N개)** — `metric` 필드에 캠페인명 |

- **§6 정렬**: ROAS 내림차순 상위 5개 (확대 대상)
- **§7 정렬**: ROAS 오름차순 상위 5개 (중단·재설계 대상)
- **CPA 컬럼 의무**: ROAS와 함께 CPA를 보여 'CPA는 평범한데 ROAS가 높은/낮은' 캠페인을 드러냄
- 캠페인 11개 이상이면 중간 생략, headline에 "전체 N개 중 ROAS 상위 5 + 하위 5" 맥락 포함

- **헤드라인 작성 규칙** — CPA·ROAS 어긋나는 캠페인을 강조:
  - 좋은 예 (TOP): "네이버 쇼핑검색은 CPA가 평균보다 높지만 ROAS가 410%로 높아, CPA만 보면 놓치게 되는 객단가 효과를 드러냅니다"
  - 좋은 예 (BOTTOM): "메타 브랜드인지 영상은 CPA가 평균 수준이지만 ROAS는 220%로 낮아, 비용 효율과 수익성이 어긋나는 대표 사례입니다"

---

### 섹션 8. 주별 ROAS 추이
- **컴포넌트**: `TrendLineChart`
- **목적**: 4주 이상 기간에서 매체별 ROAS의 주별 변화 추이

| 슬롯 | 역할 |
|---|---|
| `title` | "매체별 주별 ROAS 추이" |
| `xLabels` | 주차 라벨 (예: 1주 차~4주 차) |
| `series` | 매체별 ROAS 값 배열, `unit: "%"`, `metricType` 미지정 (raw로 처리) |
| `benchmarks` | 전체 평균 ROAS 기준선 |

- **데이터 부재 시 fallback**:
  - 4주 미만 → MetricHighlight로 대체 (일별 ROAS 변동계수 요약)

- **헤드라인 규칙**: 가장 두드러진 변화 매체 + 변화 방향
  - 예: "4주 차에 카카오 ROAS가 80%까지 떨어지고 메타도 220%로 내려와, 월 후반으로 갈수록 두 매체의 회수율 악화가 뚜렷해지고 있습니다"

---

### 섹션 9. 예산 재배분
- **컴포넌트**: `StrategyTable`
- **목적**: 비효율 매체·캠페인에 대응하는 즉시/단기/중기 액션

| 슬롯 | 역할 | 행 수 |
|---|---|---|
| `immediate` | 캠페인 pause·예산 재배분 등 즉시 실행 | 1-2개 |
| `short` | 크리에이티브 교체·타겟 재정의·입찰 구조 개선 | 1-2개 |
| `mid` | 매체 ROAS 벤치마크 수립·매체 믹스 재설계 | 1개 |

- **각 행 필드**:
  - `strategy`: 행동 지향 1줄
  - `objective`: 어떤 지표를 어떻게 개선하는지 (ROAS·CPA 모두 가능)
  - `actionPlan`: 실행 방법 (2개 이상이면 \n 불렛)
  - `expectedImpact`: 정량 목표 (ROAS 변화 + 월 매출 변화)

- **콘텐츠 규칙**:
  - 모든 strategy는 §6·7(캠페인 ROAS) 또는 §5(매체 ROAS)와 1:1 연결
  - 마지막 mid 항목은 **종합 ROAS 목표** + 매출 목표

---

## 5. 슬롯 채우기 로직

### 매체별 매출 슬롯 (Section 3 `items[].count`)
```
sum(매출) by 매체, 비용 내림차순으로 정렬 (§2와 동일 순서 유지)
```

### 매체별 ROAS 슬롯 (Section 5 `rows[ROAS]`)
```
ROAS = sum(매출) / sum(비용) × 100, 정수 % 표시
```

### 캠페인 ROAS 정렬 (Section 6·7)
```
ROAS = sum(매출) / sum(비용) × 100
§6: ROAS desc 상위 5
§7: ROAS asc 상위 5

매출=0 또는 결측 캠페인은 §7 후보 (별도 표기 "매출 결측")
```

### 주별 ROAS series 슬롯 (Section 8)
```
주별 sum(매출) / 주별 sum(비용) × 100, 매체별로 분리
unit: "%"
benchmarks: 전체 평균 ROAS
```

---

## 6. 콘텐츠 규칙 (ROAS Analysis 특수)

> 글로벌 콘텐츠 규칙(두괄식, 명사구 헤드라인, ES.description=메타 설명, 3단 구조) → [sample-generator.md](../../sample-generator.md) §0~§0-4 참조

### 6.1 ROAS 단위
- 정수 % 표시: `382%` (소수점 미사용)
- 매체 편차 표현: "편차 X.X배" (max/min)
- 손익분기(BEP) 언급은 ROAS 100% 기준으로만 (매출 = 광고비)

### 6.2 매출 단위
- 원 단위 정수: `490,339,000원` (천 단위 콤마)
- 큰 금액은 "억" 단위 텍스트도 가능: `7.22억 원` (description에 한해)

### 6.3 비용 점유율 vs 매출 점유율 어긋남 표현
- "비용 X.X% 대비 매출 Y.Y%" 형식 권장
- 어긋남 방향:
  - 매출 점유율 > 비용 점유율 → "효율 우수"
  - 매출 점유율 < 비용 점유율 → "회수 부족"
  - ROAS 100% 미만 → "광고비도 회수 못 함"

### 6.4 CPA·ROAS 어긋남 인사이트
- 캠페인 단위에서 CPA 순위와 ROAS 순위가 다른 경우 헤드라인·description에 명시
- "CPA만 보면 ~로 보이지만 ROAS는 ~" 패턴 사용

### 6.5 컴포넌트 배치
- DonutChart 두 개(§2·§3)는 2열 그리드 자동 묶임
- DataTable 연속 3개(§5·§6·§7)는 각각 전폭 배치

---

## 7. AI팀 검수 체크리스트

### 7.1 골격 일관성
- [ ] 9개 섹션이 모두 렌더링되는가
- [ ] 매출 컬럼 부재 시 ad-performance-analysis로 안내되는가
- [ ] 섹션 순서가 1→9 고정인가

### 7.2 슬롯 채우기
- [ ] DonutChart 두 개가 2열 그리드로 묶이는가
- [ ] §6·§7이 ROAS 기준으로 정렬되어 있는가 (CPA 아님)
- [ ] §6·§7에 CPA 컬럼이 함께 표시되는가
- [ ] TrendLineChart가 4주 미만일 때 fallback으로 축소되는가

### 7.3 콘텐츠 규칙
- [ ] ES headline이 "비용↔매출 점유율 어긋남" 또는 "ROAS 격차"를 언급하는가
- [ ] §6·§7 헤드라인에 CPA·ROAS 어긋남 인사이트가 포함되는가
- [ ] 모든 ROAS는 정수 % 표시인가
- [ ] 캠페인명이 label에 통째로 들어가 있지 않은가

### 7.4 데이터 정합성
- [ ] DonutChart §2 비용 합계 = 전체 비용
- [ ] DonutChart §3 매출 합계 = 전체 매출
- [ ] DataTable §5 매체 ROAS = 매체 매출 / 매체 비용 × 100
- [ ] §6·§7 캠페인 ROAS = 캠페인 매출 / 캠페인 비용 × 100
- [ ] StrategyTable expectedImpact의 ROAS·매출 수치가 §5·§6·§7 근거와 정합한가
