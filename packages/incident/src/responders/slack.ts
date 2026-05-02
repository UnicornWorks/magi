import type { Responder } from "../types.js";

export function slackResponder(opts: { webhookUrl: string }): Responder {
  return {
    name: "slack",
    on: "*",
    handle: async ({ incident }) => {
      const text =
        `*${incident.severity.toUpperCase()}* incident in \`${incident.systemId}\`\n` +
        `Detector: \`${incident.detector}\`\n` +
        `Category: ${incident.category}\n` +
        `Evidence: \`\`\`${JSON.stringify(incident.evidence, null, 2)}\`\`\``;

      await fetch(opts.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    },
  };
}
