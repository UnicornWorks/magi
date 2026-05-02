// Common types shared across @magi/* packages.

export type SystemId = string;

export type RiskLevel = "minimal" | "limited" | "high" | "unacceptable";

export type Severity = "low" | "medium" | "high" | "critical";

export interface MagiConfig {
  systemId: SystemId;
  riskLevel?: RiskLevel;
}

export const MAGI_VERSION = "0.1.0";
