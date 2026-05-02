import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runFriaForgeCli } from "../src/cli/index.js";
import { makeTempDir, readText, sampleInput, stringWriter, writeJson } from "./helpers.js";

describe("magi-fria-forge CLI", () => {
  it("build writes Markdown from JSON input", async () => {
    const dir = await makeTempDir();
    const inputPath = join(dir, "fria-input.json");
    const outputPath = join(dir, "fria.draft.md");
    await writeJson(inputPath, sampleInput());
    const stdout = stringWriter();
    const stderr = stringWriter();

    const code = await runFriaForgeCli(
      ["build", "--input", inputPath, "--output", outputPath],
      { cwd: dir, stdout, stderr },
    );

    expect(code).toBe(0);
    expect(stderr.text()).toBe("");
    expect(stdout.text()).toContain("FRIA draft written");
    expect(await readText(outputPath)).toContain(
      "Fundamental Rights Impact Assessment Draft",
    );
  });

  it("init works with flags in non-interactive mode", async () => {
    const dir = await makeTempDir();
    const outputPath = join(dir, "fria.draft.md");
    const stdout = stringWriter();

    const code = await runFriaForgeCli(
      [
        "init",
        "--system-name",
        "Hiring Assistant",
        "--sector",
        "employment",
        "--use-case",
        "Screening job applications",
        "--affected-groups",
        "job applicants",
        "--output",
        outputPath,
      ],
      {
        cwd: dir,
        stdin: { isTTY: false },
        stdout,
        stderr: stringWriter(),
      },
    );

    expect(code).toBe(0);
    expect(stdout.text()).toContain("FRIA draft written");
    expect(await readText(outputPath)).toContain("Hiring Assistant");
  });

  it("returns a clear PDF-only error when pandoc is missing", async () => {
    const dir = await makeTempDir();
    const inputPath = join(dir, "fria-input.json");
    await writeJson(inputPath, sampleInput());
    const stderr = stringWriter();

    const code = await runFriaForgeCli(
      ["build", "--input", inputPath, "--output", "fria.md", "--pdf"],
      {
        cwd: dir,
        stdout: stringWriter(),
        stderr,
        env: { MAGI_FRIA_FORGE_PANDOC: "definitely-not-pandoc" },
      },
    );

    expect(code).toBe(1);
    expect(stderr.text()).toContain("pandoc is required for PDF export");
    expect(await readText(join(dir, "fria.md"))).toContain("status: draft");
  });
});
