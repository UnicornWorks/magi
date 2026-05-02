import {
  MagiIncident,
  costSpikeDetector,
  infiniteLoopDetector,
  jsonlStorage,
  logResponder,
} from "@magi/incident";

const magi = new MagiIncident({
  systemId: "fcm-driver-screening",
  storage: jsonlStorage({
    incidentsPath: "./incidents.jsonl",
    eventsPath: "./events.jsonl",
  }),
  detectors: [
    infiniteLoopDetector({ sameToolCallsThreshold: 10, withinMs: 60_000 }),
    costSpikeDetector({ multiplier: 3 }),
  ],
  responders: [logResponder()],
});

await magi.record({
  model: "claude-opus-4-7",
  inputTokens: 3000,
  outputTokens: 800,
  cost: 0.045,
  latencyMs: 2300,
  toolCalls: ["db.query", "slack.send"],
});

await magi.runDetection();
