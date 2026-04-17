/**
 * 리뷰 분석 파이프라인 직접 실행 스크립트
 * Usage: npx tsx scripts/run-review-pipeline.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Load env manually
import { readFileSync } from "fs";
const envContent = readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

async function main() {
  // Dynamic import to resolve path aliases
  const { loadAgentDefinition } = await import("../src/lib/reportNormalizer");
  const { runReportPipeline } = await import("../src/agents/runner/pipeline");
  const { getTotalTokens, resetTokenLog } = await import("../src/lib/claude");

  const inputPath = join(process.cwd(), "coupang_preprocessed.json");
  const input = readFileSync(inputPath, "utf-8");

  console.log(`[start] Input: ${input.length} chars`);
  console.log("[start] Loading agent: review-analysis");

  const agent = await loadAgentDefinition("review-analysis");

  console.log("[start] Running pipeline...");
  resetTokenLog();

  const report = await runReportPipeline(agent, input);
  const tokens = getTotalTokens();

  console.log(`[done] Sections: ${report.sections?.length ?? 0}`);
  console.log(`[done] Tokens: input=${tokens.input}, output=${tokens.output}, total=${tokens.total}`);

  // Save result
  const outPath = join(
    process.cwd(),
    "src/agents/definitions/review-analysis/sample-coupang.json",
  );
  writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");
  console.log(`[done] Saved to ${outPath}`);
}

main().catch((err) => {
  console.error("[error]", err);
  process.exit(1);
});
