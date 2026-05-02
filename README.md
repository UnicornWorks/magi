# MAGI OSS Family

> The OSS family for running AI agents under EU AI Act.

MAGI OSS is a permanent MIT-licensed runtime layer for AI agent SRE and compliance. Week 1 ships `@magi/incident`, Week 2 ships `@magi/annex-iv`, and Week 3 ships `@magi/fria-forge` for local FRIA drafting.

## Packages

- `@magi/core`: shared types used across the MAGI OSS family.
- `@magi/incident`: self-hostable incident management for AI agents.
- `@magi/annex-iv`: EU AI Act Annex IV technical documentation drafts from `AGENTS.md` and codebase metadata.
- `@magi/fria-forge`: Fundamental Rights Impact Assessment drafts from local project metadata.

Planned packages include `@magi/post-market`.

## CLIs

- `magi-annex-iv`: generate Annex IV technical documentation drafts.
- `magi-fria-forge`: generate FRIA draft Markdown for external legal review.

Generated compliance documents are draft tooling artifacts, not legal advice.

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
