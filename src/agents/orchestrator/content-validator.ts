/**
 * Content Validator — Sample Generator 출력의 콘텐츠 룰 검증
 *
 * 이 파일의 모든 규칙은 sample-generator.md의 서술 규칙을 코드 휴리스틱으로 구현한 것이다.
 * 규칙 추가/수정 시 sample-generator.md를 먼저 업데이트하고, 이 파일의 코드를 맞춘다.
 *
 * 규칙 출처 매핑:
 *   headline-lead-with-message       → sample-generator.md §0-4
 *   executive-summary-meta           → sample-generator.md §0-3
 *   executive-summary-keyfindings    → sample-generator.md §0-3
 *   clustercard-title-is-name        → sample-generator.md §0-2
 *   clustercard-title-length         → sample-generator.md §0-2 (~15자)
 *   insightcard-title-noun-phrase    → sample-generator.md §0-1
 *   insightcard-title-length         → sample-generator.md §0-1 (~20자)
 *   insightcard-title-no-verbatim    → sample-generator.md §0-1
 *   insightcard-interpretation-overlap    → sample-generator.md §0-1
 *   insightcard-interpretation-causal-chain → sample-generator.md §0-1
 *
 * LLM 호출 없음. 위반 발견 시 ContentValidationIssue 배열을 반환 → orchestrator가 부분 재생성 트리거.
 */

import type { AgentBlueprint } from "./types";

export interface ContentValidationIssue {
  sectionId: string;
  componentType: string;
  field: string;     // "title" | "description" | "label" | "interpretation" 등
  rule: string;      // 위반 룰 이름
  message: string;   // 사람 읽을 메시지
  fix: string;       // 재생성 시 LLM에 전달할 수정 지시
}

// ─── 헬퍼 ─────────────────────────────────────────────────────

/** 동사 종결("~합니다", "~됩니다", "~입니다", "~있습니다") 감지 */
function endsWithVerb(text: string): boolean {
  if (!text) return false;
  return /(합니다|됩니다|입니다|있습니다|없습니다|시킵니다|시킵니다|드립니다|니다)\.?\s*$/.test(text.trim());
}

/** 라벨이 두괄식인지 휴리스틱 — "—" 기준 좌측이 메시지(인사이트), 우측이 근거(수치) */
function isHeadlineLeadWithMessage(label: string): boolean {
  if (!label) return true;
  // "—" 또는 ":" 기준 좌우 분리
  const sep = label.match(/[—:]/);
  if (!sep) return true; // 구분자 없으면 검증 어려움 → 통과 처리
  const idx = label.indexOf(sep[0]);
  const left = label.slice(0, idx).trim();
  // 좌측이 숫자/통계 키워드로 시작하면 의심
  // 예: "평균 3.89점", "총 500건", "82%가"
  const numericPattern = /^(평균|총|최대|최소|약|\d+)/;
  return !numericPattern.test(left);
}

/** title의 핵심 명사가 interpretation에 그대로 등장하는지 (단순 문자열 포함) */
function hasOverlap(title: string, interpretation: string): boolean {
  if (!title || !interpretation) return false;
  // title에서 의미 있는 명사 추출 (3자 이상 단어)
  const titleWords = title.split(/[\s·,]/).filter((w) => w.length >= 3);
  if (titleWords.length === 0) return false;
  // 핵심 단어 1-2개가 interpretation에도 등장하면 겹침
  const overlapping = titleWords.filter((w) => interpretation.includes(w));
  return overlapping.length >= 2;
}

/** ES description이 메타 설명인지 (수치 우선이면 인사이트 의심) */
function isMetaDescription(text: string): boolean {
  if (!text) return true;
  const trimmed = text.trim();
  // "총 N건의/N건을 분석한" 류 메타 표현 시작이면 OK
  if (/(분석한|리포트입니다|진단합니다|결과입니다|기반으로)/.test(trimmed.slice(0, 80))) return true;
  // 수치/지표 우선이면 인사이트일 가능성 ("평균 X점은 ...")
  if (/^(평균|총|약|\d+)/.test(trimmed)) return false;
  return true;
}

