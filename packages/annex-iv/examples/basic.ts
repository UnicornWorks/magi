import { buildAnnexIvDocument, writeAnnexIvMarkdown } from "@magi/annex-iv";

const document = await buildAnnexIvDocument({
  root: process.cwd(),
  agentsMdPath: "./AGENTS.md",
});

await writeAnnexIvMarkdown(document, "./annex-iv.md");
