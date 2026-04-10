import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { orchestrate } from "../src/agents/orchestrator/pm";

// ChatGPT 리뷰 데이터 로드
const csvPath = join(process.cwd(), "src/data/chatgpt_reviews_kr.csv");
const csv = readFileSync(csvPath, "utf-8");
const lines = csv.split("\n");
const headers = lines[0].split(",");

// 간단 CSV 파서 (content에 쉼표 포함 대응)
const rows: Array<Record<string, unknown>> = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  // reviewId,userName,score,content,thumbsUpCount,at,replyContent
  // content 필드가 쉼표를 포함할 수 있으므로 앞뒤 필드를 먼저 파싱
  const parts = line.split(",");
  const reviewId = parts[0];
  const userName = parts[1];
  const score = Number(parts[2]);
  // content는 중간에 쉼표가 있을 수 있으므로 뒤에서부터 파싱
  const replyContent = parts[parts.length - 1];
  const at = parts[parts.length - 2];
  const thumbsUpCount = Number(parts[parts.length - 3]);
  const content = parts.slice(3, parts.length - 3).join(",");

  if (isNaN(score)) continue;
  rows.push({ content, score, thumbsUpCount, at });
}

console.log("=== VOC 파이프라인 실행 ===");
console.log("입력:", rows.length, "건");
console.log("시작:", new Date().toISOString());

const start = Date.now();

orchestrate({
  agentName: "ChatGPT VOC 분석",
  description: "ChatGPT 앱 한국어 리뷰 500건을 분석하여 사용자 경험을 진단하고 제품 개선 우선순위를 제시합니다.",
  vocRawData: rows,
  volume: "standard",
  audience: "AI 챗봇 서비스 프로덕트 매니저",
}).then((result) => {
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n=== 완료 (" + elapsed + "s) ===\n");

  // 토큰 사용량
  if (result.tokenUsage) {
    console.log("=== 토큰 사용량 (단계별) ===");
    for (const entry of result.tokenUsage.log) {
      console.log(`  ${entry.stage.padEnd(35)} input=${String(entry.inputTokens).padStart(6)} output=${String(entry.outputTokens).padStart(5)} total=${String(entry.totalTokens).padStart(6)}`);
    }
    console.log("");
    console.log(`  ${"합계".padEnd(35)} input=${String(result.tokenUsage.totals.input).padStart(6)} output=${String(result.tokenUsage.totals.output).padStart(5)} total=${String(result.tokenUsage.totals.total).padStart(6)}`);
  }

  // 블루프린트 요약
  console.log("\n=== 블루프린트 ===");
  console.log("ID:", result.blueprint.id);
  console.log("섹션:", result.blueprint.reportSections.length + "개");
  for (const s of result.blueprint.reportSections) {
    console.log("  -", s.componentType.padEnd(20), s.label.slice(0, 70));
  }

  // VOC 전처리
  if (result.trace.vocPreprocess) {
    const vp = result.trace.vocPreprocess;
    console.log("\n=== VOC 전처리 (코드, 0 토큰) ===");
    console.log("양극화:", vp.polarization?.detected, vp.polarization?.extremeRate + "%");
    console.log("토픽:", vp.topics.map(t => t.name + "(" + t.impact + ")").join(", "));
  }

  // 결과 저장
  writeFileSync("/tmp/voc-pipeline-result.json", JSON.stringify(result, null, 2));
  console.log("\n결과 → /tmp/voc-pipeline-result.json");
}).catch((err) => {
  console.error("에러:", err.message ?? err);
  process.exit(1);
});
