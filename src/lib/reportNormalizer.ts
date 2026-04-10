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
const DEFINITIONS_DIR = "src/agents/definitions";

export async function loadSampleReport(agentId: string, sampleName?: string): Promise<ReportSchema> {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  const fileName = sampleName ? `sample-${sampleName}.json` : "sample.json";
  const filePath = join(process.cwd(), DEFINITIONS_DIR, agentId, fileName);
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  return raw as ReportSchema;
}

/**
 * Loads an AgentDefinition JSON (server-side only).
 */
export async function loadAgentDefinition(agentId: string): Promise<AgentDefinition> {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  const filePath = join(process.cwd(), DEFINITIONS_DIR, agentId, "agent.json");
  return JSON.parse(readFileSync(filePath, "utf-8")) as AgentDefinition;
}

/**
 * Lists all available agent definitions (server-side only).
 */
export async function listAgents(): Promise<AgentDefinition[]> {
  const { readdirSync, readFileSync, statSync } = await import("fs");
  const { join } = await import("path");
  const dir = join(process.cwd(), DEFINITIONS_DIR);
  const entries = readdirSync(dir).filter((f) => {
    const fullPath = join(dir, f);
    return statSync(fullPath).isDirectory();
  });
  return entries.map((f) =>
    JSON.parse(readFileSync(join(dir, f, "agent.json"), "utf-8"))
  ) as AgentDefinition[];
}
