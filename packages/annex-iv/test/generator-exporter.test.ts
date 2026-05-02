import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  TODO_MARKER,
  buildAnnexIvDocument,
  renderAnnexIvMarkdown,
  writeAnnexIvMarkdown,
} from "../src/index.js";
import { makeTempDir, readText } from "./helpers.js";

describe("Annex IV generation and Markdown export", () => {
  it("emits all 9 sections in order with metadata, TOC, and TODO markers", async () => {
    const dir = await makeTempDir();
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({ name: "demo-ai", version: "0.1.0" }),
    );
    await writeFile(join(dir, "README.md"), "# Demo\n\nDemo summary.\n");
    await writeFile(
      join(dir, "AGENTS.md"),
      "# Demo Agent\n\nTools: db.query\n",
    );

    const document = await buildAnnexIvDocument({
      root: dir,
      generatedAt: new Date("2026-05-02T00:00:00.000Z"),
    });
    const markdown = renderAnnexIvMarkdown(document);

    expect(document.sections).toHaveLength(9);
    expect(document.sections[0]?.id).toBe("1-general-description");
    expect(markdown).toContain("generated_at: 2026-05-02T00:00:00.000Z");
    expect(markdown).toContain("## Table of Contents");
    expect(markdown).toContain("## 9. Post-Market Monitoring System");
    expect(markdown).toContain(TODO_MARKER);
  });

  it("writes Markdown to disk", async () => {
    const dir = await makeTempDir();
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({ name: "demo-ai" }),
    );
    const document = await buildAnnexIvDocument({ root: dir });
    const outputPath = join(dir, "out", "annex-iv.md");

    await writeAnnexIvMarkdown(document, outputPath);

    expect(await readText(outputPath)).toContain("# EU AI Act Annex IV");
  });
});
