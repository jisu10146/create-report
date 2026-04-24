# 리포트 생성 워크플로우 (Claude Code 직접 실행)

기존 Gemini API 호출 기반 파이프라인(`src/agents/runner/`)은 제거됨. 이제 Claude Code(나)가 직접 데이터를 분석하고 sample JSON을 생성한다.

## 워크플로우

### 1. 입력
사용자가 다음 둘 중 하나로 요청:
- 원본 데이터 파일 경로 (`coupang_reviews.json`, `sample_customer_support_tickets_v2.csv` 등)
- 데이터 + 사용할 에이전트 ID (`review-analysis`, `customer-support-analysis` 등)

**기존 에이전트 재사용 시 data-spec 재작성 금지**: 같은 에이전트 유형이면 컬럼 구조가 동일하므로 기존 `definitions/{id}/report-spec.md`(또는 data-spec.md)를 참조만 한다. data-spec을 새로 작성하지 않는다. 완전히 새로운 에이전트 유형일 때만 data-spec 작성.

### 2. 데이터 분석 (Data Analyst 단계)
- 원본 데이터를 읽고 구조·분포·주요 통계 추출
- Python 스크립트 또는 Bash로 집계
- **참고 규칙:** `src/agents/data-analyst.md`

산출물:
- 기본 통계 (전체 건수, 평균, 분포)
- 토픽/카테고리별 집계
- 감성/별점 분포
- 주요 키워드 빈도

### 3. 섹션 구조 확정 (Strategy Writer 단계)
- 에이전트의 `agent.json` 읽어 `reportSections` 확인
- 섹션 구조는 고정 (어떤 데이터든 동일한 componentType)
- 데이터에 따라 각 섹션의 **내용 비중**만 달라짐
- **참고 규칙:** `src/agents/strategy-writer.md`

### 4. 섹션별 콘텐츠 생성 (Sample Generator 단계)

**최상위 JSON 구조**: `meta + sections`만. 과거 `executiveSummary` 최상위 필드는 사용하지 않음 (ES도 `sections[0]`으로 포함).

**각 섹션마다 다음 3단 구조로 생성:**
```json
{
  "id": "...",
  "sectionName": "짧은 주제명 (예: 리뷰 현황, 매체 비용 구성)",
  "headline": "줄글 완전 서술형 발견 문장 (수치 포함, 두괄식, ~습니다로 마침)",
  "componentType": "...",
  "data": {
    "description": "헤드라인의 근거·배경 서술 (여러 문장 OK)",
    // 컴포넌트별 데이터 필드
  }
}
```

**ES 섹션 예외**: `data`에는 `description`만 사용. `topMetrics`·`keyFindings`는 deprecated. 메타 설명 + 현황 + 원인 + 해결 방향을 한 문단(3-5문장)으로 녹인다.

**Headline 작성 규칙**:
- em-dash(—) 조각형 금지 — 접속사(~이며, ~이지만, ~하면서, ~해서)로 연결된 완전 서술형 문장
- `~습니다`/`~입니다`로 마침, 명사 종결 금지
- 나쁜 예: "전체 CPA ₩15,022·CTR 3.67% — 매체 간 편차 2.4배로 평균이 실태를 가림"
- 좋은 예: "전체 CPA ₩15,022·CTR 3.67%로 평균 효율은 무난해 보이지만, 매체 간 CPA 편차가 2.4배에 달해 평균만 보면 실제 효율 격차가 드러나지 않습니다"

**체크리스트 (sample-generator.md §0-5):**
- [ ] A. 분석 메타데이터 노출 금지 ("토픽", "영향도", "임팩트")
- [ ] B. 주어 생략 금지 ("1점은" → "1점 리뷰는")
- [ ] D. 분석자 시점 금지 ("나타납니다", "관찰됩니다", "확인됩니다")
- [ ] E. 추상 명사 주어 금지 ("~의 핵심은", "~의 근거이며")
- [ ] headline과 description이 같은 내용 반복 금지
- [ ] headline에 em-dash 조각형 없음, `~습니다`로 마침

