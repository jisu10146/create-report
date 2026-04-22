# 트렌드 차트 Y축 스케일링 규칙

> 시계열 트렌드 차트(TrendLineChart 등)의 Y축 도메인을 데이터 기반으로 자동 계산하는 규칙. 에이전트 → sample JSON → 컴포넌트 렌더링으로 이어지는 파이프라인 전체에서 공유하는 스펙.

## 1. 배경 / 의도

리포트에 어떤 수치가 들어올지 미리 알 수 없습니다 (NPS가 -90일 수도, +50일 수도). 고정 스케일(-100~100)을 쓰면 변화량이 안 보이고, 데이터 min/max만 쓰면 미세한 변화가 과장됩니다.

두 가지가 동시에 성립해야 합니다:
- **데이터가 뷰를 결정한다** — Y축 범위는 데이터 min/max에서 계산
- **변화량이 작아도 과장되지 않는다** — 메트릭별 최소 표시 폭 보장

## 2. 디자인 원칙

1. **데이터가 뷰를 결정한다** — Y축 도메인의 유일한 입력은 `series.values`
2. **변화량이 작아도 과장되지 않는다** — 메트릭별 `minDisplayRange` 파라미터로 최소 표시 폭 보장
3. **기준선은 얹히기만 한다** — 0, SLA 등 기준선은 계산된 도메인 안에 있을 때만 차트에 점선 표시. 밖이면 설명 텍스트로 이동
4. **Nice number로 마무리** — 축 라벨은 1/2/5/10/20/50/100 단위로 반올림

## 3. 메트릭별 파라미터

| 메트릭 | `minDisplayRange` | `theoreticalBounds` | 대표 기준선 |
|---|---|---|---|
| `nps` | 10 | [-100, 100] | 0 (중립선) |
| `csat` | 0.5 | [1, 5] | 업계 평균 (고객사 제공 시) |
| `time` | `max(2, dataMax × 0.2)` | [0, ∞] | SLA (입력에 있을 때) |
| `percent` | 5 | [0, 100] | 목표치 |
| `count` | `max(dataMax × 0.2, 1)` | [0, ∞] | — |

> `minDisplayRange`는 곧 "이 정도 변화면 가파르게 느껴야 한다"의 임계치. 메트릭 의미에 맞게 디자이너가 튜닝.

## 4. 계산 수식

```
dataMin, dataMax = min/max of data
dataRange        = dataMax - dataMin

minRange         = METRIC_CONFIG[metricType].minDisplayRange
effectiveRange   = max(dataRange, minRange)
center           = (dataMin + dataMax) / 2
padding          = effectiveRange * 0.15

rawMin = center - effectiveRange/2 - padding
rawMax = center + effectiveRange/2 + padding

step   = niceStep(effectiveRange)
yMin   = max(niceFloor(rawMin, step), theoreticalMin)
yMax   = min(niceCeil (rawMax, step), theoreticalMax)

// 기준선 분류
visibleRefs      = refs where yMin <= ref.value <= yMax
outOfRangeRefs   = refs where ref.value < yMin or ref.value > yMax
```

### `niceStep`

| 범위 | 스텝 |
|---|---|
| ≤5 | 1 |
| ≤10 | 2 |
| ≤25 | 5 |
| ≤50 | 10 |
| ≤100 | 20 |
| ≤250 | 50 |
| 그 외 | 100 |

## 5. TypeScript 구현 스펙

