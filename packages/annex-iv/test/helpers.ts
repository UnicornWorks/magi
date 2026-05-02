import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function makeTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "magi-annex-iv-"));
}

export async function readText(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export function stringWriter(): {
  write: (chunk: string | Uint8Array) => boolean;
  text: () => string;
} {
  const chunks: string[] = [];
  return {
    write(chunk) {
      chunks.push(String(chunk));
      return true;
    },
    text() {
      return chunks.join("");
    },
  };
}
