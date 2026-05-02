import { resolve } from "node:path";
import { parseAgentsMd } from "../scanner/agents-md.js";
import { scanCodebase } from "../scanner/codebase.js";
import type {
  AgentsMdDocument,
  AnnexIvBuildOptions,
  AnnexIvDocument,
  AnnexIvSection,
  CodebaseScan,
} from "../types.js";
import { ANNEX_IV_SECTION_DEFINITIONS, TODO_MARKER } from "./definitions.js";

export async function buildAnnexIvDocument(
  options: AnnexIvBuildOptions = {},
): Promise<AnnexIvDocument> {
  const root = resolve(options.root ?? ".");
  const [agentsMd, codebase] = await Promise.all([
    parseAgentsMd({ root, path: options.agentsMdPath }),
    scanCodebase({ root }),
  ]);

  return {
    systemId: options.systemId ?? codebase.package?.name,
    generatedAt: options.generatedAt ?? new Date(),
    sourceRoot: root,
    agentsMd,
    codebase,
    sections: buildSections(agentsMd, codebase),
    warnings: [...agentsMd.warnings, ...codebase.warnings],
  };
}

function buildSections(
  agentsMd: AgentsMdDocument,
  codebase: CodebaseScan,
): AnnexIvSection[] {
  return ANNEX_IV_SECTION_DEFINITIONS.map((definition) => {
    const generated = sectionContent(definition.id, agentsMd, codebase);
    return {
      ...definition,
      content: generated.content,
      todos: generated.todos,
    };
  });
}

function sectionContent(
  id: AnnexIvSection["id"],
  agentsMd: AgentsMdDocument,
  codebase: CodebaseScan,
): Pick<AnnexIvSection, "content" | "todos"> {
  const todos: string[] = [];
  const missing = (label: string): string => {
    todos.push(label);
    return `${TODO_MARKER} ${label}`;
  };

  switch (id) {
    case "1-general-description":
      return {
        content: [
          field("System name", codebase.package?.name),
          field("Version", codebase.package?.version),
          field("Provider", missing("Provider identity and contact details.")),
          field(
            "Intended purpose",
            codebase.package?.description ?? agentsMd.title,
          ),
          field(
            "Forms of deployment",
            "Software package, CLI, or API integration.",
          ),
          field("User interface", "Command-line and library interfaces."),
          field(
            "Instructions for use",
            agentsMd.exists
              ? `See ${agentsMd.path}.`
              : missing("Instructions for deployers."),
          ),
        ],
        todos,
      };
    case "2-elements-and-development":
      return {
        content: [
          field(
            "Development method",
            "Generated from repository metadata, README, TypeScript exports, and AGENTS.md guidance.",
          ),
          field(
            "Architecture summary",
            codebase.readmeSummary ??
              missing("Architecture and processing summary."),
          ),
          field(
            "Type exports discovered",
            listOrTodo(
              codebase.typeExports.map(
                (item) => `${item.kind} ${item.name} (${item.file})`,
              ),
              "Design specifications and component inventory.",
              todos,
            ),
          ),
          field(
            "Models",
            listOrTodo(agentsMd.metadata.models, "Model inventory.", todos),
          ),
          field(
            "Tools",
            listOrTodo(agentsMd.metadata.tools, "Tool inventory.", todos),
          ),
          field(
            "Data requirements",
            missing("Training, validation, testing data sets and provenance."),
          ),
          field("Cybersecurity measures", missing("Cybersecurity controls.")),
        ],
        todos,
      };
    case "3-monitoring-functioning-control":
      return {
        content: [
          field(
            "Capabilities and limitations",
            codebase.readmeSummary ?? missing("Capabilities and limitations."),
          ),
          field(
            "Human oversight",
            findSectionText(agentsMd, "oversight") ??
              missing("Human oversight measures."),
          ),
          field(
            "Input data specifications",
            missing("Input data requirements."),
          ),
          field(
            "Foreseeable unintended outcomes",
            missing("Unintended outcomes and fundamental-rights risks."),
          ),
        ],
        todos,
      };
    case "4-performance-metrics":
      return {
        content: [
          field(
            "Selected metrics",
            missing("Accuracy, robustness, and cybersecurity metrics."),
          ),
          field(
            "Metric appropriateness",
            missing("Rationale for selected metrics."),
          ),
          field("Test reports", missing("Dated and signed test reports.")),
        ],
        todos,
      };
    case "5-risk-management":
      return {
        content: [
          field(
            "Risk management system",
            findSectionText(agentsMd, "risk") ??
              missing("Article 9 risk management system."),
          ),
          field(
            "Constraints",
            listOrTodo(
              agentsMd.metadata.constraints,
              "Operational constraints.",
              todos,
            ),
          ),
          field(
            "Residual risks",
            missing("Residual risks and acceptability rationale."),
          ),
        ],
        todos,
      };
    case "6-lifecycle-changes":
      return {
        content: [
          field(
            "Recent changes",
            listOrTodo(
              codebase.changeHistory.map(
                (change) => `${change.date} ${change.hash} ${change.subject}`,
              ),
              "Lifecycle change history.",
              todos,
            ),
          ),
          field(
            "Predetermined changes",
            missing("Predetermined model/system changes and controls."),
          ),
        ],
        todos,
      };
    case "7-standards":
      return {
        content: [
          field(
            "Harmonised standards",
            missing("Applied harmonised standards or alternative solutions."),
          ),
          field(
            "Technical specifications",
            missing("Other standards and technical specifications."),
          ),
        ],
        todos,
      };
    case "8-eu-declaration":
      return {
        content: [
          field(
            "EU declaration of conformity",
            missing("Copy of Article 47 declaration."),
          ),
        ],
        todos,
      };
    case "9-post-market-monitoring":
      return {
        content: [
          field(
            "Monitoring plan",
            findSectionText(agentsMd, "monitor") ??
              missing("Article 72 post-market monitoring plan."),
          ),
          field(
            "Corrective actions",
            missing("Corrective and preventive action process."),
          ),
        ],
        todos,
      };
  }
}

function field(label: string, value: string | undefined): string {
  return `- **${label}**: ${value?.trim() || TODO_MARKER}`;
}

function listOrTodo(
  values: string[] | undefined,
  todo: string,
  todos: string[],
): string {
  if (!values || values.length === 0) {
    todos.push(todo);
    return `${TODO_MARKER} ${todo}`;
  }
  return values.join("; ");
}

function findSectionText(
  agentsMd: AgentsMdDocument,
  pattern: string,
): string | undefined {
  const section = agentsMd.sections.find((item) =>
    item.title.toLowerCase().includes(pattern),
  );
  return section?.content || undefined;
}
