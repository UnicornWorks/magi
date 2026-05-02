#!/usr/bin/env node
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { writeAnnexIvMarkdown } from "../exporters/markdown.js";
import { exportAnnexIvPdf } from "../exporters/pdf.js";
import { buildAnnexIvDocument } from "../sections/build-document.js";

export interface CliContext {
  cwd?: string;
  stdout?: Pick<typeof process.stdout, "write">;
  stderr?: Pick<typeof process.stderr, "write">;
  env?: Record<string, string | undefined>;
}

interface BuildArgs {
  root: string;
  agentsMd: string;
  output: string;
  pdf: boolean;
  pdfOutput?: string;
}

export async function runAnnexIvCli(
  argv: string[],
  context: CliContext = {},
): Promise<number> {
  const stdout = context.stdout ?? process.stdout;
  const stderr = context.stderr ?? process.stderr;
  const env = context.env ?? process.env;
  const command = argv[0];

  if (!command || command === "--help" || command === "-h") {
    stdout.write(helpText());
    return 0;
  }

  if (command !== "build") {
    stderr.write(`Unknown command: ${command}\n\n${helpText()}`);
    return 1;
  }

  try {
    const args = parseBuildArgs(argv.slice(1), context.cwd ?? process.cwd());
    const document = await buildAnnexIvDocument({
      root: args.root,
      agentsMdPath: args.agentsMd,
    });
    await writeAnnexIvMarkdown(document, args.output);
    stdout.write(`Annex IV draft written to ${args.output}\n`);

    if (args.pdf) {
      const pdfOutput = args.pdfOutput ?? args.output.replace(/\.md$/i, ".pdf");
      await exportAnnexIvPdf({
        inputPath: args.output,
        outputPath: pdfOutput,
        pandocPath: env.MAGI_ANNEX_IV_PANDOC,
      });
      stdout.write(`Annex IV PDF written to ${pdfOutput}\n`);
    }

    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`${message}\n`);
    return 1;
  }
}

function parseBuildArgs(argv: string[], cwd: string): BuildArgs {
  const args: BuildArgs = {
    root: cwd,
    agentsMd: "./AGENTS.md",
    output: resolve(cwd, "annex-iv.md"),
    pdf: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case "-r":
      case "--root":
        args.root = resolve(cwd, requiredValue(argv, ++index, token));
        break;
      case "-a":
      case "--agents-md":
        args.agentsMd = requiredValue(argv, ++index, token);
        break;
      case "-o":
      case "--output":
        args.output = resolve(cwd, requiredValue(argv, ++index, token));
        break;
      case "--pdf":
        args.pdf = true;
        break;
      case "--pdf-output":
        args.pdfOutput = resolve(cwd, requiredValue(argv, ++index, token));
        break;
      default:
        throw new Error(`Unknown option: ${token}`);
    }
  }

  return args;
}

function requiredValue(argv: string[], index: number, option: string): string {
  const value = argv[index];
  if (!value) throw new Error(`${option} requires a value.`);
  return value;
}

function helpText(): string {
  return [
    "magi-annex-iv",
    "",
    "Commands:",
    "  build --root <path> --agents-md <path> --output <path> [--pdf] [--pdf-output <path>]",
    "",
  ].join("\n");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runAnnexIvCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
