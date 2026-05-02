import { classifyAnnexIII } from "../classifier/annex-iii.js";
import type {
  AnnexIIIClassification,
  FriaInput,
  FundamentalRight,
} from "../types.js";
import { FUNDAMENTAL_RIGHTS } from "./data.js";

type AnnexIIICategory =
  | "biometrics"
  | "critical-infrastructure"
  | "education"
  | "employment"
  | "essential-services"
  | "law-enforcement"
  | "migration-border-control"
  | "justice-democracy";

const RIGHTS_BY_CATEGORY: Record<AnnexIIICategory, string[]> = {
  biometrics: [
    "private-life-data-protection",
    "non-discrimination",
    "freedom-assembly-association",
  ],
  "critical-infrastructure": ["life-integrity", "health-care"],
  education: [
    "education",
    "rights-child",
    "non-discrimination",
    "freedom-expression-information",
  ],
  employment: [
    "fair-working-conditions",
    "private-life-data-protection",
    "non-discrimination",
  ],
  "essential-services": [
    "social-security-assistance",
    "health-care",
    "rights-child",
    "non-discrimination",
    "private-life-data-protection",
  ],
  "law-enforcement": [
    "liberty-security",
    "effective-remedy-fair-trial",
    "life-integrity",
    "non-discrimination",
    "private-life-data-protection",
  ],
  "migration-border-control": [
    "human-dignity",
    "liberty-security",
    "good-administration-democracy",
    "non-discrimination",
  ],
  "justice-democracy": [
    "effective-remedy-fair-trial",
    "good-administration-democracy",
    "freedom-expression-information",
    "freedom-assembly-association",
  ],
};

export function mapFundamentalRights(
  inputOrClassification: FriaInput | AnnexIIIClassification,
): FundamentalRight[] {
  const classification = isClassification(inputOrClassification)
    ? inputOrClassification
    : classifyAnnexIII(inputOrClassification);

  const categories = getCategories(classification);
  const rightIds = new Set(
    categories.flatMap((category) => RIGHTS_BY_CATEGORY[category] ?? []),
  );

  return FUNDAMENTAL_RIGHTS.filter((right) => rightIds.has(right.id));
}

function isClassification(
  value: FriaInput | AnnexIIIClassification,
): value is AnnexIIIClassification {
  return typeof (value as AnnexIIIClassification).isHighRisk === "boolean";
}

function getCategories(classification: AnnexIIIClassification): AnnexIIICategory[] {
  const record = classification as Record<string, unknown>;
  const categories = new Set<AnnexIIICategory>();

  for (const candidate of toCategoryList(record.matchedCategories)) {
    categories.add(candidate);
  }

  for (const candidate of toCategoryList(record.category)) {
    categories.add(candidate);
  }

  return [...categories];
}

function toCategoryList(value: unknown): AnnexIIICategory[] {
  if (typeof value === "string" && isAnnexIIICategory(value)) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter(isAnnexIIICategory);
  }

  return [];
}

function isAnnexIIICategory(value: unknown): value is AnnexIIICategory {
  return (
    value === "biometrics" ||
    value === "critical-infrastructure" ||
    value === "education" ||
    value === "employment" ||
    value === "essential-services" ||
    value === "law-enforcement" ||
    value === "migration-border-control" ||
    value === "justice-democracy"
  );
}

