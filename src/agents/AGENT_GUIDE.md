# 에이전트 추가/수정 가이드

## 새 에이전트 추가 시

### 필수 (3개 파일)
1. `src/agents/definitions/{id}/agent.json` — 구성안
2. `src/agents/definitions/{id}/sample.json` — 샘플 데이터
3. `src/agents/definitions/{id}/report-spec.md` — 리포트 명세 (입력 컬럼 + 7개 섹션 슬롯 + 콘텐츠 규칙 통합)
   - Sample Generator가 자동 로드하여 LLM에 주입
   - 예시: [voc-analysis/report-spec.md](definitions/review-analysis/report-spec.md), [customer-support-analysis/report-spec.md](definitions/customer-support-analysis/report-spec.md)

→ 이것만 하면 `http://localhost:3001/preview/{id}`에서 바로 확인 가능.

### 선택 (도메인 지식이 필요할 때)
3. `src/agents/skills/{name}.md` — 스킬 파일 생성
   - skills/ 폴더에 .md 파일만 넣으면 **자동 감지** (index.ts 수동 등록 불필요)
   - 첫 줄에 `keywords:` 추가 → 에이전트 description과 키워드 매칭으로 자동 선택

### 마케팅 도메인 참고 플레이북 (ai-marketing-skills)
외부 출처(github.com/ericosiu/ai-marketing-skills)에서 가져온 15개 플레이북이 `skills/`에 포함됨:
`growth-engine, sales-pipeline, content-ops, outbound-engine, seo-ops, finance-ops, revenue-intelligence, conversion-ops, podcast-ops, team-ops, sales-playbook, autoresearch, deck-generator, yt-competitive-analysis, x-longform-post`

- **성격**: 실무 플레이북/프레임워크 참고 자료. 섹션 설계 시 도메인 용어·메트릭·플로우를 끌어쓰기 위함
- **자동 매칭**: 각 파일 상단에 `keywords:` 있음 — 에이전트 description과 매칭되면 자동 로드
- **실행 금지**: preamble 안의 `python3`/`bash` 스크립트는 이 프로젝트에서 실행하지 않음 (본 프로젝트는 리포트 생성기, 외부 스킬 러너 아님)

### 불필요 (자동 처리됨)
- ~~skills/index.ts에 파일명 등록~~ → 자동 스캔
- ~~generateStaticParams 수정~~ → definitions/ 폴더에서 자동 감지

---

## 새 컴포넌트 추가 시

### 3곳 수정 필요 (런타임 검증이 누락을 자동 감지)
1. `src/lib/constants.ts` — COMPONENT_DEFINITIONS + COMPONENT_DATA_SCHEMA
2. `src/components/ReportRenderer/components/{Name}.tsx` — 컴포넌트 구현
3. `src/components/ReportRenderer/components/index.ts` — FALLBACK_REGISTRY에 import + 등록

### DS 매핑 (선택)
4. `src/lib/design-system/ds-adapter.tsx` — DS_COMPONENT_MAP에 상태 추가
   - DS에 대응 컴포넌트 있으면: `status: "mapped"` + DS 래퍼 함수 구현
   - 없으면: `status: "missing"` + note 추가

### 누락 감지
- 개발 모드에서 콘솔에 `[Sync]` 경고가 자동 출력됨
- constants ↔ registry ↔ DS map 3곳의 불일치를 자동 감지

---

## 프롬프트 수정 시

### 에이전트 프롬프트 (파이프라인 동작)
- `.md` 파일만 수정하면 됨
- 7개: strategy-writer.md, chart-specialist.md, data-analyst.md, domain-expert.md, persona-critic.md, pm.md, sample-generator.md
- 모두 Claude Code가 직접 참조 (자동 LLM 호출 없음). domain-expert·persona-critic은 JSON 스키마가 적혀 있어도 마크다운 표로 정리해 활용

### 스킬 프롬프트 (도메인 지식)
- `src/agents/skills/{name}.md` 수정
- 새 에이전트 작업에서 배운 것은 해당 스킬 파일에 축적 (자동)

---

## 디자인 시스템 업데이트 시
```bash
cd src/design-system && git pull origin main
```
- DS 컴포넌트가 추가되면 ds-adapter.tsx에 래퍼 추가
- DS 컴포넌트가 변경되면 자동 반영 (submodule)

---

## 폴더 구조 요약
```
src/agents/
├── *.md (7개)              ← 에이전트 프롬프트 (Claude Code가 직접 참조)
│                              strategy-writer / chart-specialist / data-analyst / pm / sample-generator
│                              domain-expert (§2-5 도메인) / persona-critic (§4-4 독자 검증)
│                            + AGENT_GUIDE.md / CLAUDE_WORKFLOW.md (메타 문서)
├── skills/*.md (34개)       ← 도메인 지식 라이브러리 (필요 시 Read로 직접 참조)
├── orchestrator/skills/    ← 키워드 자동 매칭 인프라 (현재 dormant, 향후 재사용 대비 보존)
└── definitions/*/           ← 생성된 에이전트 (agent.json + sample.json + report-spec.md)

src/lib/
├── design-system/           ← DS 관련 파일 통합
│   ├── ds-adapter.tsx       ← DS↔자체 컴포넌트 어댑터
│   ├── DSClientSwap.tsx     ← 서버→클라이언트 DS 교체
│   ├── nivo-theme.ts        ← Nivo 차트 테마
│   └── chart-spec.ts        ← 차트 색상·스펙
├── constants.ts             ← 컴포넌트 정의 (Single Source)
└── ...

src/components/ReportRenderer/
├── components/*.tsx (19개)   ← 자체 컴포넌트 (built-in)
├── components/index.ts      ← 레지스트리 + 3단계 매칭
├── layouts/*.tsx             ← 레이아웃
└── index.tsx                ← 렌더러 진입점
```