### 4-3. 섹션 간 논리 흐름·중복 검토 (JSON 저장 전, 필수)

상세 콘텐츠 작성 후, JSON 저장 직전에 아래를 독립 단계로 수행한다:

1. **논리 흐름 검토**: 섹션 순서를 "그래서 → 왜냐하면 → 따라서" 구조로 설명할 수 있어야 함. 안 되면 순서 재배치하거나 연결 섹션 추가
2. **중복 체크**: 같은 내용이 반복되는 섹션(특히 ES ↔ 다음 KPI 섹션, 매체 단면 ↔ 근본 원인)을 찾아 하나로 합치거나 각도 차별화
3. 수정 전/후를 짧게 정리해 확정만 요청 (자세한 중복 패턴은 [pm.md](pm.md) §0-1, §7 참조)

### 4-5. ★ 한국어 문체 자가 점검 (필수, 별도 단계로 분리)

작성한 모든 텍스트 필드를 `sample-generator.md §0-5 A~H` 체크리스트로 대조. 자세한 절차는 §0-6 참조.

작성과 점검을 동시에 하면 빠진다 — 반드시 작성 완료 후 별도 단계로 진행.

### 5. Executive Summary 생성
- ES는 `sections[0]`에 포함 (최상위 `executiveSummary` 필드 사용 X)
- 섹션 헤드라인들을 순서대로 읽었을 때 전체 스토리가 되는지 확인
- ES headline은 리포트 전체를 관통하는 한 문장 (인사이트형, 예: "~하면 ~할 수 있습니다")
- ES description 첫 문장에 **분석 맥락** (뭘 분석했는지), 이어서 현황 → 원인 → 해결 방향을 한 문단(3-5문장)으로
- topMetrics/keyFindings는 쓰지 않음 (description 하나로 통합)

### 6. 저장
`src/agents/definitions/{agentId}/sample-{label}.json`으로 저장

### 7. 검증
- `http://localhost:3001/preview/{agentId}?sample={label}` 접근
- 시각적으로 확인 (섹션 구조, 헤드라인 스토리 흐름, 차트 렌더링)

### 7-5. 필수 컬럼 검증 (Required-Only Simulation) — 공유 전 필수

sample 데이터는 선택 컬럼을 포함하는 경우가 많아 빠진 fallback을 놓치기 쉽다. **공유 전에 반드시** "필수 컬럼만 있는 가상 데이터"로 각 섹션을 walk-through.

절차:
1. report-spec.md §1의 "필수" 컬럼만 남기고 선택 컬럼 제거한 상황 상상
2. 각 섹션마다 (a) 필수만으로 산출 가능? (b) fallback이 명시? (c) 섹션 의미 유지?
3. "No"가 있으면 report-spec.md에 fallback 추가 or 섹션 재설계

특히 InsightCard처럼 **차원 이름이 특정 컬럼에 종속**되는 섹션은 fallback 차원을 반드시 명시. 자세한 절차는 [strategy-writer.md](strategy-writer.md) "필수 컬럼 검증 절차" 및 [pm.md](pm.md) §7-5 참조.

## 규칙 파일 참조

| 단계 | 규칙 파일 | 역할 |
|---|---|---|
| 2. 데이터 분석 | `data-analyst.md` | 데이터 유형별 분석 패턴 |
| 3. 구조 설계 | `strategy-writer.md` | 두괄식, 헤드라인 스토리 흐름 |
| 4. 콘텐츠 생성 | `sample-generator.md` | 한국어 문체 §0-5, 수치 정합성 |
| 전체 체크 | `pm.md` | 품질 검증 |

## 구조 원칙 (feedback_rule_first.md 참조)

- **섹션 구조는 고정, 데이터만 변동**: 같은 에이전트는 어떤 데이터가 와도 동일한 섹션 수·componentType
- **sectionName + headline + description 3단 구조**: 모든 섹션 통일
- **headline은 결론, description은 근거**: 두괄식