// ─── 검증 함수 ─────────────────────────────────────────────────

interface SampleSection {
  id: string;
  componentType?: string;
  data: unknown;
  label?: string;
}

interface SampleReport {
  sections?: SampleSection[];
  executiveSummary?: { description?: string; keyFindings?: string[] };
}

/**
 * Sample Generator 출력 검증.
 * blueprint와 sample을 교차 참조해 섹션별 룰을 확인.
 */
export function validateContent(
  blueprint: AgentBlueprint,
  sample: unknown
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const report = sample as SampleReport;
  const sections = report.sections ?? [];

  // ── 1. 섹션 라벨 (블루프린트 기준) ──
  for (const bs of blueprint.reportSections) {
    if (bs.id === "executive-summary") continue;
    if (!isHeadlineLeadWithMessage(bs.label)) {
      issues.push({
        sectionId: bs.id,
        componentType: bs.componentType,
        field: "label",
        rule: "headline-lead-with-message",
        message: `섹션 라벨이 수치/통계로 시작 — 두괄식 인사이트가 먼저 와야 함: "${bs.label}"`,
        fix: "라벨의 '—' 좌측을 인사이트(메시지)로 바꾸고, 수치는 우측으로 이동",
      });
    }
  }

  // ── 2. 섹션별 콘텐츠 검증 ──
  for (const s of sections) {
    const blueprintSection = blueprint.reportSections.find((bs) => bs.id === s.id);
    const componentType = blueprintSection?.componentType ?? s.componentType ?? "";
    const data = s.data as Record<string, unknown> | undefined;
    if (!data) continue;

    // ── 2-a. ExecutiveSummary description = 메타 설명 ──
    if (s.id === "executive-summary" && componentType === "ExecutiveSummary") {
      const desc = String((data as { description?: string }).description ?? "");
      if (desc && !isMetaDescription(desc)) {
        issues.push({
          sectionId: s.id,
          componentType,
          field: "description",
          rule: "executive-summary-meta",
          message: `ES.description이 인사이트로 시작 — 리포트 메타 설명(어떤 데이터를 분석한 어떤 리포트인지)이어야 함: "${desc.slice(0, 60)}..."`,
          fix: "수치/인사이트로 시작하지 말고 '{기간}, {데이터셋} {N건}을 분석한 {리포트 종류}입니다. {축}으로 진단...' 형식으로 재작성",
        });
      }
    }

    // ── 2-b. ClusterCard items: title은 군집 이름 (동사 종결 금지) ──
    if (componentType === "ClusterCard") {
      const items = (data as { items?: Array<Record<string, unknown>> }).items ?? [];
      items.forEach((item, i) => {
        const title = String(item.title ?? "");
        if (endsWithVerb(title)) {
          issues.push({
            sectionId: s.id,
            componentType,
            field: `items[${i}].title`,
            rule: "clustercard-title-is-name",
            message: `ClusterCard.title이 동사로 끝남 — 군집 이름(명사구)이어야 함: "${title}"`,
            fix: "군집/페르소나 이름(예: '구체적 불만 기술자', 'Detractor', '에스컬레이션 그룹')으로 변경. 인사이트 메시지는 섹션 label로 이동",
          });
        }
        if (title.length > 25) {
          issues.push({
            sectionId: s.id,
            componentType,
            field: `items[${i}].title`,
            rule: "clustercard-title-length",
            message: `ClusterCard.title이 너무 김(${title.length}자) — 군집 이름은 ~15자 권장: "${title}"`,
            fix: "짧은 명사구(군집 이름)로 압축",
          });
        }
      });
    }

    // ── 2-c. InsightCard items: title은 명사구, interpretation은 인과 체인 ──
    if (componentType === "InsightCard") {
      const items = (data as { items?: Array<Record<string, unknown>> }).items ?? [];
      items.forEach((item, i) => {
        const title = String(item.title ?? "");
        const description = String(item.description ?? "");
        const interpretation = String(item.interpretation ?? "");

        // title 동사 종결 금지
        if (endsWithVerb(title)) {
          issues.push({
            sectionId: s.id,
            componentType,
            field: `items[${i}].title`,
            rule: "insightcard-title-noun-phrase",
            message: `InsightCard.title이 동사로 끝남 — 명사구 헤드라인이어야 함: "${title}"`,
            fix: "동사 종결 제거. 예: '~훼손합니다' → '~훼손', '~인식되고 있습니다' → '~인식'",
          });
        }
        // title 길이
        if (title.length > 30) {
          issues.push({
            sectionId: s.id,
            componentType,
            field: `items[${i}].title`,
            rule: "insightcard-title-length",
            message: `InsightCard.title이 너무 김(${title.length}자) — ~20자 권장: "${title}"`,
            fix: "핵심만 남기고 압축",
          });
        }
        // title에 고객 원문(따옴표) 금지
        if (/["'"'""]/.test(title)) {
          issues.push({
            sectionId: s.id,
            componentType,
            field: `items[${i}].title`,
            rule: "insightcard-title-no-verbatim",
            message: `InsightCard.title에 인용 따옴표 — 원문 인용은 description으로 이동: "${title}"`,
            fix: "따옴표 안 내용을 description으로 옮기고, title은 인사이트 요약 명사구로",
          });
        }
        // title-description-interpretation 겹침
        if (interpretation && hasOverlap(title, interpretation)) {
          issues.push({
            sectionId: s.id,
            componentType,
            field: `items[${i}].interpretation`,
            rule: "insightcard-interpretation-overlap",
            message: `interpretation이 title의 핵심 메시지를 재진술 — 한 단계 더 깊은 인과 체인으로 가야 함`,
            fix: "interpretation을 '원인: X → 결과: Y → 영향: Z' 형식의 인과 체인으로 재작성. title/description의 사실을 반복하지 말고, 그 사실의 구조적 원인 + 2차 비즈니스 영향 명시",
          });
        }
        // interpretation에 인과 키워드가 있는지 (없으면 단순 요약일 확률 높음)
        if (interpretation && !/원인|결과|영향|시사점|→/.test(interpretation)) {
          issues.push({
            sectionId: s.id,
            componentType,
            field: `items[${i}].interpretation`,
            rule: "insightcard-interpretation-causal-chain",
            message: `interpretation에 인과 체인 마커(원인/결과/영향/→)가 없음 — 단순 요약 의심: "${interpretation.slice(0, 50)}..."`,
            fix: "'원인: X → 결과: Y → 영향: Z' 또는 '시사점: ...' 형식으로 인과 관계를 명시",
          });
        }
      });
    }

    // ── 2-d. ExecutiveSummary keyFindings: 두괄식 ──
    if (componentType === "ExecutiveSummary") {
      const keyFindings = ((data as { keyFindings?: string[] }).keyFindings ?? []) as string[];
      keyFindings.forEach((kf, i) => {
        const trimmed = kf.trim();
        // 첫 문장이 수치로 시작하고 "이지만/이고/입니다만"으로 이어지면 미괄식 의심
        if (/^(평균|총|약|\d+)/.test(trimmed) && /(이지만|이고|이며|이므로)/.test(trimmed.slice(0, 50))) {
          issues.push({
            sectionId: s.id,
            componentType,
            field: `keyFindings[${i}]`,
            rule: "executive-summary-keyfindings-headfirst",
            message: `keyFindings[${i}] 첫 문장이 수치로 시작 + 접속어 — 두괄식이 아닐 가능성: "${trimmed.slice(0, 60)}..."`,
            fix: "결론(인사이트)을 첫 문장으로, 수치는 뒷문장 또는 괄호로 이동",
          });
        }
      });
    }
  }

  return issues;
}

/** 검증 결과를 사람이 읽을 형식으로 요약 (콘솔 출력용) */
export function formatValidationSummary(issues: ContentValidationIssue[]): string {
  if (issues.length === 0) return "✓ 콘텐츠 검증 통과";
  const lines = [`✗ 콘텐츠 검증 위반 ${issues.length}건:`];
  for (const i of issues) {
    lines.push(`  [${i.sectionId} / ${i.field}] ${i.rule}`);
    lines.push(`    → ${i.message}`);
  }
  return lines.join("\n");
}
