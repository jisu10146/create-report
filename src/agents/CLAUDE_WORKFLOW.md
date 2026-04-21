# 리포트 생성 워크플로우 (Claude Code 직접 실행)

기존 Gemini API 호출 기반 파이프라인(`src/agents/runner/`)은 제거됨. 이제 Claude Code(나)가 직접 데이터를 분석하고 sample JSON을 생성한다.

## 워크플로우

### 1. 입력
사용자가 다음 둘 중 하나로 요청:
- 원본 데이터 파일 경로 (`coupang_reviews.json`, `sample_customer_support_tickets_v2.csv` 등)
- 데이터 + 사용할 에이전트 ID (`review-analysis`, `customer-support-analysis` 등)

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
각 섹션마다 다음 3단 구조로 생성:
```json
{
  "id": "...",
  "sectionName": "섹션명",
  "headline": "결론 먼저 (두괄식, 수치 포함)",
  "componentType": "...",
  "data": {
    "description": "헤드라인의 근거·배경 서술",
    // 컴포넌트별 데이터 필드
  }
}
```

**체크리스트 (sample-generator.md §0-5):**
- [ ] A. 분석 메타데이터 노출 금지 ("토픽", "영향도", "임팩트")
- [ ] B. 주어 생략 금지 ("1점은" → "1점 리뷰는")
- [ ] D. 분석자 시점 금지 ("나타납니다", "관찰됩니다", "확인됩니다")
- [ ] E. 추상 명사 주어 금지 ("~의 핵심은", "~의 근거이며")
- [ ] label과 description이 같은 내용 반복 금지

### 4-5. ★ 한국어 문체 자가 점검 (필수, 별도 단계로 분리)

작성한 모든 텍스트 필드를 `sample-generator.md §0-5 A~H` 체크리스트로 대조. 자세한 절차는 §0-6 참조.

작성과 점검을 동시에 하면 빠진다 — 반드시 작성 완료 후 별도 단계로 진행.

### 5. Executive Summary 생성
- 섹션 헤드라인들을 순서대로 읽었을 때 전체 스토리가 되는지 확인
- ES description 첫 문장에 **분석 맥락** (뭘 분석했는지)
- 나머지는 근거·해결 방향

### 6. 저장
`src/agents/definitions/{agentId}/sample-{label}.json`으로 저장

### 7. 검증
- `http://localhost:3001/preview/{agentId}?sample={label}` 접근
- 시각적으로 확인 (섹션 구조, 헤드라인 스토리 흐름, 차트 렌더링)

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
