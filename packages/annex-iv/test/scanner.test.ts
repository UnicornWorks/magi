import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scanCodebase } from "../src/index.js";
import { makeTempDir } from "./helpers.js";

describe("scanCodebase", () => {
  it("extracts package metadata, README summary, and TypeScript exports", async () => {
    const dir = await makeTempDir();
    await mkdir(join(dir, "src"));
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({
        name: "demo-system",
        version: "1.2.3",
        description: "Demo AI system",
      }),
    );
    await writeFile(
      join(dir, "README.md"),
      "# Demo\n\nThis system screens drivers.\n",
    );
    await writeFile(
      join(dir, "src", "index.ts"),
      "export interface DriverScore {}\nexport type RiskBand = string\nexport function score() {}\n",
    );

    const scan = await scanCodebase({ root: dir });

    expect(scan.package?.name).toBe("demo-system");
    expect(scan.readmeSummary).toBe("This system screens drivers.");
    expect(scan.typeExports.map((item) => item.name)).toEqual([
      "DriverScore",
      "RiskBand",
      "score",
    ]);
    expect(scan.changeHistory).toEqual([]);
    expect(scan.warnings).toContain(
      "git history was not available; change history is empty.",
    );
  });
});
