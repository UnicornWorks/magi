import { describe, expect, it } from "vitest";
import { costSpikeDetector, infiniteLoopDetector } from "../src/index.js";
import type { AgentEvent } from "../src/index.js";

describe("infiniteLoopDetector", () => {
  const detector = infiniteLoopDetector({
    sameToolCallsThreshold: 3,
    withinMs: 60_000,
  });

  it("detects when the same tool is called repeatedly", async () => {
    const now = new Date();
    const events: AgentEvent[] = Array.from({ length: 5 }, (_, index) => ({
      systemId: "test",
      timestamp: new Date(now.getTime() - index * 1000),
      toolCalls: ["db.query"],
    }));

    const result = await detector.detect({
      recent: events,
      systemId: "test",
      now,
    });

    expect(result?.category).toBe("reliability");
    expect(result?.severity).toBe("high");
    expect(result?.evidence).toMatchObject({ tool: "db.query", count: 5 });
  });

  it("does not trigger below threshold", async () => {
    const now = new Date();
    const events: AgentEvent[] = [
      { systemId: "test", timestamp: now, toolCalls: ["db.query"] },
    ];

    const result = await detector.detect({
      recent: events,
      systemId: "test",
      now,
    });

    expect(result).toBeNull();
  });
});

describe("costSpikeDetector", () => {
  const detector = costSpikeDetector({
    windowMs: 60_000,
    baselineWindowMs: 24 * 60 * 60_000,
    multiplier: 2,
  });

  it("detects a cost spike", async () => {
    const now = new Date();
    const events: AgentEvent[] = [
      {
        systemId: "test",
        timestamp: new Date(now.getTime() - 30_000),
        cost: 10,
      },
      ...Array.from({ length: 23 }, (_, index) => ({
        systemId: "test",
        timestamp: new Date(now.getTime() - (index + 2) * 60 * 60_000),
        cost: 1,
      })),
    ];

    const result = await detector.detect({
      recent: events,
      systemId: "test",
      now,
    });

    expect(result?.category).toBe("cost");
    expect(result?.severity).toBe("critical");
  });

  it("does not trigger without baseline data", async () => {
    const now = new Date();
    const events: AgentEvent[] = [
      {
        systemId: "test",
        timestamp: new Date(now.getTime() - 30_000),
        cost: 10,
      },
    ];

    const result = await detector.detect({
      recent: events,
      systemId: "test",
      now,
    });

    expect(result).toBeNull();
  });
});
