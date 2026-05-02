# @magi/annex-iv

> Generate EU AI Act Annex IV technical documentation drafts from `AGENTS.md` and codebase metadata.

`@magi/annex-iv` is a Week 2 MAGI OSS package. It scans an AI system repository, reads agent operating instructions, and produces a Markdown draft structured around the 9 Annex IV technical documentation sections.

The generated file is a draft tooling artifact and is not legal advice.

## Install

```bash
pnpm add @magi/annex-iv
```

## CLI

```bash
magi-annex-iv build \
  --root . \
  --agents-md ./AGENTS.md \
  --output ./annex-iv.md
```

If `AGENTS.md` is not present, the parser falls back to `AGENT.MD` when available. PDF export is supported through pandoc:

```bash
magi-annex-iv build --output ./annex-iv.md --pdf --pdf-output ./annex-iv.pdf
```

If pandoc is not installed, the CLI returns a clear error and leaves Markdown generation available.

## Library

```typescript
import {
  buildAnnexIvDocument,
  renderAnnexIvMarkdown,
  writeAnnexIvMarkdown,
} from "@magi/annex-iv";

const document = await buildAnnexIvDocument({
  root: ".",
  agentsMdPath: "./AGENTS.md",
});

const markdown = renderAnnexIvMarkdown(document);
await writeAnnexIvMarkdown(document, "./annex-iv.md");
```

## Out of Scope

- MAGI Audit regulator submission workflows
- RBAC, SSO, review queues, hosted dashboards
- changeset publish, dev.to/Hacker News posting, and FCM manual review
- Legal advice or compliance certification

## License

MIT, forever.

