import type { Detector } from "../types.js";

export interface InfiniteLoopOptions {
  sameToolCallsThreshold?: number;
  withinMs?: number;
}

export function infiniteLoopDetector(opts: InfiniteLoopOptions = {}): Detector {
  const threshold = opts.sameToolCallsThreshold ?? 10;
  const window = opts.withinMs ?? 60_000;

  return {
    name: "infinite-loop",
    detect: ({ recent, now }) => {
      const cutoff = now.getTime() - window;
      const events = recent.filter(
        (event) => event.timestamp.getTime() > cutoff,
      );

      const toolCounts = new Map<string, number>();
      for (const event of events) {
        for (const tool of event.toolCalls ?? []) {
          toolCounts.set(tool, (toolCounts.get(tool) ?? 0) + 1);
        }
      }

      for (const [tool, count] of toolCounts) {
        if (count >= threshold) {
          return {
            severity: "high",
            category: "reliability",
            evidence: { tool, count, windowMs: window },
          };
        }
      }

      return null;
    },
  };
}
