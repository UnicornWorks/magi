import type {
  FriaBuildOptions,
  FriaDocument,
  FriaInput,
  FriaSection,
  FriaTemplate,
} from "../types.js";
import { classifyAnnexIII } from "../classifier/annex-iii.js";
import { mapFundamentalRights } from "../rights/map.js";

export const TODO_MARKER = "TODO(manual input required)";

export type FriaTemplateId =
  | "dihr-ecnl"
  | "aligner-threat-scenario"
  | "commission-article-27";

interface TemplateSectionDefinition {
  id: string;
  title: string;
  articleRefs: string[];
  prompts: string[];
}

interface TemplateDefinition {
  id: FriaTemplateId;
  title: string;
  description: string;
  disclaimer: string;
  sections: TemplateSectionDefinition[];
}

export const FRIA_TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: "dihr-ecnl",
    title: "DIHR/ECNL-Inspired 5-Phase FRIA Guide",
    description:
      "A five-phase fundamental-rights impact assessment structure inspired by civil-society FRIA guidance.",
    disclaimer:
      "This draft is a tooling aid inspired by DIHR/ECNL FRIA guidance. It is not legal advice and is not an official DIHR, ECNL, regulator, or EU institution template.",
    sections: [
      {
        id: "phase-1-context",
        title: "Phase 1: Context and Scope",
        articleRefs: ["EU AI Act Article 27(1)", "EU Charter context"],
        prompts: [
          "Describe the AI system, deployer context, intended purpose, deployment geography, and lifecycle stage.",
          "Identify the decision points where the system may influence people, access to services, or public/private authority.",
        ],
      },
      {
        id: "phase-2-rights-screening",
        title: "Phase 2: Fundamental Rights Screening",
        articleRefs: ["EU AI Act Article 27(1)(b)", "EU Charter"],
        prompts: [
          "List affected groups, including vulnerable or marginalized groups, and explain how they may encounter the system.",
          "Map potentially affected rights and explain plausible impact pathways.",
        ],
      },
      {
        id: "phase-3-risk-analysis",
        title: "Phase 3: Risk Analysis",
        articleRefs: ["EU AI Act Article 27(1)(c)", "Annex III"],
        prompts: [
          "Assess likelihood, severity, reversibility, scale, and cumulative impacts for each material risk.",
          "Record evidence sources, assumptions, uncertainty, and dissenting stakeholder views.",
        ],
      },
      {
        id: "phase-4-mitigation",
        title: "Phase 4: Mitigation and Safeguards",
        articleRefs: ["EU AI Act Article 27(1)(d)", "Articles 9, 14, 15"],
        prompts: [
          "Define technical, organizational, human oversight, transparency, accessibility, and redress measures.",
          "Assign owners, due dates, validation evidence, and residual-risk acceptance criteria.",
        ],
      },
      {
        id: "phase-5-monitoring",
        title: "Phase 5: Monitoring, Review, and Participation",
        articleRefs: ["EU AI Act Article 27(1)(e)", "Article 72"],
        prompts: [
          "Set monitoring metrics, review cadence, incident escalation triggers, and post-deployment stakeholder feedback channels.",
          "Document when the FRIA must be refreshed, including substantial changes or new affected populations.",
        ],
      },
    ],
  },
  {
    id: "aligner-threat-scenario",
    title: "ALIGNER Threat Scenario FRIA Format",
    description:
      "A threat-scenario structure for turning misuse, failure, and rights-impact pathways into controls and evidence.",
    disclaimer:
      "This draft is a tooling aid using a threat-scenario assessment format. It is not legal advice and is not an official ALIGNER, regulator, or EU institution template.",
    sections: [
      {
        id: "scenario-summary",
        title: "Threat Scenario Summary",
        articleRefs: ["EU AI Act Article 27(1)", "Annex III"],
        prompts: [
          "Name each threat scenario, the actor or failure mode, affected population, triggering condition, and impact horizon.",
          "State whether the scenario arises from intended use, reasonably foreseeable misuse, model error, data issue, or operational failure.",
        ],
      },
      {
        id: "assets-and-rights",
        title: "Assets, Rights, and Harm Pathways",
        articleRefs: ["EU AI Act Article 27(1)(b)", "EU Charter"],
        prompts: [
          "Identify protected assets, fundamental rights, procedural safeguards, and trust relationships at stake.",
          "Explain the causal chain from system behavior to rights impact.",
        ],
      },
      {
        id: "threat-controls",
        title: "Controls and Detection",
        articleRefs: ["EU AI Act Articles 9, 14, 15, 26, 27"],
        prompts: [
          "List preventive, detective, corrective, and compensating controls for each scenario.",
          "Define monitoring signals, audit logs, review thresholds, and escalation paths.",
        ],
      },
      {
        id: "residual-risk",
        title: "Residual Risk Decision",
        articleRefs: ["EU AI Act Article 27(1)(d)"],
        prompts: [
          "Record residual risk, accountable approver, rationale, conditions for deployment, and rollback criteria.",
          "Document unresolved assumptions and evidence still required before release.",
        ],
      },
    ],
  },
  {
    id: "commission-article-27",
    title: "Article 27 Minimum Questionnaire Draft",
    description:
      "A practical minimum questionnaire aligned to Article 27 FRIA topics. This does not claim to be an official AI Office template.",
    disclaimer:
      "This is an Article 27-aligned draft questionnaire for internal preparation. It is not legal advice and does not claim to be an official European Commission or AI Office template.",
    sections: [
      {
        id: "deployer-and-system",
        title: "Deployer and System Identification",
        articleRefs: ["EU AI Act Article 27(1)"],
        prompts: [
          "Identify the deployer, provider if known, AI system name, version, intended purpose, and deployment context.",
          "Describe the natural persons and groups likely to be affected.",
        ],
      },
      {
        id: "use-and-duration",
        title: "Use, Frequency, and Duration",
        articleRefs: ["EU AI Act Article 27(1)(a)"],
        prompts: [
          "State when, how often, and for how long the system will be used.",
          "Describe whether use is pilot, production, one-off, recurring, or continuous.",
        ],
      },
      {
        id: "categories-and-impact",
        title: "Categories of Persons and Likely Impact",
        articleRefs: ["EU AI Act Article 27(1)(b)"],
        prompts: [
          "List affected categories of natural persons and groups, including workers, students, applicants, patients, migrants, consumers, or public-service users where relevant.",
          "Explain likely impacts on access, treatment, ranking, eligibility, monitoring, or procedural rights.",
        ],
      },
      {
        id: "specific-risks",
        title: "Specific Risks of Harm",
        articleRefs: ["EU AI Act Article 27(1)(c)", "EU Charter"],
        prompts: [
          "Identify specific risks to fundamental rights, discrimination, privacy, dignity, autonomy, effective remedy, and due process.",
          "State expected severity, likelihood, affected scale, and uncertainty.",
        ],
      },
      {
        id: "risk-mitigation",
        title: "Risk Mitigation and Governance",
        articleRefs: ["EU AI Act Article 27(1)(d)", "Articles 26, 72"],
        prompts: [
          "Describe human oversight, transparency notices, accessibility measures, complaint channels, documentation, monitoring, and incident response.",
          "Assign control owners and evidence to be retained.",
        ],
      },
    ],
  },
];

