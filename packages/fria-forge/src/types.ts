import type { SystemId } from "@magi/core";

export type FriaTemplate = "dihr-ecnl" | "aligner" | "commission";

export type AnnexIIICategoryId =
  | "biometrics"
  | "critical-infrastructure"
  | "education"
  | "employment"
  | "essential-services"
  | "law-enforcement"
  | "migration-border-control"
  | "justice-democracy";

export interface AffectedGroup {
  name: string;
  description?: string;
  vulnerabilityFactors?: string[];
}

export interface MitigationMeasure {
  name: string;
  description?: string;
  owner?: string;
  status?: "planned" | "implemented" | "needs-review";
}

export interface FriaInput {
  systemId?: SystemId;
  systemName: string;
  provider?: string;
  deployer?: string;
  intendedPurpose?: string;
  sector?: string;
  useCase?: string;
  affectedGroups?: AffectedGroup[];
  deploymentContext?: string;
  dataCategories?: string[];
  oversightMeasures?: string[];
  mitigations?: MitigationMeasure[];
  template?: FriaTemplate;
  usagePeriod?: string;
  usageFrequency?: string;
  complaintMechanisms?: string[];
}

export interface AnnexIIICategoryMatch {
  id: AnnexIIICategoryId;
  label: string;
  articleRef: string;
  confidence: number;
  evidence: string[];
}

export interface AnnexIIIClassification {
  isHighRisk: boolean;
  primaryCategory?: AnnexIIICategoryId;
  categories: AnnexIIICategoryMatch[];
  confidence: number;
  evidence: string[];
  rationale: string;
  todos: string[];
}

export interface FundamentalRight {
  id: string;
  label: string;
  charterArticle: string;
  description: string;
  relatedCategories: AnnexIIICategoryId[];
  riskPrompts: string[];
}

export interface FriaSection {
  id: string;
  title: string;
  content: string[];
  todos: string[];
}

export interface FriaDocument {
  systemId?: SystemId;
  generatedAt: Date;
  template: FriaTemplate;
  input: FriaInput;
  classification: AnnexIIIClassification;
  rights: FundamentalRight[];
  sections: FriaSection[];
  warnings: string[];
}

export interface FriaBuildOptions {
  input: FriaInput;
  template?: FriaTemplate;
  generatedAt?: Date;
}

export interface FriaPdfExportOptions {
  inputPath: string;
  outputPath: string;
  pandocPath?: string;
}

export interface FriaPdfExportResult {
  inputPath: string;
  outputPath: string;
  pandocPath: string;
}
