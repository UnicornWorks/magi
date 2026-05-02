import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PdfExportOptions, PdfExportResult } from "../types.js";

const execFileAsync = promisify(execFile);

export async function exportAnnexIvPdf(
  options: PdfExportOptions,
): Promise<PdfExportResult> {
  const pandocPath = options.pandocPath ?? "pandoc";

  try {
    await execFileAsync(pandocPath, [
      options.inputPath,
      "-o",
      options.outputPath,
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `pandoc is required for PDF export but could not be executed (${pandocPath}): ${message}`,
    );
  }

  return {
    inputPath: options.inputPath,
    outputPath: options.outputPath,
    pandocPath,
  };
}