```ts
interface ScaleInput {
  data: number[];
  metricType: "nps" | "csat" | "time" | "percent" | "count";
  references?: { label: string; value: number; contextText?: string }[];
}

interface ScaleOutput {
  yMin: number;
  yMax: number;
  tickStep: number;
  visibleRefs: Reference[];      // 도메인 안 — 점선으로 표시
  outOfRangeRefs: Reference[];   // 도메인 밖 — description에 contextText 합성
}

const METRIC_CONFIG = {
  nps:     { minDisplayRange: 10,  bounds: [-100, 100] },
  csat:    { minDisplayRange: 0.5, bounds: [1, 5] },
  time:    { minDisplayRange: (max: number) => Math.max(2, max * 0.2), bounds: [0, Infinity] },
  percent: { minDisplayRange: 5,   bounds: [0, 100] },
  count:   { minDisplayRange: (max: number) => Math.max(max * 0.2, 1), bounds: [0, Infinity] },
};

function computeYScale(input: ScaleInput): ScaleOutput {
  const dataMin = Math.min(...input.data);
  const dataMax = Math.max(...input.data);
  const dataRange = dataMax - dataMin;

  const { minDisplayRange, bounds } = METRIC_CONFIG[input.metricType];
  const minRange = typeof minDisplayRange === "function"
    ? minDisplayRange(dataMax)
    : minDisplayRange;

  const effectiveRange = Math.max(dataRange, minRange);
  const center = (dataMin + dataMax) / 2;
  const padding = effectiveRange * 0.15;

  const rawMin = center - effectiveRange / 2 - padding;
  const rawMax = center + effectiveRange / 2 + padding;

  const step = niceStep(effectiveRange);
  const yMin = Math.max(niceFloor(rawMin, step), bounds[0]);
  const yMax = Math.min(niceCeil(rawMax, step), bounds[1]);

  const refs = input.references ?? [];
  return {
    yMin, yMax, tickStep: step,
    visibleRefs: refs.filter(r => r.value >= yMin && r.value <= yMax),
    outOfRangeRefs: refs.filter(r => r.value < yMin || r.value > yMax),
  };
}

function niceStep(range: number): number {
  if (range <= 5)   return 1;
  if (range <= 10)  return 2;
  if (range <= 25)  return 5;
  if (range <= 50)  return 10;
  if (range <= 100) return 20;
  if (range <= 250) return 50;
  return 100;
}

function niceFloor(v: number, step: number) { return Math.floor(v / step) * step; }
function niceCeil (v: number, step: number) { return Math.ceil (v / step) * step; }
```

## 6. 샘플 JSON 스키마

### 6.1 추가·변경 필드

```jsonc
{
  "componentType": "TrendLineChart",
  "data": {
    "chartTitle": "월별 NPS 추이",
    "xLabels": ["1월", "2월", "3월"],
    "series": [
      {
        "id": "NPS",
        "values": [-20, -18, -16],
        "metricType": "nps",                              // ★ 추가 — 스케일링 규칙 선택 키
        "unit": "pt"                                       // ★ 추가 — 축·툴팁 라벨 접미사
      }
    ],
    "references": [                                        // benchmarks → references (의미 명확)
      {
        "label": "중립선",
        "value": 0,
        "contextText": "추천자와 비추천자가 같은 지점"     // ★ 추가 — 도메인 밖일 때 설명에 자동 삽입
      }
    ],
    "description": "..."
  }
}
```

### 6.2 필드별 렌더링 책임

| JSON 필드 | 렌더링 책임 |
|---|---|
| `series.values` | Y축 도메인 계산의 유일한 입력 |
| `series.metricType` | `METRIC_CONFIG[type]`에서 `minDisplayRange`·`bounds` 조회 |
| `series.unit` | 축 라벨·툴팁 접미사 |
| `references[].value` | 도메인 안 → 점선+라벨 / 밖 → 생략 |
| `references[].contextText` | 도메인 밖일 때 description 끝에 자동 덧붙임 |
| `description` | 항상 표시. 컴포넌트가 out-of-range refs의 contextText를 자동 합성 |

## 7. 에이전트 작성 규칙

에이전트 프롬프트에 다음을 반영:

```
TrendLineChart의 series 작성 시:

1. 각 series에 반드시 metricType 지정 (nps | csat | time | percent | count)
2. unit 명시 (pt, 점, h, %, 건 등)
3. 한 차트의 모든 series는 같은 metricType이어야 함
   → 다른 지표(예: NPS + 해결시간)는 차트를 분리
4. references는 "표시 희망" 기준선. 컴포넌트가 도메인 밖이면 자동으로 차트에서 생략
   → contextText를 함께 넣어두면 생략 시 description에 자동 합성됨
5. headline/description에는 reference 해석을 항상 텍스트로 포함
   (차트에 그려지는지 여부와 무관하게 맥락을 텍스트가 전달)
```

## 8. 테스트 케이스

