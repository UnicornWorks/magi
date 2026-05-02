import type {
  AnnexIIIClassification,
  FriaInput,
} from "../types.js";

type AnnexIIICategory =
  | "biometrics"
  | "critical-infrastructure"
  | "education"
  | "employment"
  | "essential-services"
  | "law-enforcement"
  | "migration-border-control"
  | "justice-democracy";

interface CategoryRule {
  category: AnnexIIICategory;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "biometrics",
    keywords: [
      "biometric",
      "face recognition",
      "facial recognition",
      "fingerprint",
      "iris",
      "voice identification",
      "remote identification",
      "emotion recognition",
    ],
  },
  {
    category: "critical-infrastructure",
    keywords: [
      "critical infrastructure",
      "electricity",
      "power grid",
      "water supply",
      "gas network",
      "traffic management",
      "transport network",
      "telecommunication",
      "emergency dispatch",
    ],
  },
  {
    category: "education",
    keywords: [
      "education",
      "school",
      "student",
      "exam",
      "admission",
      "grading",
      "learning assessment",
      "vocational training",
      "university",
    ],
  },
  {
    category: "employment",
    keywords: [
      "employment",
      "worker",
      "employee",
      "recruitment",
      "hiring",
      "cv screening",
      "promotion",
      "termination",
      "performance management",
      "work allocation",
    ],
  },
  {
    category: "essential-services",
    keywords: [
      "essential service",
      "credit score",
      "creditworthiness",
      "loan",
      "insurance",
      "social benefit",
      "welfare",
      "housing",
      "healthcare",
      "medical triage",
      "emergency service",
    ],
  },
  {
    category: "law-enforcement",
    keywords: [
      "law enforcement",
      "police",
      "crime",
      "criminal",
      "recidivism",
      "predictive policing",
      "evidence",
      "investigation",
      "suspect",
      "victim risk",
    ],
  },
  {
    category: "migration-border-control",
    keywords: [
      "migration",
      "asylum",
      "border",
      "visa",
      "immigration",
      "refugee",
      "deportation",
      "travel authorisation",
      "border control",
    ],
  },
  {
    category: "justice-democracy",
    keywords: [
      "justice",
      "court",
      "judge",
      "judicial",
      "legal research",
      "election",
      "voter",
      "democratic",
      "referendum",
      "political campaign",
    ],
  },
];

const TODO_GUIDANCE =
  "TODO: Review the intended purpose against EU AI Act Annex III and document why the system is or is not high-risk.";

export function classifyAnnexIII(input: FriaInput): AnnexIIIClassification {
  const haystack = normaliseInput(input);
  const matches = CATEGORY_RULES.map((rule) => ({
    category: rule.category,
    evidence: rule.keywords.filter((keyword) => haystack.includes(keyword)),
  })).filter((match) => match.evidence.length > 0);

  if (matches.length === 0) {
    return {
      isHighRisk: false,
      evidence: [],
      guidance: TODO_GUIDANCE,
    } as AnnexIIIClassification;
  }

  const primary = matches[0];

  return {
    isHighRisk: true,
    category: primary.category,
    evidence: primary.evidence,
    matchedCategories: matches.map((match) => match.category),
    guidance:
      "Detected Annex III indicators. Confirm scope, exemptions, provider role, and human oversight obligations.",
  } as AnnexIIIClassification;
}

function normaliseInput(input: FriaInput): string {
  const record = input as Record<string, unknown>;
  return [
    record.sector,
    record.useCase,
    record.intendedPurpose,
    record.deploymentContext,
    record.dataCategories,
  ]
    .flatMap(toTextParts)
    .join(" ")
    .toLowerCase();
}

function toTextParts(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(toTextParts);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(toTextParts);
  }

  return [];
}