export function listFriaTemplates(): FriaTemplate[] {
  return FRIA_TEMPLATE_DEFINITIONS.map((template) => template as unknown as FriaTemplate);
}

export function getFriaTemplate(templateId: FriaTemplateId | string): FriaTemplate {
  const template = FRIA_TEMPLATE_DEFINITIONS.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(
      `Unknown FRIA template "${templateId}". Expected one of: ${FRIA_TEMPLATE_DEFINITIONS.map((item) => item.id).join(", ")}`,
    );
  }
  return template as unknown as FriaTemplate;
}

export function buildFriaDocument(
  input: FriaInput,
  options?: FriaBuildOptions,
): FriaDocument {
  const source = input as FriaInput & Record<string, unknown>;
  const build = (options ?? {}) as FriaBuildOptions & Record<string, unknown>;
  const templateId = stringValue(build.templateId) ?? stringValue(source.templateId) ?? "dihr-ecnl";
  const template = getFriaTemplate(templateId) as unknown as TemplateDefinition;
  const selectedSectionIds = arrayValue(build.sectionIds ?? source.sectionIds);
  const selectedSections = selectedSectionIds.length
    ? template.sections.filter((section) => selectedSectionIds.includes(section.id))
    : template.sections;

  const document = {
    templateId: template.id,
    templateTitle: template.title,
    generatedAt: dateValue(build.generatedAt) ?? new Date(),
    status: "draft",
    disclaimer: template.disclaimer,
    input: source,
    metadata: {
      systemName: stringValue(source.systemName) ?? stringValue(source.name) ?? TODO_MARKER,
      deployer: stringValue(source.deployer) ?? TODO_MARKER,
      sector: stringValue(source.sector) ?? TODO_MARKER,
      intendedPurpose: stringValue(source.intendedPurpose) ?? TODO_MARKER,
    },
    highRiskClassification: highRiskClassification(source),
    rightsMapping: rightsMapping(source),
    sections: selectedSections.map((section) => buildSection(section, source)),
    reviewChecklist: [
      "Confirm Article 27 applicability and role allocation with qualified counsel.",
      "Validate high-risk classification against the final system purpose and deployment context.",
      "Review rights mapping with affected stakeholders or their representatives where appropriate.",
      "Replace every TODO marker with evidence-backed manual input before external use.",
      "Record approval, residual-risk decision, monitoring cadence, and next review date.",
    ],
  };

  return document as unknown as FriaDocument;
}

