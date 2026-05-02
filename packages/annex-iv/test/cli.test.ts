import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runAnnexIvCli } from "../src/cli/index.js";
import { makeTempDir, readText, stringWriter } from "./helpers.js";

describe("magi-annex-iv CLI", () => {
  it("build command writes Markdown", async () => {
    const dir = await makeTempDir();
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({ name: "demo-ai" }),
    );
    await writeFile(join(dir, "AGENTS.md"), "# Demo Agent\n");
    const stdout = stringWriter();
    const stderr = stringWriter();

    const code = await runAnnexIvCli(
      ["build", "--root", dir, "--output", "annex-iv.md"],
      { cwd: dir, stdout, stderr },
    );

    expect(code).toBe(0);
    expect(stderr.text()).toBe("");
    expect(stdout.text()).toContain("Annex IV draft written");
    expect(await readText(join(dir, "annex-iv.md"))).toContain(
      "EU AI Act Annex IV Technical Documentation Draft",
    );
  });

  it("returns a clear error when PDF export is requested without pandoc", async () => {
    const dir = await makeTempDir();
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({ name: "demo-ai" }),
    );
    const stderr = stringWriter();

    const code = await runAnnexIvCli(
      ["build", "--root", dir, "--output", "annex-iv.md", "--pdf"],
      {
        cwd: dir,
        stderr,
        stdout: stringWriter(),
        env: { MAGI_ANNEX_IV_PANDOC: "definitely-not-pandoc" },
      },
    );

    expect(code).toBe(1);
    expect(stderr.text()).toContain("pandoc is required for PDF export");
  });
});
