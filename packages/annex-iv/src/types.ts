import type { SystemId } from "@magi/core";

export type AnnexIvSectionId =
  | "1-general-description"
  | "2-elements-and-development"
  | "3-monitoring-functioning-control"
  | "4-performance-metrics"
  | "5-risk-management"
  | "6-lifecycle-changes"
  | "7-standards"
  | "8-eu-declaration"
  | "9-post-market-monitoring";

export interface AnnexIvSection {
  id: AnnexIvSectionId;
  title: string;
  articleRefs: string[];
  content: string[];
  todos: string[];
}

export interface AnnexIvDocument {
  systemId?: SystemId;
  generatedAt: Date;
  sourceRoot: string;
  agentsMd: AgentsMdDocument;
  codebase: CodebaseScan;
  sections: AnnexIvSection[];
  warnings: string[];
}

export interface AnnexIvBuildOptions {
  root?: string;
  agentsMdPath?: string;
  systemId?: SystemId;
  generatedAt?: Date;
}

export interface AgentsMdSection {
  title: string;
  level: number;
  content: string;
  bullets: string[];
}

export interface AgentsMdDocument {
  path: string | null;
  exists: boolean;
  title?: string;
  sections: AgentsMdSection[];
  metadata: Record<string, string[]>;
  warnings: string[];
}

export interface ParseAgentsMdOptions {
  root?: string;
  path?: string;
  fallbackToAgentMd?: boolean;
}

export interface PackageMetadata {
  name?: string;
  version?: string;
  description?: string;
  private?: boolean;
  type?: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface GitChange {
  hash: string;
  date: string;
  subject: string;
}

export interface TypeExport {
  file: string;
  kind: "class" | "function" | "interface" | "type";
  name: string;
}

export interface CodebaseScan {
  root: string;
  package?: PackageMetadata;
  readmeSummary?: string;
  typeExports: TypeExport[];
  changeHistory: GitChange[];
  warnings: string[];
}

export interface ScanCodebaseOptions {
  root?: string;
  gitLimit?: number;
}

export interface PdfExportOptions {
  inputPath: string;
  outputPath: string;
  pandocPath?: string;
}

export interface PdfExportResult {
  inputPath: string;
  outputPath: string;
  pandocPath: string;
}
