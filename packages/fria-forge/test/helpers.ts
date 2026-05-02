import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FriaInput } from "../src/types.js";

export async function makeTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "magi-fria-forge-"));
}

export async function readText(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function sampleInput(overrides: Partial<FriaInput> = {}): FriaInput {
  return {
    systemName: "Eligibility Copilot",
    provider: "Example AI Ltd.",
    deployer: "Example City",
    intendedPurpose: "Support case workers assessing social benefit eligibility.",
    sector: "public benefits",
    useCase: "Ranking applications for access to essential public services and benefits.",
    affectedGroups: [{ name: "Residents applying for housing support" }],
    deploymentContext: "Municipal benefits office",
    dataCategories: ["identity", "income", "household composition"],
    oversightMeasures: ["Case worker reviews every recommendation before action"],
    mitigations: [{ name: "Appeals process", status: "planned" }],
    ...overrides,
  };
}

export function stringWriter(): {
  write: (chunk: string | Uint8Array) => boolean;
  text: () => string;
  isTTY: false;
} {
  const chunks: string[] = [];
  return {
    isTTY: false,
    write(chunk) {
      chunks.push(String(chunk));
      return true;
    },
    text() {
      return chunks.join("");
    },
  };
}
