import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAgentsMd } from "../src/index.js";
import { makeTempDir } from "./helpers.js";

describe("parseAgentsMd", () => {
  it("parses headings, bullets, and metadata heuristics", async () => {
    const dir = await makeTempDir();
    await writeFile(
      join(dir, "AGENTS.md"),
      [
        "# Test Agent",
        "models: claude, gpt",
        "",
        "## Tools",
        "- db.query",
        "- slack.send",
        "",
        "## Constraints",
        "- Do not leak secrets",
      ].join("\n"),
    );

    const parsed = await parseAgentsMd({ root: dir });

    expect(parsed.exists).toBe(true);
    expect(parsed.title).toBe("Test Agent");
    expect(parsed.sections.map((section) => section.title)).toContain("Tools");
    expect(parsed.metadata.models).toEqual(["claude", "gpt"]);
    expect(parsed.metadata.tools).toEqual(["db.query", "slack.send"]);
    expect(parsed.metadata.constraints).toEqual(["Do not leak secrets"]);
  });

  it("falls back to AGENT.MD when AGENTS.md is missing", async () => {
    const dir = await makeTempDir();
    await writeFile(join(dir, "AGENT.MD"), "# Fallback Agent\n");

    const parsed = await parseAgentsMd({ root: dir });

    expect(parsed.exists).toBe(true);
    expect(parsed.path).toContain("AGENT.MD");
    expect(parsed.warnings[0]).toContain("fallback");
  });

  it("returns a missing document when no agent file exists", async () => {
    const dir = await makeTempDir();
    await mkdir(join(dir, "nested"));

    const parsed = await parseAgentsMd({ root: join(dir, "nested") });

    expect(parsed.exists).toBe(false);
    expect(parsed.path).toBeNull();
    expect(parsed.warnings).toHaveLength(2);
  });
});
