import type { Responder, Severity } from "../types.js";

export interface KillSwitchOptions {
  severityThreshold?: Severity;
  onKill: () => Promise<void> | void;
}

export function killSwitchResponder(opts: KillSwitchOptions): Responder {
  const threshold = opts.severityThreshold ?? "critical";
  const order: Severity[] = ["low", "medium", "high", "critical"];

  return {
    name: "kill-switch",
    on: "*",
    handle: async ({ incident }) => {
      const incidentLevel = order.indexOf(incident.severity);
      const thresholdLevel = order.indexOf(threshold);
      if (incidentLevel >= thresholdLevel) {
        await opts.onKill();
      }
    },
  };
}
