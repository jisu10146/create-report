/**
 * Domain Expert Skills — 도메인별 벤치마크/용어/프레임 제공
 *
 * 스킬 구조:
 *   - 도메인 전용 스킬: customer-support, marketing-attribution 등
 *   - 공통 스킬: nps-csat, agent-performance, operational-metrics
 *   - 1 에이전트 → N 스킬 매칭 (키워드 매칭되는 모든 스킬 선택)
 *
 * 새 스킬 추가 시:
 *   1. src/agents/skills/{name}.md 파일 생성
 *   2. 아래 SKILL_FILES 배열에 파일명 추가
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export interface SkillOutput {
  name: string;
  data: {
    benchmarks: Array<{ metric: string; value: string; source: string }>;
    terminology: Record<string, string>;
    commonDecisions: string[];
  };
}

interface SkillDefinition {
  name: string;
  keywords: string[];
  data: SkillOutput["data"];
}

const SKILLS_DIR = join(process.cwd(), "src/agents/skills");

/**
 * 스킬 파일 자동 스캔 — .md 파일만 추가하면 자동 감지됨.
 * 수동 등록 불필요.
 */
const SKILL_FILES = readdirSync(SKILLS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(".md", ""));

/** .md 테이블에서 행 데이터 추출 */
function parseTable(md: string, sectionName: string): string[][] {
  const sectionMatch = md.split(`## ${sectionName}`)[1];
  if (!sectionMatch) return [];

  const lines = sectionMatch.split("\n");
  const rows: string[][] = [];
  let started = false;

  for (const line of lines) {
    if (line.startsWith("## ") && started) break;
    if (line.includes("| --- ") || line.includes("|---")) { started = true; continue; }
    if (line.startsWith("|") && started) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) rows.push(cells);
    }
  }
  return rows;
}

/** .md에서 리스트 항목 추출 */
function parseList(md: string, sectionName: string): string[] {
  const sectionMatch = md.split(`## ${sectionName}`)[1];
  if (!sectionMatch) return [];

  const lines = sectionMatch.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) break;
    const match = line.match(/^- (.+)/);
    if (match) items.push(match[1].trim());
  }
  return items;
}

/** .md 파일 하나를 파싱하여 SkillDefinition으로 변환 */
function parseSkillMd(fileName: string): SkillDefinition {
  const md = readFileSync(join(SKILLS_DIR, `${fileName}.md`), "utf-8");

  const kwLine = md.split("\n").find((l) => l.startsWith("keywords:"));
  const keywords = kwLine
    ? kwLine.replace("keywords:", "").split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const benchmarkRows = parseTable(md, "Benchmarks");
  const benchmarks = benchmarkRows.map((r) => ({
    metric: r[0],
    value: r[1],
    source: r[2] ?? "",
  }));

  const termRows = parseTable(md, "Terminology");
  const terminology: Record<string, string> = {};
  for (const r of termRows) {
    terminology[r[0]] = r[1];
  }

  const commonDecisions = parseList(md, "Common Decisions");

  return {
    name: fileName,
    keywords,
    data: { benchmarks, terminology, commonDecisions },
  };
}

const SKILLS: SkillDefinition[] = SKILL_FILES.map(parseSkillMd);

/** (하위 호환) 단일 스킬 선택 — 기존 코드에서 사용 */
export function selectSkill(description: string): SkillOutput | null {
  const selected = selectSkills(description);
  return selected.length > 0 ? selected[0] : null;
}

/**
 * 복수 스킬 선택 — 키워드 매칭되는 모든 스킬을 점수 순으로 반환
 * 최소 1개 키워드 매칭 시 선택됨
 */
export function selectSkills(description: string): SkillOutput[] {
  const lower = description.toLowerCase();

  const scored = SKILLS
    .map((skill) => ({
      skill,
      score: skill.keywords.filter((kw) => lower.includes(kw.toLowerCase())).length,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => ({
    name: s.skill.name,
    data: s.skill.data,
  }));
}

/**
 * 복수 스킬의 데이터를 병합 — benchmarks, terminology, commonDecisions를 합침
 * 중복 제거 (같은 metric/term은 먼저 매칭된 스킬 우선)
 */
export function mergeSkills(skills: SkillOutput[]): SkillOutput["data"] {
  const benchmarks: Array<{ metric: string; value: string; source: string }> = [];
  const terminology: Record<string, string> = {};
  const commonDecisions: string[] = [];
  const seenMetrics = new Set<string>();
  const seenDecisions = new Set<string>();

  for (const skill of skills) {
    for (const b of skill.data.benchmarks) {
      if (!seenMetrics.has(b.metric)) {
        seenMetrics.add(b.metric);
        benchmarks.push(b);
      }
    }
    for (const [term, def] of Object.entries(skill.data.terminology)) {
      if (!terminology[term]) {
        terminology[term] = def;
      }
    }
    for (const d of skill.data.commonDecisions) {
      if (!seenDecisions.has(d)) {
        seenDecisions.add(d);
        commonDecisions.push(d);
      }
    }
  }

  return { benchmarks, terminology, commonDecisions };
}
