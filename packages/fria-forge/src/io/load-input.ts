import { readFile } from "node:fs/promises";
import type { AffectedGroup, FriaInput, MitigationMeasure } from "../types.js";

export async function loadFriaInput(path: string): Promise<FriaInput> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  return normalizeFriaInput(parsed);
}

export function normalizeFriaInput(raw: Record<string, unknown>): FriaInput {
  const systemName =
    stringValue(raw.systemName) ??
    stringValue((raw.system as Record<string, unknown> | undefined)?.name) ??
    stringValue(raw.name);

  if (!systemName) {
    throw new Error("FRIA input requires systemName.");
  }

  return {
    systemId: stringValue(raw.systemId),
    systemName,
    provider: stringValue(raw.provider),
    deployer: stringValue(raw.deployer),
    intendedPurpose: stringValue(raw.intendedPurpose),
    sector: stringValue(raw.sector),
    useCase: stringValue(raw.useCase),
    affectedGroups: affectedGroups(raw.affectedGroups),
    deploymentContext: stringValue(raw.deploymentContext),
    dataCategories: stringArray(raw.dataCategories),
    oversightMeasures: stringArray(raw.oversightMeasures),
    mitigations: mitigations(raw.mitigations),
    template: templateValue(raw.template),
    usagePeriod: stringValue(raw.usagePeriod),
    usageFrequency: stringValue(raw.usageFrequency),
    complaintMechanisms: stringArray(raw.complaintMechanisms),
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

function affectedGroups(value: unknown): AffectedGroup[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const groups = value.flatMap((item): AffectedGroup[] => {
    if (typeof item === "string" && item.trim()) {
      return [{ name: item.trim() }];
    }
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const name = stringValue(record.name);
    if (!name) return [];
    return [
      {
        name,
        description: stringValue(record.description),
        vulnerabilityFactors: stringArray(record.vulnerabilityFactors),
      },
    ];
  });
  return groups.length > 0 ? groups : undefined;
}

function mitigations(value: unknown): MitigationMeasure[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const measures = value.flatMap((item): MitigationMeasure[] => {
    if (typeof item === "string" && item.trim()) {
      return [{ name: item.trim() }];
    }
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const name = stringValue(record.name);
    if (!name) return [];
    return [
      {
        name,
        description: stringValue(record.description),
        owner: stringValue(record.owner),
        status: statusValue(record.status),
      },
    ];
  });
  return measures.length > 0 ? measures : undefined;
}

function templateValue(value: unknown): FriaInput["template"] {
  if (
    value === "dihr-ecnl" ||
    value === "aligner" ||
    value === "commission"
  ) {
    return value;
  }
  return undefined;
}

function statusValue(value: unknown): MitigationMeasure["status"] | undefined {
  if (
    value === "planned" ||
    value === "implemented" ||
    value === "needs-review"
  ) {
    return value;
  }
  return undefined;
}
