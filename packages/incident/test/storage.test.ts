import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { jsonlStorage, memoryStorage } from "../src/index.js";
import type { Incident } from "../src/index.js";

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "incident-1",
    systemId: "system-1",
    detector: "test-detector",
    severity: "high",
    category: "reliability",
    status: "open",
    detectedAt: new Date("2026-05-01T00:00:00.000Z"),
    evidence: { ok: true },
    ...overrides,
  };
}

describe("memoryStorage", () => {
  it("saves, loads, queries, and returns recent events", async () => {
    const storage = memoryStorage();
    const incident = makeIncident();
    const now = new Date();

    await storage.save(incident);
    await storage.recordEvent({
      systemId: "system-1",
      timestamp: now,
      toolCalls: ["db.query"],
    });

    await expect(storage.load(incident.id)).resolves.toEqual(incident);
    await expect(storage.query({ systemId: "system-1" })).resolves.toHaveLength(
      1,
    );
    await expect(
      storage.recentEvents("system-1", new Date(now.getTime() - 1000)),
    ).resolves.toHaveLength(1);
  });
});

describe("jsonlStorage", () => {
  it("persists incidents and events as JSONL", async () => {
    const dir = await mkdtemp(join(tmpdir(), "magi-incident-"));
    const storage = jsonlStorage({
      incidentsPath: join(dir, "incidents.jsonl"),
      eventsPath: join(dir, "events.jsonl"),
    });
    const incident = makeIncident();
    const now = new Date();

    try {
      await storage.save(incident);
      await storage.recordEvent({
        systemId: "system-1",
        timestamp: now,
        cost: 1.23,
      });

      const loaded = await storage.load(incident.id);
      const events = await storage.recentEvents(
        "system-1",
        new Date(now.getTime() - 1000),
      );

      expect(loaded).toEqual(incident);
      expect(await storage.query({ systemId: "system-1" })).toHaveLength(1);
      expect(events).toHaveLength(1);
      expect(events[0]?.timestamp).toBeInstanceOf(Date);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
