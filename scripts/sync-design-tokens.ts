/**
 * sync-design-tokens.ts
 *
 * 피그마 → 코드 디자인 토큰 동기화 스크립트
 *
 * 사용법: npx tsx scripts/sync-design-tokens.ts
 *
 * 1단계: 피그마에서 Design System 섹션 읽기
 * 2단계: 현재 코드 값과 비교 → diff-report.json
 * 3단계: 불일치 항목 자동 수정
 * 4단계: 수정 완료 리포트
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, "figma-cache");
const GLOBALS_CSS = path.join(ROOT, "src/app/globals.css");
const NIVO_THEME = path.join(ROOT, "src/lib/report-nivo-theme.ts");

/* ─── Figma API ─── */

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
  throw new Error("FIGMA_TOKEN 환경변수가 설정되지 않았습니다. .env.local에 FIGMA_TOKEN=figd_... 을 추가하세요.");
}
const FILE_KEY = "6dSocJnKykujp639jA8G6t";
const DS_NODE_ID = "1:10225";

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
  strokes?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
  };
  characters?: string;
  cornerRadius?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  absoluteBoundingBox?: { width: number; height: number };
}

function rgbaToHex(c: { r: number; g: number; b: number; a?: number }): string {
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/* ─── 1단계: 피그마에서 읽기 ─── */

interface ExtractedTokens {
  colors: Array<{ path: string; type: string; hex: string; alpha: number }>;
  spacing: Array<{ path: string; [key: string]: number | string }>;
  typography: Array<{
    path: string;
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeightPx: number;
    color?: string;
  }>;
  radii: Array<{ path: string; value: number }>;
  badges: Array<{ path: string; bg?: string; text?: string; radius?: number; padding?: string }>;
}

function extractTokens(node: FigmaNode, parentPath = ""): ExtractedTokens {
  const result: ExtractedTokens = { colors: [], spacing: [], typography: [], radii: [], badges: [] };
  const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;

  // Colors
  for (const fill of node.fills ?? []) {
    if (fill.type === "SOLID" && fill.color) {
      result.colors.push({
        path: currentPath,
        type: "fill",
        hex: rgbaToHex(fill.color),
        alpha: Math.round((fill.color.a ?? 1) * 100) / 100,
      });
    }
  }
  for (const stroke of node.strokes ?? []) {
    if (stroke.type === "SOLID" && stroke.color) {
      result.colors.push({
        path: currentPath,
        type: "stroke",
        hex: rgbaToHex(stroke.color),
        alpha: 1,
      });
    }
  }

  // Spacing
  const spacingKeys = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "itemSpacing"] as const;
  const spacingData: { path: string; [key: string]: number | string } = { path: currentPath };
  let hasSpacing = false;
  for (const k of spacingKeys) {
    if (node[k] !== undefined) {
      spacingData[k] = node[k]!;
      hasSpacing = true;
    }
  }
  if (node.absoluteBoundingBox) {
    spacingData.width = Math.round(node.absoluteBoundingBox.width);
    spacingData.height = Math.round(node.absoluteBoundingBox.height);
    hasSpacing = true;
  }
  if (hasSpacing) result.spacing.push(spacingData);

  // Radius
  if (node.cornerRadius !== undefined) {
    result.radii.push({ path: currentPath, value: node.cornerRadius });
  }

  // Typography
  if (node.style?.fontFamily) {
    const typo: ExtractedTokens["typography"][number] = {
      path: currentPath,
      text: (node.characters ?? "").slice(0, 60),
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize ?? 0,
      fontWeight: node.style.fontWeight ?? 400,
      lineHeightPx: Math.round((node.style.lineHeightPx ?? 0) * 10) / 10,
    };
    // Get text color from first fill
    const textFill = (node.fills ?? []).find((f) => f.type === "SOLID" && f.color);
    if (textFill?.color) typo.color = rgbaToHex(textFill.color);
    result.typography.push(typo);
  }

  // Badge detection
  if (node.name.toLowerCase().includes("badge") && node.cornerRadius) {
    const badge: ExtractedTokens["badges"][number] = {
      path: currentPath,
      radius: node.cornerRadius,
    };
    if (node.paddingLeft !== undefined) {
      badge.padding = `${node.paddingTop ?? 0}/${node.paddingRight ?? node.paddingLeft}/${node.paddingBottom ?? 0}/${node.paddingLeft}`;
    }
    const bgFill = (node.fills ?? []).find((f) => f.type === "SOLID" && f.color);
    if (bgFill?.color) badge.bg = rgbaToHex(bgFill.color);
    result.badges.push(badge);
  }

  // Recurse
  for (const child of node.children ?? []) {
    const childResult = extractTokens(child, currentPath);
    result.colors.push(...childResult.colors);
    result.spacing.push(...childResult.spacing);
    result.typography.push(...childResult.typography);
    result.radii.push(...childResult.radii);
    result.badges.push(...childResult.badges);
  }

  return result;
}