| # | metricType | data | references | 기대 출력 |
|---|---|---|---|---|
| 1 | nps | `[-20, -18, -16]` | `[{value:0}]` | yMin=-25, yMax=-10, step=5, outOfRange=[0] |
| 2 | nps | `[-92, -90, -88]` | `[{value:0}]` | yMin=-100, yMax=-80, step=5, outOfRange=[0] |
| 3 | nps | `[-5, 0, 5]` | `[{value:0}]` | yMin=-7, yMax=7, step=2, visible=[0] |
| 4 | nps | `[-18, -18, -18]` (무변화) | `[{value:0}]` | yMin=-25, yMax=-10, step=5, outOfRange=[0] |
| 5 | time | `[18, 19.2, 17.8]` | `[{value:24}]` | yMin=16, yMax=21, step=1, outOfRange=[24] |
| 6 | time | `[20, 24, 28]` | `[{value:24}]` | yMin=18, yMax=30, step=2, visible=[24] |
| 7 | time | `[0.5, 0.8, 1.2]` | `[{value:24}]` | yMin=0, yMax=2.5, outOfRange=[24] |
| 8 | percent | `[45, 47, 49]` | `[{value:50}]` | yMin=42, yMax=54, step=2, visible=[50] |

## 9. 시각 검증 체크리스트

디자이너·QA 리뷰용:

- [ ] 테스트 #4 같은 무변화 데이터가 **수평에 가깝게** 보이는가 (수직 변동 5% 이하)
- [ ] 테스트 #1에서 데이터 선이 차트 상단 1/3 영역에 위치해 "개선 중" 느낌이 오는가
- [ ] 테스트 #6에서 SLA 기준선이 차트 중앙 근처에 점선으로 보이고, 데이터 선이 그 위아래로 교차하는가
- [ ] 테스트 #2, #7처럼 기준선이 도메인 밖일 때, 차트 아래 description에 contextText가 자동 합성되어 나타나는가
- [ ] Y축 라벨이 -37, -22 같은 애매한 숫자 없이 나이스 스텝(1/2/5/10/20/50/100)으로만 나오는가

## 10. 변화량별 시각 인상 (NPS, minDisplayRange=10 기준)

| 실제 변화 | 도메인 폭 | 화면 높이 비율 | 인상 |
|---|---|---|---|
| 0.2pt | 15 | 1.3% | 수평, "변화 없음" |
| 1pt | 15 | 6.7% | 미세한 기울기 |
| 3pt | 15 | 20% | 뚜렷하지만 완만 |
| 5pt | 15 | 33% | 확실한 방향성 |
| 10pt | 15 | 67% | 가파른 변화 |
| 20pt | 30 (eff=20) | 67% | 가파르지만 과장 X |

## 11. 안티패턴

### ❌ 여러 메트릭을 한 차트에 섞기

```jsonc
// headline에는 NPS + 해결시간인데 series에는 NPS만 있음
{
  "headline": "NPS -20→-16, 해결시간 19.2→17.8h",
  "data": { "series": [{ "id": "NPS", "metricType": "nps", ... }] }
}
```

단위·스케일이 다른 지표를 한 headline에 묶으면 차트가 이를 표현할 수 없습니다. 차트 2개로 분리하거나 headline을 한 지표로 좁히세요.

### ✓ 차트 분리

```jsonc
// 차트 1: NPS
{
  "id": "nps-trend",
  "headline": "NPS가 -20에서 -16으로 소폭 개선됐지만 여전히 마이너스 구간",
  "data": {
    "series": [{ "id": "NPS", "values": [-20,-18,-16], "metricType": "nps", "unit": "pt" }],
    "references": [{ "label": "중립선", "value": 0, "contextText": "0을 넘어야 추천자 우세" }]
  }
},
// 차트 2: 해결시간
{
  "id": "resolution-time-trend",
  "headline": "평균 해결시간 19.2→17.8h로 정체",
  "data": {
    "series": [{ "id": "평균 해결시간", "values": [19.2,18.5,17.8], "metricType": "time", "unit": "h" }],
    "references": [{ "label": "SLA", "value": 24, "contextText": "SLA 24h 기준" }]
  }
}
```

## 12. 관련 파일

- [src/components/ReportRenderer/components/TrendLineChart.tsx](../src/components/ReportRenderer/components/TrendLineChart.tsx) — 구현 대상. `yScale` 계산 로직을 이 스펙으로 교체
- [src/agents/definitions/customer-support-analysis/sample-basic.json](../src/agents/definitions/customer-support-analysis/sample-basic.json) — 스키마 적용 예시 대상
