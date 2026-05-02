import type { Severity, SystemId } from "@magi/core";

export type { Severity, SystemId } from "@magi/core";

export type IncidentCategory =
  | "reliability"
  | "cost"
  | "safety"
  | "drift"
  | "compliance";

export type IncidentStatus = "open" | "mitigating" | "resolved" | "reported";

export interface Incident {
  id: string;
  systemId: SystemId;
  detector: string;
  severity: Severity;
  category: IncidentCategory;
  status: IncidentStatus;
  detectedAt: Date;
  resolvedAt?: Date;
  evidence: Record<string, unknown>;
  context?: Record<string, unknown>;
  metrics?: Record<string, number>;
}

export interface AgentEvent {
  systemId: SystemId;
  timestamp: Date;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  latencyMs?: number;
  toolCalls?: string[];
  input?: string;
  output?: string;
  metadata?: Record<string, unknown>;
}

export interface DetectorContext {
  recent: AgentEvent[];
  systemId: SystemId;
  now: Date;
}

export interface DetectorResult {
  severity: Severity;
  category: IncidentCategory;
  evidence: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface Detector {
  name: string;
  detect: (
    ctx: DetectorContext,
  ) => Promise<DetectorResult | null> | DetectorResult | null;
}

export interface ResponderContext {
  incident: Incident;
  notify: (severity: Severity, message: string) => Promise<void>;
  kill: () => Promise<void>;
  rollback: (opts?: { steps?: number }) => Promise<void>;
  throttle: (opts: { rate: number; durationMs: number }) => Promise<void>;
}

export interface Responder {
  name: string;
  on: IncidentCategory[] | "*";
  handle: (ctx: ResponderContext) => Promise<void>;
}

export interface Storage {
  save: (incident: Incident) => Promise<void>;
  load: (id: string) => Promise<Incident | null>;
  query: (filter: {
    systemId?: SystemId;
    since?: Date;
    limit?: number;
  }) => Promise<Incident[]>;
  recentEvents: (systemId: SystemId, since: Date) => Promise<AgentEvent[]>;
  recordEvent: (event: AgentEvent) => Promise<void>;
}

export type TrackEvent = Omit<AgentEvent, "systemId" | "timestamp">;
