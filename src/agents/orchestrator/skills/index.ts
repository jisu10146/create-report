/**
 * Domain Expert Skills — 도메인별 벤치마크/용어/프레임 제공
 *
 * 새 도메인 추가 시:
 *   1. src/agents/skills/{name}.md 파일 생성
 *   2. 아래 SKILL_FILES 배열에 파일명 추가
 *
 * .md 형식:
 *   - 첫 줄: # 제목
 *   - keywords: 쉼표 구분 키워드
 *   - ## Benchmarks 테이블
 *   - ## Terminology 테이블
 *   - ## Common Decisions 리스트
 */

import { readFileSync } from "fs";
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

const SKILL_FILES = [
  "saas-metrics",
  "financial-analysis",
  "marketing-funnel",
  "ecommerce-analytics",
];

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

  // keywords
  const kwLine = md.split("\n").find((l) => l.startsWith("keywords:"));
  const keywords = kwLine
    ? kwLine.replace("keywords:", "").split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  // benchmarks
  const benchmarkRows = parseTable(md, "Benchmarks");
  const benchmarks = benchmarkRows.map((r) => ({
    metric: r[0],
    value: r[1],
    source: r[2] ?? "",
  }));

  // terminology
  const termRows = parseTable(md, "Terminology");
  const terminology: Record<string, string> = {};
  for (const r of termRows) {
    terminology[r[0]] = r[1];
  }

  // common decisions
  const commonDecisions = parseList(md, "Common Decisions");

  return {
    name: fileName,
    keywords,
    data: { benchmarks, terminology, commonDecisions },
  };
}

const SKILLS: SkillDefinition[] = SKILL_FILES.map(parseSkillMd);

/** 에이전트 설명에서 가장 적합한 스킬을 선택 (없으면 null) */
export function selectSkill(description: string): SkillOutput | null {
  const lower = description.toLowerCase();

  let bestMatch: SkillDefinition | null = null;
  let bestScore = 0;

  for (const skill of SKILLS) {
    const score = skill.keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = skill;
    }
  }

  if (!bestMatch || bestScore === 0) return null;

  return {
    name: bestMatch.name,
    data: bestMatch.data,
  };
}
