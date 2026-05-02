import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { FriaPdfExportOptions, FriaPdfExportResult } from "../types.js";

const execFileAsync = promisify(execFile);

export async function exportFriaPdf(
  options: FriaPdfExportOptions,
): Promise<FriaPdfExportResult> {
  const pdfOptions = options as FriaPdfExportOptions & {
    inputPath: string;
    outputPath: string;
    pandocPath?: string;
  };
  const pandocPath = pdfOptions.pandocPath ?? "pandoc";

  try {
    await execFileAsync(pandocPath, [
      pdfOptions.inputPath,
      "-o",
      pdfOptions.outputPath,
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `pandoc is required for FRIA PDF export but could not be executed (${pandocPath}): ${message}`,
    );
  }

  return {
    inputPath: pdfOptions.inputPath,
    outputPath: pdfOptions.outputPath,
    pandocPath,
  } as FriaPdfExportResult;
}
