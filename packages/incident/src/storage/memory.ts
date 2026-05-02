import type { AgentEvent, Incident, Storage, SystemId } from "../types.js";

export function memoryStorage(): Storage {
  const incidents = new Map<string, Incident>();
  const events: AgentEvent[] = [];

  return {
    save: async (incident) => {
      incidents.set(incident.id, incident);
    },
    load: async (id) => incidents.get(id) ?? null,
    query: async ({ systemId, since, limit = 100 }) => {
      let results = Array.from(incidents.values());
      if (systemId)
        results = results.filter((incident) => incident.systemId === systemId);
      if (since)
        results = results.filter((incident) => incident.detectedAt >= since);
      return results.slice(0, limit);
    },
    recentEvents: async (systemId: SystemId, since: Date) => {
      return events.filter(
        (event) => event.systemId === systemId && event.timestamp >= since,
      );
    },
    recordEvent: async (event) => {
      events.push(event);
      if (events.length > 10_000) events.splice(0, events.length - 10_000);
    },
  };
}
