import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import type {
  CodebaseScan,
  GitChange,
  PackageMetadata,
  ScanCodebaseOptions,
  TypeExport,
} from "../types.js";

const execFileAsync = promisify(execFile);
const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  ".turbo",
  ".git",
  "coverage",
  "test",
  "__tests__",
  "examples",
]);

export async function scanCodebase(
  options: ScanCodebaseOptions = {},
): Promise<CodebaseScan> {
  const root = resolve(options.root ?? ".");
  const warnings: string[] = [];
  const [packageMetadata, readmeSummary, typeExports, changeHistory] =
    await Promise.all([
      readPackageJson(root, warnings),
      readReadmeSummary(root, warnings),
      discoverTypeExports(root),
      readGitHistory(root, options.gitLimit ?? 20, warnings),
    ]);

  return {
    root,
    package: packageMetadata,
    readmeSummary,
    typeExports,
    changeHistory,
    warnings,
  };
}

async function readPackageJson(
  root: string,
  warnings: string[],
): Promise<PackageMetadata | undefined> {
  try {
    const parsed = JSON.parse(
      await readFile(join(root, "package.json"), "utf8"),
    ) as {
      name?: string;
      version?: string;
      description?: string;
      private?: boolean;
      type?: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return {
      name: parsed.name,
      version: parsed.version,
      description: parsed.description,
      private: parsed.private,
      type: parsed.type,
      dependencies: parsed.dependencies ?? {},
      devDependencies: parsed.devDependencies ?? {},
    };
  } catch {
    warnings.push("package.json was not found or could not be parsed.");
    return undefined;
  }
}

async function readReadmeSummary(
  root: string,
  warnings: string[],
): Promise<string | undefined> {
  try {
    const content = await readFile(join(root, "README.md"), "utf8");
    const paragraph = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && !line.startsWith(">"))
      .find(Boolean);
    return paragraph;
  } catch {
    warnings.push("README.md was not found or could not be parsed.");
    return undefined;
  }
}

async function readGitHistory(
  root: string,
  limit: number,
  warnings: string[],
): Promise<GitChange[]> {
  try {
    const { stdout } = await execFileAsync("git", [
      "-C",
      root,
      "log",
      `-${limit}`,
      "--pretty=format:%h%x09%ad%x09%s",
      "--date=short",
    ]);
    return stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [hash = "", date = "", subject = ""] = line.split("\t");
        return { hash, date, subject };
      });
  } catch {
    warnings.push("git history was not available; change history is empty.");
    return [];
  }
}

async function discoverTypeExports(root: string): Promise<TypeExport[]> {
  const files = await collectTypeScriptFiles(root);
  const exports: TypeExport[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const relativeFile = relative(root, file);
    for (const match of content.matchAll(
      /export\s+(?:declare\s+)?(interface|type|class|function)\s+([A-Za-z0-9_]+)/g,
    )) {
      const kind = match[1] as TypeExport["kind"] | undefined;
      const name = match[2];
      if (!kind || !name) continue;
      exports.push({ file: relativeFile, kind, name });
    }
  }

  return exports;
}

async function collectTypeScriptFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      files.push(...(await collectTypeScriptFiles(join(dir, entry.name))));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(join(dir, entry.name));
    }
  }

  return files;
}
