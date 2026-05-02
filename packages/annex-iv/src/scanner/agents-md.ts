import { access, readFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import type {
  AgentsMdDocument,
  AgentsMdSection,
  ParseAgentsMdOptions,
} from "../types.js";

const METADATA_HEADINGS = new Map([
  ["model", "models"],
  ["models", "models"],
  ["tool", "tools"],
  ["tools", "tools"],
  ["constraint", "constraints"],
  ["constraints", "constraints"],
]);

export async function parseAgentsMd(
  options: ParseAgentsMdOptions = {},
): Promise<AgentsMdDocument> {
  const root = resolve(options.root ?? ".");
  const preferred = resolveFromRoot(root, options.path ?? "./AGENTS.md");
  const warnings: string[] = [];
  let path = preferred;

  if (!(await exists(path))) {
    if (options.fallbackToAgentMd ?? true) {
      const fallback = join(root, "AGENT.MD");
      if (await exists(fallback)) {
        warnings.push(
          `AGENTS.md was not found; using AGENT.MD fallback at ${fallback}.`,
        );
        path = fallback;
      } else {
        return {
          path: null,
          exists: false,
          sections: [],
          metadata: {},
          warnings: [
            `AGENTS.md was not found at ${preferred}.`,
            `AGENT.MD fallback was not found at ${fallback}.`,
          ],
        };
      }
    } else {
      return {
        path: null,
        exists: false,
        sections: [],
        metadata: {},
        warnings: [`AGENTS.md was not found at ${preferred}.`],
      };
    }
  }

  const content = await readFile(path, "utf8");
  const sections = parseSections(content);
  return {
    path,
    exists: true,
    title: sections[0]?.level === 1 ? sections[0].title : undefined,
    sections,
    metadata: extractMetadata(content, sections),
    warnings,
  };
}

function parseSections(content: string): AgentsMdSection[] {
  const sections: AgentsMdSection[] = [];
  let current: AgentsMdSection | null = null;

  for (const line of content.split(/\r?\n/)) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      current = {
        title: heading[2]?.trim() ?? "Untitled",
        level: heading[1]?.length ?? 1,
        content: "",
        bullets: [],
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = {
        title: "Overview",
        level: 1,
        content: "",
        bullets: [],
      };
      sections.push(current);
    }

    const bullet = /^\s*[-*]\s+(.+?)\s*$/.exec(line);
    if (bullet?.[1]) current.bullets.push(bullet[1]);
    current.content = `${current.content}${line}\n`;
  }

  return sections.map((section) => ({
    ...section,
    content: section.content.trim(),
  }));
}

function extractMetadata(
  content: string,
  sections: AgentsMdSection[],
): Record<string, string[]> {
  const metadata: Record<string, string[]> = {};

  for (const line of content.split(/\r?\n/)) {
    const match =
      /^\s*(model|models|tool|tools|constraint|constraints)\s*:\s*(.+)$/i.exec(
        line,
      );
    if (!match?.[1] || !match[2]) continue;
    addMetadata(metadata, normalizeKey(match[1]), splitValues(match[2]));
  }

  for (const section of sections) {
    const key = METADATA_HEADINGS.get(section.title.trim().toLowerCase());
    if (!key || section.bullets.length === 0) continue;
    addMetadata(metadata, key, section.bullets);
  }

  return metadata;
}

function normalizeKey(key: string): string {
  return METADATA_HEADINGS.get(key.trim().toLowerCase()) ?? key.toLowerCase();
}

function splitValues(value: string): string[] {
  return value
    .split(/[,、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function addMetadata(
  metadata: Record<string, string[]>,
  key: string,
  values: string[],
): void {
  metadata[key] = Array.from(new Set([...(metadata[key] ?? []), ...values]));
}

function resolveFromRoot(root: string, path: string): string {
  return isAbsolute(path) ? path : resolve(root, path);
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
