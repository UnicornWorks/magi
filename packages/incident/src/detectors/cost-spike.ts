import type { Detector } from "../types.js";

export interface CostSpikeOptions {
  windowMs?: number;
  baselineWindowMs?: number;
  multiplier?: number;
}

export function costSpikeDetector(opts: CostSpikeOptions = {}): Detector {
  const window = opts.windowMs ?? 5 * 60_000;
  const baseline = opts.baselineWindowMs ?? 24 * 60 * 60_000;
  const multiplier = opts.multiplier ?? 3;

  return {
    name: "cost-spike",
    detect: ({ recent, now }) => {
      const winCut = now.getTime() - window;
      const baseCut = now.getTime() - baseline;

      const winEvents = recent.filter(
        (event) => event.timestamp.getTime() > winCut,
      );
      const baseEvents = recent.filter((event) => {
        const timestamp = event.timestamp.getTime();
        return timestamp > baseCut && timestamp <= winCut;
      });

      const winCost = winEvents.reduce(
        (sum, event) => sum + (event.cost ?? 0),
        0,
      );
      const baseCost = baseEvents.reduce(
        (sum, event) => sum + (event.cost ?? 0),
        0,
      );
      if (baseEvents.length === 0 || baseCost === 0) return null;

      const winRate = winCost / window;
      const baseRate = baseCost / (baseline - window);

      if (winRate > baseRate * multiplier) {
        return {
          severity: winRate > baseRate * multiplier * 2 ? "critical" : "high",
          category: "cost",
          evidence: {
            winCostUsd: winCost,
            baselineRateUsdPerMs: baseRate,
            currentRateUsdPerMs: winRate,
            multiplier: winRate / baseRate,
          },
        };
      }

      return null;
    },
  };
}