function buildSection(
  definition: TemplateSectionDefinition,
  input: Record<string, unknown>,
): FriaSection {
  const sectionInputs = input.sections as Record<string, unknown> | undefined;
  const manual = sectionInputs?.[definition.id];
  const content = Array.isArray(manual)
    ? manual.map(String)
    : typeof manual === "string"
      ? [manual]
      : definition.prompts.map((prompt) => `${prompt} ${TODO_MARKER}.`);

  return {
    id: definition.id,
    title: definition.title,
    articleRefs: definition.articleRefs,
    content,
    todos: content.some((line) => line.includes(TODO_MARKER))
      ? [`Complete manual inputs for ${definition.title}.`]
      : [],
  } as unknown as FriaSection;
}

function highRiskClassification(input: Record<string, unknown>): Record<string, unknown> {
  const explicit = input.highRiskClassification;
  if (explicit && typeof explicit === "object") return explicit as Record<string, unknown>;

  const classification = classifyAnnexIII(input as unknown as FriaInput) as unknown as Record<
    string,
    unknown
  >;
  const matchedCategories = arrayValue(classification.matchedCategories);
  const primaryCategory = stringValue(classification.category);
  const annexIII = matchedCategories.length > 0
    ? matchedCategories
    : primaryCategory
      ? [primaryCategory]
      : [];

  return {
    result: classification.isHighRisk === true ? "potentially-high-risk" : "undetermined",
    annexIII,
    evidence: arrayValue(classification.evidence),
    rationale: stringValue(classification.guidance) ?? `${TODO_MARKER}: provide Annex III classification rationale.`,
  };
}

function rightsMapping(input: Record<string, unknown>): Array<Record<string, string>> {
  const explicit = input.rightsMapping;
  if (Array.isArray(explicit)) return explicit as Array<Record<string, string>>;

  const rights = mapFundamentalRights(input as unknown as FriaInput) as unknown[];
  const mapped = rights.map((right) => {
    const record = right as Record<string, unknown>;
    return {
      right: stringValue(record.label) ?? stringValue(record.id) ?? TODO_MARKER,
      impactPathway: arrayValue(record.riskPrompts).join(" ") || TODO_MARKER,
    };
  });
  if (mapped.length > 0) return mapped;

  return [
    {
      right: "Non-discrimination",
      impactPathway: `Assess differential outcomes for affected groups: ${arrayValue(input.affectedGroups).join(", ") || TODO_MARKER}.`,
    },
    {
      right: "Privacy and data protection",
      impactPathway: "Assess data collection, inference, retention, access, and transparency impacts.",
    },
    {
      right: "Good administration and effective remedy",
      impactPathway: "Assess notice, contestability, human review, complaint, and appeal mechanisms.",
    },
  ];
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function arrayValue(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter((item) => item.trim().length > 0);
}

function dateValue(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return undefined;
}
