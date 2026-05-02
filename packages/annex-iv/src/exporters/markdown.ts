import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { TODO_MARKER } from "../sections/definitions.js";
import type { AnnexIvDocument } from "../types.js";

export function renderAnnexIvMarkdown(document: AnnexIvDocument): string {
  const lines: string[] = [
    "---",
    "title: EU AI Act Annex IV Technical Documentation Draft",
    `system_id: ${document.systemId ?? "unknown"}`,
    `generated_at: ${document.generatedAt.toISOString()}`,
    `source_root: ${document.sourceRoot}`,
    "status: draft",
    "---",
    "",
    "# EU AI Act Annex IV Technical Documentation Draft",
    "",
    "> This document is generated as a draft tooling artifact. It is not legal advice.",
    "",
    "## Source Summary",
    "",
    `- AGENTS.md source: ${document.agentsMd.path ?? "not found"}`,
    `- package: ${document.codebase.package?.name ?? TODO_MARKER}`,
    `- version: ${document.codebase.package?.version ?? TODO_MARKER}`,
    `- git changes scanned: ${document.codebase.changeHistory.length}`,
    "",
  ];

  if (document.warnings.length > 0) {
    lines.push("## Warnings", "");
    for (const warning of document.warnings) lines.push(`- ${warning}`);
    lines.push("");
  }

  lines.push("## Table of Contents", "");
  for (const section of document.sections) {
    lines.push(`- [${section.title}](#${slug(section.title)})`);
  }
  lines.push("");

  for (const section of document.sections) {
    lines.push(`## ${section.title}`, "");
    lines.push(`_References: ${section.articleRefs.join(", ")}_`, "");
    lines.push(...section.content, "");
    if (section.todos.length > 0) {
      lines.push("### Manual Inputs", "");
      for (const todo of section.todos) lines.push(`- ${todo}`);
      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

export async function writeAnnexIvMarkdown(
  document: AnnexIvDocument,
  outputPath: string,
): Promise<string> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderAnnexIvMarkdown(document), "utf8");
  return outputPath;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
