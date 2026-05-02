import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { FriaDocument } from "../types.js";

const TODO_MARKER = "TODO(manual input required)";

export function renderFriaMarkdown(document: FriaDocument): string {
  const fria = document as FriaDocument & Record<string, unknown>;
  const metadata = recordValue(fria.metadata);
  const classification = recordValue(fria.highRiskClassification);
  const sections = arrayValue(fria.sections).map((section) => recordValue(section));
  const rightsMapping = arrayValue(fria.rightsMapping).map((right) => recordValue(right));
  const checklist = arrayValue(fria.reviewChecklist);

  const lines: string[] = [
    "---",
    `title: ${stringValue(fria.templateTitle) ?? "Fundamental Rights Impact Assessment Draft"}`,
    `template_id: ${stringValue(fria.templateId) ?? TODO_MARKER}`,
    `system_name: ${stringValue(metadata.systemName) ?? TODO_MARKER}`,
    `deployer: ${stringValue(metadata.deployer) ?? TODO_MARKER}`,
    `sector: ${stringValue(metadata.sector) ?? TODO_MARKER}`,
    `generated_at: ${dateString(fria.generatedAt)}`,
    `status: ${stringValue(fria.status) ?? "draft"}`,
    "---",
    "",
    `# ${stringValue(fria.templateTitle) ?? "Fundamental Rights Impact Assessment Draft"}`,
    "",
    `> ${stringValue(fria.disclaimer) ?? "This draft is a tooling aid. It is not legal advice and is not an official regulator template."}`,
    "",
    "## Metadata",
    "",
    `- System name: ${stringValue(metadata.systemName) ?? TODO_MARKER}`,
    `- Deployer: ${stringValue(metadata.deployer) ?? TODO_MARKER}`,
    `- Sector: ${stringValue(metadata.sector) ?? TODO_MARKER}`,
    `- Intended purpose: ${stringValue(metadata.intendedPurpose) ?? TODO_MARKER}`,
    "",
    "## High-Risk Classification Result",
    "",
    `- Result: ${stringValue(classification.result) ?? TODO_MARKER}`,
    `- Annex III categories: ${arrayValue(classification.annexIII).join(", ") || TODO_MARKER}`,
    `- Rationale: ${stringValue(classification.rationale) ?? TODO_MARKER}`,
    "",
    "## Rights Mapping",
    "",
  ];

  for (const right of rightsMapping) {
    lines.push(
      `- ${stringValue(right.right) ?? TODO_MARKER}: ${stringValue(right.impactPathway) ?? TODO_MARKER}`,
    );
  }

  lines.push("", "## Selected Sections", "");
  for (const section of sections) {
    lines.push(`### ${stringValue(section.title) ?? TODO_MARKER}`, "");
    const refs = arrayValue(section.articleRefs);
    if (refs.length > 0) lines.push(`_References: ${refs.join(", ")}_`, "");
    for (const content of arrayValue(section.content)) lines.push(`- ${content}`);
    const todos = arrayValue(section.todos);
    if (todos.length > 0) {
      lines.push("", "#### TODO Markers", "");
      for (const todo of todos) lines.push(`- ${todo}`);
    }
    lines.push("");
  }

  lines.push("## Final Review Checklist", "");
  for (const item of checklist) lines.push(`- [ ] ${item}`);
  if (checklist.length === 0) lines.push(`- [ ] ${TODO_MARKER}: complete final review checklist.`);

  return `${lines.join("\n").trim()}\n`;
}

export async function writeFriaMarkdown(
  document: FriaDocument,
  outputPath: string,
): Promise<string> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderFriaMarkdown(document), "utf8");
  return outputPath;
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function dateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.trim()) return value;
  return new Date().toISOString();
}
