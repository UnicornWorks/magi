# @magi/incident

> Self-hostable incident management for AI agents. EU AI Act ready.

[![npm](https://img.shields.io/npm/v/@magi/incident)](https://npmjs.com/package/@magi/incident)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why @magi/incident?

LLM observability tools help you debug. Traditional incident management does not understand AI agents.

`@magi/incident` fills the gap: detect, respond, and document AI agent incidents, built from production lessons running autonomous agents 24/7.

## Features

- AI-aware detectors: infinite loops and cost spikes in v0.1
- Auto-response: log, Slack webhook, and severity-based kill switch
- Storage agnostic: memory and JSONL in v0.1
- Framework agnostic: works with any AI SDK
- EU AI Act ready foundation for future Article 73 exports

## Install

```bash
npm install @magi/incident
pnpm add @magi/incident
```

## Quick Start

```typescript
import {
  MagiIncident,
  costSpikeDetector,
  infiniteLoopDetector,
  jsonlStorage,
  logResponder,
} from "@magi/incident"

const magi = new MagiIncident({
  systemId: "my-agent",
  storage: jsonlStorage({
    incidentsPath: "./incidents.jsonl",
    eventsPath: "./events.jsonl",
  }),
  detectors: [
    infiniteLoopDetector({ sameToolCallsThreshold: 10, withinMs: 60_000 }),
    costSpikeDetector({ multiplier: 3 }),
  ],
  responders: [logResponder()],
})

await magi.record({
  model: "claude-opus-4-7",
  cost: 0.045,
  toolCalls: ["db.query"],
})

const incidents = await magi.runDetection()

magi.start()
```

## Track AI SDK Calls

```typescript
const result = await magi.track(
  () =>
    generateText({
      model,
      prompt: "Summarize this incident.",
    }),
  { model: "claude-opus-4-7", metadata: { sessionId: "session-1" } },
)
```

## Detectors

`infiniteLoopDetector` watches recent tool calls for repeated use of the same tool within a configurable window.

`costSpikeDetector` compares current spend rate against a baseline window and emits high or critical cost incidents.

## Responders

`logResponder` writes incidents to `console.warn`.

`slackResponder` sends a Slack incoming webhook payload.

`killSwitchResponder` calls your `onKill` callback when severity meets or exceeds the configured threshold.

## Storage

`memoryStorage` is useful for tests and short-lived processes.

`jsonlStorage` persists incidents and agent events to append-only JSONL files.

## License

MIT, forever. We commit to never relicense the core OSS.

## Roadmap

- v0.2: Postmortem generation, drift and hallucination detectors
- v0.3: Postgres and Supabase storage, LangChain adapter
- v0.5: Article 73 export, hash chain opt-in
- v1.0: Production hardening
