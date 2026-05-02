import type { Responder } from "../types.js";

export function logResponder(): Responder {
  return {
    name: "log",
    on: "*",
    handle: async ({ incident }) => {
      console.warn(
        `[magi/incident] ${incident.severity.toUpperCase()} ` +
          `${incident.category}/${incident.detector}: ${JSON.stringify(incident.evidence)}`,
      );
    },
  };
}
