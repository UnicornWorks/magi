import { randomUUID } from "node:crypto";
import type {
  AgentEvent,
  Detector,
  DetectorResult,
  Incident,
  Responder,
  Storage,
  SystemId,
  TrackEvent,
} from "./types.js";

export interface MagiIncidentConfig {
  systemId: SystemId;
  storage: Storage;
  detectors: Detector[];
  responders: Responder[];
  detectionIntervalMs?: number;
}

export class MagiIncident {
  private config: Required<MagiIncidentConfig>;
  private intervalHandle?: ReturnType<typeof setInterval>;

  constructor(config: MagiIncidentConfig) {
    this.config = {
      detectionIntervalMs: 10_000,
      ...config,
    };
  }

  async record(
    event: Omit<AgentEvent, "systemId" | "timestamp">,
  ): Promise<void> {
    await this.config.storage.recordEvent({
      systemId: this.config.systemId,
      timestamp: new Date(),
      ...event,
    });
  }

  async track<TResult>(
    operation: () => Promise<TResult> | TResult,
    event: TrackEvent = {},
  ): Promise<TResult> {
    const startedAt = Date.now();
    try {
      const result = await operation();
      await this.record({
        ...inferEventFromResult(result),
        ...event,
        latencyMs: event.latencyMs ?? Date.now() - startedAt,
        metadata: {
          ...event.metadata,
          status: "ok",
        },
      });
      return result;
    } catch (error) {
      await this.record({
        ...event,
        latencyMs: event.latencyMs ?? Date.now() - startedAt,
        metadata: {
          ...event.metadata,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  async runDetection(): Promise<Incident[]> {
    const now = new Date();
    const lookback = new Date(now.getTime() - 60 * 60 * 1000);
    const recent = await this.config.storage.recentEvents(
      this.config.systemId,
      lookback,
    );

    const triggered: Incident[] = [];
    for (const detector of this.config.detectors) {
      const result = await detector.detect({
        recent,
        systemId: this.config.systemId,
        now,
      });
      if (result) {
        const incident = this.createIncident(detector.name, result);
        await this.config.storage.save(incident);
        await this.dispatchResponders(incident);
        triggered.push(incident);
      }
    }
    return triggered;
  }

  start(): void {
    if (this.intervalHandle) return;
    this.intervalHandle = setInterval(() => {
      this.runDetection().catch((err: unknown) => {
        console.error("[magi/incident] detection error:", err);
      });
    }, this.config.detectionIntervalMs);
  }

  stop(): void {
    if (!this.intervalHandle) return;
    clearInterval(this.intervalHandle);
    this.intervalHandle = undefined;
  }

  private createIncident(
    detectorName: string,
    result: DetectorResult,
  ): Incident {
    return {
      id: randomUUID(),
      systemId: this.config.systemId,
      detector: detectorName,
      severity: result.severity,
      category: result.category,
      status: "open",
      detectedAt: new Date(),
      evidence: result.evidence,
      context: result.context,
    };
  }

  private async dispatchResponders(incident: Incident): Promise<void> {
    const matching = this.config.responders.filter(
      (responder) =>
        responder.on === "*" || responder.on.includes(incident.category),
    );

    for (const responder of matching) {
      try {
        await responder.handle({
          incident,
          notify: async () => undefined,
          kill: async () => undefined,
          rollback: async () => undefined,
          throttle: async () => undefined,
        });
      } catch (err) {
        console.error(
          `[magi/incident] responder ${responder.name} failed:`,
          err,
        );
      }
    }
  }
}

function inferEventFromResult(result: unknown): Partial<TrackEvent> {
  if (!result || typeof result !== "object") return {};

  const maybeResult = result as {
    model?: unknown;
    usage?: {
      promptTokens?: unknown;
      completionTokens?: unknown;
      inputTokens?: unknown;
      outputTokens?: unknown;
    };
  };
  const usage = maybeResult.usage;

  return {
    model:
      typeof maybeResult.model === "string" ? maybeResult.model : undefined,
    inputTokens: asNumber(usage?.inputTokens ?? usage?.promptTokens),
    outputTokens: asNumber(usage?.outputTokens ?? usage?.completionTokens),
  };
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}