async function fetchFromFigma(): Promise<ExtractedTokens> {
  const cacheFile = path.join(CACHE_DIR, "latest.json");

  // Check cache first
  if (fs.existsSync(cacheFile)) {
    const stat = fs.statSync(cacheFile);
    const ageMinutes = (Date.now() - stat.mtimeMs) / 60000;
    if (ageMinutes < 30) {
      console.log(`  ♻ 캐시 사용 (${Math.round(ageMinutes)}분 전)`);
      return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    }
  }

  console.log("  ↓ 피그마 API 호출 중...");
  const url = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${DS_NODE_ID}&depth=8`;
  const res = await fetch(url, {
    headers: { "X-Figma-Token": FIGMA_TOKEN ?? "" },
  });

  if (!res.ok) {
    const body = await res.json();
    if (body.status === 429) {
      console.error("  ✗ Rate limited. 캐시 파일이 있으면 사용합니다.");
      if (fs.existsSync(cacheFile)) {
        return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
      }
      throw new Error("Rate limited and no cache available");
    }
    throw new Error(`Figma API error: ${JSON.stringify(body)}`);
  }

  const data = await res.json();
  const doc = data.nodes[DS_NODE_ID].document as FigmaNode;
  const tokens = extractTokens(doc);

  // Save cache
  fs.writeFileSync(cacheFile, JSON.stringify(tokens, null, 2), "utf-8");
  console.log(`  ✓ 저장: figma-cache/latest.json`);

  return tokens;
}

/* ─── 2단계: 현재 코드 값 추출 & 비교 ─── */

interface Mismatch {
  항목: string;
  피그마: string;
  현재코드: string;
  파일: string;
  라인: number;
}

function extractCurrentTokens(): Map<string, { value: string; file: string; line: number }> {
  const tokens = new Map<string, { value: string; file: string; line: number }>();

  // globals.css의 @theme 블록 파싱
  const css = fs.readFileSync(GLOBALS_CSS, "utf-8");
  const lines = css.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*(--.+?):\s*(.+?);/);
    if (match) {
      tokens.set(match[1], { value: match[2].trim(), file: "src/app/globals.css", line: i + 1 });
    }
  }

  // report-nivo-theme.ts의 TOKEN 객체 파싱
  const nivo = fs.readFileSync(NIVO_THEME, "utf-8");
  const nivoLines = nivo.split("\n");
  for (let i = 0; i < nivoLines.length; i++) {
    const match = nivoLines[i].match(/(\w+):\s*"(#[0-9a-fA-F]{6})"/);
    if (match) {
      tokens.set(`nivo.${match[1]}`, { value: match[2], file: "src/lib/report-nivo-theme.ts", line: i + 1 });
    }
  }

  return tokens;
}

function buildFigmaColorMap(tokens: ExtractedTokens): Map<string, string> {
  const map = new Map<string, string>();

  // Deduplicate colors — use most common usage
  const colorUsage: Record<string, { hex: string; count: number; paths: string[] }> = {};
  for (const c of tokens.colors) {
    if (!colorUsage[c.hex]) colorUsage[c.hex] = { hex: c.hex, count: 0, paths: [] };
    colorUsage[c.hex].count++;
    colorUsage[c.hex].paths.push(c.path);
  }

  // Map figma hex → semantic name based on known tokens
  const knownMappings: Record<string, string> = {
    "--color-report-bg": "", // will be set from figma
    "--color-report-card": "",
    "--color-report-border": "",
    "--color-report-text-primary": "",
    "--color-report-text-secondary": "",
    "--color-report-text-muted": "",
    "--color-chart-blue": "",
    "--color-chart-blue-light": "",
    "--color-chart-green": "",
  };

  // Assign based on figma paths
  for (const c of tokens.colors) {
    const p = c.path.toLowerCase();
    if (c.type === "stroke" && c.hex.match(/#e6e7/i)) map.set("--color-report-border", c.hex);
    if (c.type === "fill" && c.hex.match(/#f7f7f8|#fbfbfb/i) && p.includes("header")) map.set("--color-report-bg", c.hex);
    if (c.type === "fill" && c.hex === "#ffffff") map.set("--color-report-card", c.hex);
    if (c.type === "fill" && c.hex.match(/#17171/i) && p.includes("text")) map.set("--color-report-text-primary", c.hex);
    if (c.type === "fill" && c.hex.match(/#7b7e8/i)) map.set("--color-report-text-secondary", c.hex);
    if (c.type === "fill" && c.hex.match(/#caccc/i)) map.set("--color-report-text-muted", c.hex);
    if (c.type === "fill" && c.hex.match(/#2b7ff/i)) map.set("--color-chart-blue", c.hex);
    if (c.type === "fill" && c.hex.match(/#7ccf0/i)) map.set("--color-chart-green", c.hex);
    if (c.type === "fill" && c.hex.match(/#bedbf/i)) map.set("--color-chart-blue-light", c.hex);
  }

  return map;
}

function compareTokens(
  figmaTokens: ExtractedTokens,
  currentTokens: Map<string, { value: string; file: string; line: number }>
): Mismatch[] {
  const mismatches: Mismatch[] = [];
  const figmaColors = buildFigmaColorMap(figmaTokens);

  // Compare colors
  for (const [tokenName, figmaHex] of figmaColors) {
    const current = currentTokens.get(tokenName);
    if (!current) continue;
    if (figmaHex && current.value.toLowerCase() !== figmaHex.toLowerCase()) {
      mismatches.push({
        항목: tokenName,
        피그마: figmaHex,
        현재코드: current.value,
        파일: current.file,
        라인: current.line,
      });
    }
  }

  // Compare radii
  const uniqueRadii = [...new Set(figmaTokens.radii.map((r) => r.value))].sort((a, b) => a - b);
  const radiusMap: Record<string, string> = {};
  if (uniqueRadii.length >= 1) radiusMap["--radius-chip"] = `${uniqueRadii[0]}px`;
  if (uniqueRadii.length >= 2) radiusMap["--radius-sm"] = `${uniqueRadii[1]}px`;
  if (uniqueRadii.length >= 3) radiusMap["--radius-card"] = `${uniqueRadii[2]}px`;
  if (uniqueRadii.length >= 4) radiusMap["--radius-container"] = `${uniqueRadii[3]}px`;

  for (const [tokenName, figmaVal] of Object.entries(radiusMap)) {
    const current = currentTokens.get(tokenName);
    if (current && current.value !== figmaVal) {
      mismatches.push({
        항목: tokenName,
        피그마: figmaVal,
        현재코드: current.value,
        파일: current.file,
        라인: current.line,
      });
    }
  }

  // Compare typography
  const typoSizes = [...new Set(figmaTokens.typography.map((t) => t.fontSize))].sort((a, b) => a - b);
  const typoMap: Record<string, string> = {};
  for (const t of figmaTokens.typography) {
    if (t.fontSize === 14) typoMap["--font-size-body-s"] = "14px";
    if (t.fontSize === 16) typoMap["--font-size-body-m"] = "16px";
    if (t.fontSize === 18) typoMap["--font-size-heading-m"] = "18px";
    if (t.fontSize === 20) typoMap["--font-size-heading-l"] = "20px";
  }

  for (const [tokenName, figmaVal] of Object.entries(typoMap)) {
    const current = currentTokens.get(tokenName);
    if (current && current.value !== figmaVal) {
      mismatches.push({
        항목: tokenName,
        피그마: figmaVal,
        현재코드: current.value,
        파일: current.file,
        라인: current.line,
      });
    }
  }

  // Compare nivo theme tokens
  const nivoColorMap: Record<string, string> = {};
  for (const c of figmaTokens.colors) {
    if (c.hex.match(/#17171/i)) nivoColorMap["nivo.textPrimary"] = c.hex;
    if (c.hex.match(/#7b7e8/i)) nivoColorMap["nivo.textSecondary"] = c.hex;
    if (c.hex.match(/#e6e7e/i) && c.type === "stroke") nivoColorMap["nivo.border"] = c.hex;
  }

  for (const [tokenName, figmaHex] of Object.entries(nivoColorMap)) {
    const current = currentTokens.get(tokenName);
    if (current && current.value.toLowerCase() !== figmaHex.toLowerCase()) {
      mismatches.push({
        항목: tokenName,
        피그마: figmaHex,
        현재코드: current.value,
        파일: current.file,
        라인: current.line,
      });
    }
  }

  return mismatches;
}

/* ─── 3단계: 자동 수정 ─── */

function applyFixes(mismatches: Mismatch[]): string[] {
  const changes: string[] = [];
  const fileEdits = new Map<string, string>();

  for (const m of mismatches) {
    const filePath = path.join(ROOT, m.파일);
    if (!fileEdits.has(filePath)) {
      fileEdits.set(filePath, fs.readFileSync(filePath, "utf-8"));
    }

    let content = fileEdits.get(filePath)!;
    const lines = content.split("\n");
    const lineIdx = m.라인 - 1;

    if (lineIdx >= 0 && lineIdx < lines.length) {
      const oldLine = lines[lineIdx];
      const newLine = oldLine.replace(m.현재코드, m.피그마);

      if (oldLine !== newLine) {
        lines[lineIdx] = newLine;
        fileEdits.set(filePath, lines.join("\n"));
        changes.push(`✓ ${m.항목}: ${m.현재코드} → ${m.피그마} (${m.파일}:${m.라인})`);
      }
    }
  }

  // Write all modified files
  for (const [filePath, content] of fileEdits) {
    fs.writeFileSync(filePath, content, "utf-8");
  }

  return changes;
}

/* ─── Main ─── */

async function main() {
  console.log("\n=== 디자인 토큰 동기화 ===\n");

  // 1단계
  console.log("1단계 — 피그마에서 읽기");
  const figmaTokens = await fetchFromFigma();
  console.log(`  색상: ${figmaTokens.colors.length}개`);
  console.log(`  간격: ${figmaTokens.spacing.length}개`);
  console.log(`  타이포: ${figmaTokens.typography.length}개`);
  console.log(`  라운드: ${figmaTokens.radii.length}개`);
  console.log(`  배지: ${figmaTokens.badges.length}개`);

  // 2단계
  console.log("\n2단계 — 현재 코드 값과 비교");
  const currentTokens = extractCurrentTokens();
  console.log(`  코드 토큰: ${currentTokens.size}개`);

  const mismatches = compareTokens(figmaTokens, currentTokens);

  const diffReport = {
    timestamp: new Date().toISOString(),
    figmaFile: FILE_KEY,
    figmaNode: DS_NODE_ID,
    totalMismatches: mismatches.length,
    mismatches,
  };

  fs.writeFileSync(
    path.join(ROOT, "diff-report.json"),
    JSON.stringify(diffReport, null, 2),
    "utf-8"
  );
  console.log(`  불일치: ${mismatches.length}개 → diff-report.json 저장`);

  if (mismatches.length === 0) {
    console.log("\n✅ 모든 토큰이 피그마와 일치합니다.");
    return;
  }

  // 불일치 목록 출력
  console.log("\n  불일치 항목:");
  for (const m of mismatches) {
    console.log(`    ${m.항목}: ${m.현재코드} → ${m.피그마} (${m.파일}:${m.라인})`);
  }

  // 3단계
  console.log("\n3단계 — 자동 수정");
  const changes = applyFixes(mismatches);

  if (changes.length === 0) {
    console.log("  수정할 항목 없음 (라인 매칭 실패)");
  }

  // 4단계
  console.log("\n4단계 — 수정 완료 리포트");
  console.log("─".repeat(50));
  for (const c of changes) {
    console.log(`  ${c}`);
  }
  console.log("─".repeat(50));
  console.log(`\n총 ${changes.length}개 항목 수정 완료.`);

  // 애매한 항목 리포트
  const uncertain = mismatches.filter((m) => {
    // hex가 비슷하지만 정확히 같지 않은 경우
    const diff = Math.abs(parseInt(m.피그마.slice(1), 16) - parseInt(m.현재코드.slice(1), 16));
    return diff > 0 && diff < 0x101010;
  });

  if (uncertain.length > 0) {
    console.log("\n⚠ 확인 필요 항목:");
    for (const u of uncertain) {
      console.log(`  ${u.항목}: 피그마 ${u.피그마} vs 코드 ${u.현재코드} — 미세 차이, 확인 필요`);
    }
  }
}

main().catch(console.error);
