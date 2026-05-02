import { appendFile, readFile } from "node:fs/promises";
import type { AgentEvent, Incident, Storage } from "../types.js";

type SerializedAgentEvent = Omit<AgentEvent, "timestamp"> & {
  timestamp: string;
};
type SerializedIncident = Omit<Incident, "detectedAt" | "resolvedAt"> & {
  detectedAt: string;
  resolvedAt?: string;
};

function parseEvent(line: string): AgentEvent {
  const event = JSON.parse(line) as SerializedAgentEvent;
  return { ...event, timestamp: new Date(event.timestamp) };
}

function parseIncident(line: string): Incident {
  const incident = JSON.parse(line) as SerializedIncident;
  return {
    ...incident,
    detectedAt: new Date(incident.detectedAt),
    resolvedAt: incident.resolvedAt ? new Date(incident.resolvedAt) : undefined,
  };
}

export function jsonlStorage(opts: {
  incidentsPath: string;
  eventsPath: string;
}): Storage {
  return {
    save: async (incident) => {
      await appendFile(opts.incidentsPath, `${JSON.stringify(incident)}\n`);
    },
    load: async (id) => {
      try {
        const content = await readFile(opts.incidentsPath, "utf8");
        for (const line of content.split("\n").filter(Boolean)) {
          const incident = parseIncident(line);
          if (incident.id === id) return incident;
        }
      } catch {
        return null;
      }
      return null;
    },
    query: async ({ systemId, since, limit = 100 }) => {
      try {
        const content = await readFile(opts.incidentsPath, "utf8");
        let results = content.split("\n").filter(Boolean).map(parseIncident);
        if (systemId)
          results = results.filter(
            (incident) => incident.systemId === systemId,
          );
        if (since)
          results = results.filter((incident) => incident.detectedAt >= since);
        return results.slice(-limit);
      } catch {
        return [];
      }
    },
    recentEvents: async (systemId, since) => {
      try {
        const content = await readFile(opts.eventsPath, "utf8");
        return content
          .split("\n")
          .filter(Boolean)
          .map(parseEvent)
          .filter(
            (event) => event.systemId === systemId && event.timestamp >= since,
          );
      } catch {
        return [];
      }
    },
    recordEvent: async (event) => {
      await appendFile(opts.eventsPath, `${JSON.stringify(event)}\n`);
    },
  };
}
