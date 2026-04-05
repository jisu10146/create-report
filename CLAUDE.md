# CLAUDE.md

## 개발 서버 규칙

### dev 서버 재시작 시
- 반드시 `.next` + `node_modules/.cache` 모두 삭제 후 시작
- 서버 시작 후 preview 페이지 접근하여 CSS 빌드 트리거
- CSS 파일 크기가 40KB 이상인지 확인 (9바이트면 빌드 실패)
- 명령어: `rm -rf .next node_modules/.cache && npx next dev -p 3001`

### 새 에이전트 sample.json 생성 후
- `curl http://localhost:3001/preview/{id}` 로 컴파일 트리거
- CSS 크기 확인: `curl -s http://localhost:3001/_next/static/css/app/layout.css | wc -c`

## 피그마 → 디자인 시스템 동기화 규칙

### 1. 피그마 읽기
- figma-cache/ 에 캐시 있으면 피그마 링크 절대 다시 읽지 말 것
- 새 컴포넌트 추가됐다고 하면 캐시와 비교해서 없는 것만 읽기
- 읽은 즉시 figma-cache/에 저장

### 2. 디자인 시스템 적용
- 캐시 파일 기준으로 토큰 추출
- 추정값 사용 금지, 캐시에 없는 값은 추정 표시 후 나에게 확인
- 하드코딩 금지, 반드시 토큰 변수 참조

### 3. 검토 및 자동 수정
- 적용 후 피그마 캐시값과 실제 코드값을 항목별 비교표로 자동 출력
  | 항목 | 캐시값 | 적용값 | 일치 여부 |
- 불일치 항목은 나에게 확인 요청 없이 캐시값으로 즉시 수정
- 캐시에 없어서 추정한 값만 나에게 따로 확인 요청

### 4. 피그마 재읽기가 필요한 경우
- 내가 명시적으로 "피그마 다시 읽어줘" 라고 할 때만

## 리포트 레이아웃 규칙

### 1. 좌측 정렬
- 모든 섹션의 좌측 시작점은 동일해야 함
- 섹션 타이틀은 카드/컨테이너 바깥에 위치 (padding으로 인한 들여쓰기 금지)
- Executive Summary 타이틀도 bg-report-bg 컨테이너 바깥에 배치

### 2. 섹션 타이틀 스타일
- 모든 섹션 타이틀은 동일한 스타일: `report-section-title` 클래스 사용
- 스펙: 20px / font-weight 700 / line-height 28px / color: report-text-primary
- globals.css에 정의됨, 개별 컴포넌트에서 타이틀 스타일을 직접 지정하지 말 것

### 3. 섹션 컨테이너 너비
- 모든 섹션은 `bg-report-bg rounded-container p-[24px]` 컨테이너로 감쌈 (Executive Summary와 동일)
- ExecutiveSummary는 자체 컨테이너를 가지므로 레이아웃에서 이중 래핑하지 않음
- 이 래핑은 레이아웃 컴포넌트(SingleSectionLayout, SingleRepeatLayout)에서 처리
- 개별 컴포넌트에서 고정 width를 지정하지 말 것 (모달 제외)

### 4. DonutChart 레이아웃
- DonutChart가 있으면 다음 섹션과 2열 그리드로 묶어서 우측 공백 제거
- SingleSectionLayout에서 자동 처리됨
- 구성안 설계 시 DonutChart 바로 다음에 관련 컴포넌트를 배치할 것

### 5. DataTable
- 배경: bg-report-card + rounded-card
- 헤더: bg-report-bg 배경
- showDots: false(기본) — 일반 표 형식일 때 dot 없음
- showDots: true — 클러스터 비교 등 색상 구분이 필요할 때만 dot 표시

### 6. 그리드 카드 컴포넌트
- InsightCard, MetricHighlight는 `items` 배열을 받으면 가로 3열 그리드로 렌더링
- 단일 객체를 받으면 기존처럼 1열 렌더링 (하위 호환)
- 데이터 형식: `{ items: [...] }` 또는 단일 객체
