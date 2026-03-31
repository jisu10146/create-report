import type { ReportSchema, AgentDefinition } from "@/types";

/**
 * Validates and normalizes a raw Claude API response into a ReportSchema.
 * Fills in missing meta fields from the agent definition.
 */
export function normalizeReport(
  raw: unknown,
  agent: AgentDefinition
): ReportSchema {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid report: expected an object");
  }

  const r = raw as Record<string, unknown>;

  const meta = {
    agentId: agent.id,
    agentName: agent.name,
    createdAt: new Date().toISOString(),
    ...(r.meta as object | undefined),
  };

  const executiveSummary = (r.executiveSummary as ReportSchema["executiveSummary"]) ?? {
    keyFindings: [],
  };

  const report: ReportSchema = {
    meta,
    executiveSummary,
  };

  if (r.tabs) report.tabs = r.tabs as ReportSchema["tabs"];
  if (r.sections) report.sections = r.sections as ReportSchema["sections"];

  return report;
}

/**
 * Loads a sample report JSON from the agents directory (server-side only).
 */
export async function loadSampleReport(agentId: string): Promise<ReportSchema> {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  const filePath = join(process.cwd(), "src", "agents", `${agentId}.sample.json`);
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  return raw as ReportSchema;
}

/**
 * Loads an AgentDefinition JSON (server-side only).
 */
export async function loadAgentDefinition(agentId: string): Promise<AgentDefinition> {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  const filePath = join(process.cwd(), "src", "agents", `${agentId}.json`);
  return JSON.parse(readFileSync(filePath, "utf-8")) as AgentDefinition;
}

/**
 * Lists all available agent definitions (server-side only).
 */
export async function listAgents(): Promise<AgentDefinition[]> {
  const { readdirSync, readFileSync } = await import("fs");
  const { join } = await import("path");
  const dir = join(process.cwd(), "src", "agents");
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".json") && !f.endsWith(".sample.json")
  );
  return files.map((f) =>
    JSON.parse(readFileSync(join(dir, f), "utf-8"))
  ) as AgentDefinition[];
}
