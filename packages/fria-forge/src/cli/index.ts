#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { writeFriaMarkdown } from "../exporters/markdown.js";
import { exportFriaPdf } from "../exporters/pdf.js";
import { loadFriaInput, normalizeFriaInput } from "../io/load-input.js";
import { buildFriaDocument } from "../templates/build-document.js";
import type { FriaInput, FriaTemplate } from "../types.js";

export interface CliContext {
  cwd?: string;
  stdout?: Pick<typeof process.stdout, "write" | "isTTY">;
  stderr?: Pick<typeof process.stderr, "write">;
  stdin?: Pick<typeof process.stdin, "isTTY">;
  env?: Record<string, string | undefined>;
}

interface CommonArgs {
  input?: string;
  output: string;
  template?: FriaTemplate;
  pdf: boolean;
  pdfOutput?: string;
  flags: Record<string, string | undefined>;
}

export async function runFriaForgeCli(
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

  if (command !== "build" && command !== "init") {
    stderr.write(`Unknown command: ${command}\n\n${helpText()}`);
    return 1;
  }

  try {
    const cwd = context.cwd ?? process.cwd();
    const args = parseCommonArgs(argv.slice(1), cwd, command);
    const friaInput =
      command === "build"
        ? await inputForBuild(args)
        : await inputForInit(args, context);
    const document = buildFriaDocument({
      input: friaInput,
      template: args.template ?? friaInput.template,
    });

    await writeFriaMarkdown(document, args.output);
    stdout.write(`FRIA draft written to ${args.output}\n`);

    if (args.pdf) {
      const pdfOutput = args.pdfOutput ?? args.output.replace(/\.md$/i, ".pdf");
      await exportFriaPdf({
        inputPath: args.output,
        outputPath: pdfOutput,
        pandocPath: env.MAGI_FRIA_FORGE_PANDOC,
      });
      stdout.write(`FRIA PDF written to ${pdfOutput}\n`);
    }

    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`${message}\n`);
    return 1;
  }
}

function parseCommonArgs(
  argv: string[],
  cwd: string,
  command: "build" | "init",
): CommonArgs {
  const args: CommonArgs = {
    output: resolve(cwd, command === "init" ? "fria.draft.md" : "fria.md"),
    pdf: false,
    flags: {},
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case "-i":
      case "--input":
        args.input = resolve(cwd, requiredValue(argv, ++index, token));
        break;
      case "-o":
      case "--output":
        args.output = resolve(cwd, requiredValue(argv, ++index, token));
        break;
      case "--template":
        args.template = templateValue(requiredValue(argv, ++index, token));
        break;
      case "--system-name":
      case "--provider":
      case "--deployer":
      case "--intended-purpose":
      case "--sector":
      case "--use-case":
      case "--deployment-context":
      case "--data-categories":
      case "--affected-groups":
      case "--oversight-measures":
      case "--mitigations":
        args.flags[token.slice(2)] = requiredValue(argv, ++index, token);
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

async function inputForBuild(args: CommonArgs): Promise<FriaInput> {
  if (!args.input) throw new Error("build requires --input <path>.");
  return loadFriaInput(args.input);
}

async function inputForInit(
  args: CommonArgs,
  context: CliContext,
): Promise<FriaInput> {
  if (args.input) return loadFriaInput(args.input);

  if (args.flags["system-name"]) {
    return normalizeFriaInput(flagsToInput(args.flags));
  }

  const stdinIsTty = context.stdin?.isTTY ?? process.stdin.isTTY;
  const stdoutIsTty = context.stdout?.isTTY ?? process.stdout.isTTY;
  if (!stdinIsTty || !stdoutIsTty) {
    throw new Error(
      "init in non-interactive mode requires --input or --system-name flags.",
    );
  }

  const rl = createInterface({ input, output });
  try {
    const systemName = await rl.question("System name: ");
    const sector = await rl.question("Sector: ");
    const useCase = await rl.question("Use case: ");
    const affected = await rl.question("Affected groups (comma-separated): ");
    return normalizeFriaInput({
      systemName,
      sector,
      useCase,
      affectedGroups: commaList(affected),
    });
  } finally {
    rl.close();
  }
}

function flagsToInput(flags: Record<string, string | undefined>): Record<string, unknown> {
  return {
    systemName: flags["system-name"],
    provider: flags.provider,
    deployer: flags.deployer,
    intendedPurpose: flags["intended-purpose"],
    sector: flags.sector,
    useCase: flags["use-case"],
    deploymentContext: flags["deployment-context"],
    dataCategories: commaList(flags["data-categories"]),
    affectedGroups: commaList(flags["affected-groups"]),
    oversightMeasures: commaList(flags["oversight-measures"]),
    mitigations: commaList(flags.mitigations),
  };
}

function commaList(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

function templateValue(value: string): FriaTemplate {
  if (
    value === "dihr-ecnl" ||
    value === "aligner" ||
    value === "commission"
  ) {
    return value;
  }
  throw new Error(`Unknown template: ${value}`);
}

function requiredValue(argv: string[], index: number, option: string): string {
  const value = argv[index];
  if (!value) throw new Error(`${option} requires a value.`);
  return value;
}

function helpText(): string {
  return [
    "magi-fria-forge",
    "",
    "Commands:",
    "  init [--input <path> | --system-name <name> --sector <sector> --use-case <text>] [--output <path>] [--template <name>] [--pdf]",
    "  build --input <path> [--output <path>] [--template <name>] [--pdf] [--pdf-output <path>]",
    "",
    "Templates: dihr-ecnl, aligner, commission",
    "",
  ].join("\n");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runFriaForgeCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
