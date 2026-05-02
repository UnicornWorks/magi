import { describe, expect, it, vi } from "vitest";
import {
  MagiIncident,
  infiniteLoopDetector,
  logResponder,
  memoryStorage,
} from "../src/index.js";

describe("MagiIncident integration", () => {
  it("triggers responders when a detector fires", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const storage = memoryStorage();

    const magi = new MagiIncident({
      systemId: "test-system",
      storage,
      detectors: [
        infiniteLoopDetector({ sameToolCallsThreshold: 2, withinMs: 60_000 }),
      ],
      responders: [logResponder()],
    });

    await magi.record({ toolCalls: ["api.call"] });
    await magi.record({ toolCalls: ["api.call"] });
    await magi.record({ toolCalls: ["api.call"] });

    const incidents = await magi.runDetection();

    expect(incidents).toHaveLength(1);
    expect(incidents[0]?.detector).toBe("infinite-loop");
    expect(consoleWarn).toHaveBeenCalled();

    consoleWarn.mockRestore();
  });

  it("tracks a wrapped AI SDK operation as an agent event", async () => {
    const storage = memoryStorage();
    const magi = new MagiIncident({
      systemId: "test-system",
      storage,
      detectors: [],
      responders: [],
    });

    const result = await magi.track(
      async () => ({
        text: "ok",
        usage: { promptTokens: 12, completionTokens: 5 },
      }),
      { model: "test-model", cost: 0.01 },
    );

    const events = await storage.recentEvents(
      "test-system",
      new Date(Date.now() - 1000),
    );
    expect(result.text).toBe("ok");
    expect(events[0]).toMatchObject({
      model: "test-model",
      inputTokens: 12,
      outputTokens: 5,
      cost: 0.01,
    });
  });
});
