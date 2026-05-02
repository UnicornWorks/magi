# MAGI OSS Family

> The OSS family for running AI agents under EU AI Act.

MAGI OSS is a permanent MIT-licensed runtime layer for AI agent SRE and compliance. The Week 1 v0.1 scope ships the monorepo foundation plus the first package, `@magi/incident`, with loop and cost-spike detection, responders, storage adapters, tests, and examples.

## Packages

- `@magi/core`: shared types used across the MAGI OSS family.
- `@magi/incident`: self-hostable incident management for AI agents.
- `@magi/annex-iv`: EU AI Act Annex IV technical documentation drafts from `AGENTS.md` and codebase metadata.

Planned packages include `@magi/fria-forge` and `@magi/post-market`.

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm type-check
pnpm lint
```

## License

MIT, forever. Commercial workflow and organization features belong in MAGI Audit, not in the OSS runtime packages.
