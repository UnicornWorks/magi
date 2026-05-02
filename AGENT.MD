# MAGI OSS Agent Operating Manual

Use this file as the short practical guide for future agents working in this repository. It distills `docs/00_executive_summary.md` through `docs/05_IMPLEMENTATION_PLAN (1).md`.

## Mission

MAGI OSS is a family of MIT runtime packages for AI-agent SRE and EU AI Act compliance. It helps teams detect agent failures, respond safely, generate postmortems, and produce compliance artifacts while remaining self-hostable and production-ready.

Primary packages:

- `@magi/incident`: incident-as-code for AI agents.
- `@magi/annex-iv`: technical documentation generation.
- `@magi/fria-forge`: FRIA generation.
- `@magi/post-market`: post-market monitoring.

The flagship first package is `@magi/incident`: a self-hostable incident framework for autonomous AI agents, inspired by NERV/CASPER production experience.

## Non-Negotiable License Policy

All MAGI OSS packages are MIT, permanently.

Do:

- Keep runtime capabilities complete in OSS.
- Allow commercial production use.
- Keep data portable between OSS and MAGI Audit.
- Use DCO-style lightweight contribution assumptions unless instructed otherwise.

Do not:

- Add BSL, source-available, open-core, enterprise-only, or future relicensing language.
- Move existing OSS runtime features behind MAGI Audit.
- Add telemetry, lock-in, or upgrade nags.
- Create enterprise package names under `@magi/*`.

## OSS vs MAGI Audit

OSS is runtime. MAGI Audit is proprietary workflow and compliance platform.

OSS includes:

- Detectors, responders, postmortem generation, storage adapters, framework adapters, CLIs, and exports.
- Self-hosted production operation.
- Manual EU AI Act compliance outputs.
- Opt-in tamper evidence such as hash chains.

MAGI Audit includes:

- Multi-system and multi-tenant dashboards.
- Multi-user review, assignment, approval chains, RBAC, and SSO.
- Regulator submission workflows, auditor views, CE marking workflows, and attestations.
- 10-year managed retention, deletion proof, SOC 2, SLA, customer success, and support.
- Integration with the wider MAGI Product Family.

Boundary test: if the feature is about embedded code/runtime, it is OSS. If it is about organizational workflow, regulator-facing submission, or hosted legal responsibility, it belongs in MAGI Audit.

## Competitive Stance

MAGI OSS wins by combining AI-agent SRE with compliance:

- Against Langfuse/Braintrust/Phoenix: do not compete on tracing; integrate alongside them for operations and compliance.
- Against Helicone/Bifrost: they are gateways; MAGI is agent/application SRE.
- Against Grafana OnCall/Keep/OneUptime: they are generic incident tools; MAGI understands agent loops, cost spikes, hallucination, and drift.
- Against AgentGuard/budget tools: they are single-purpose; MAGI connects detection, response, postmortem, and compliance.
- Against commercial GRC: MAGI OSS is free, programmable, and self-hostable.
- Against Article 12 audit-log packages: MAGI covers broader Articles 12, 27, 72, and 73 plus SRE.

Preferred pitch: "The OSS family for running AI agents under the EU AI Act."

## Week 1 v0.1 Implementation Scope

Focus on `@magi/incident` v0.1.0 and repo foundations.

Expected foundation:

- pnpm workspace.
- Turborepo.
- Biome.
- Vitest.
- TypeScript strict mode.
- Changesets.
- CI for build, test, lint, type-check.

Expected package work:

- `@magi/core` with shared types.
- `@magi/incident` with core types and `MagiIncident`.
- Detectors: `infinite-loop`, `cost-spike`.
- Responders: `SlackResponder`, `KillSwitchResponder`, `LogResponder`.
- Storage: `MemoryStorage`, `JSONLStorage`.
- Vercel AI SDK wrapper.
- README and examples with NERV/CASPER framing.

Week 1 done means the package builds, tests, has practical examples, and is publish-ready as `@magi/incident@0.1.0`.

## Week 2 v0.1 Implementation Scope

Focus on `@magi/annex-iv` v0.1.0.

Expected package work:

- Package: `@magi/annex-iv`.
- CLI: `magi-annex-iv`.
- Annex IV 9-section draft generator for technical documentation.
- Local repo input plus user metadata.
- Agent-doc discovery that prefers `AGENTS.md` and falls back to `AGENT.MD`.
- Markdown as the primary output.
- Pandoc PDF wrapper: create PDF when pandoc is installed; otherwise keep Markdown and show a clear install/usage hint.
- README and examples for manual, self-hosted compliance drafting.

Week 2 done means the package builds, tests, and the CLI can generate a complete 9-section Annex IV draft from sample repo context. PDF export is best-effort and must not block Markdown generation.

## Explicitly Out Of Scope

Avoid scope creep. Unless a later task explicitly says otherwise, do not build:

- MAGI Audit SaaS code or dashboards.
- Stripe/pricing, beta onboarding, or hosted product workflows.
- SSO, RBAC, approval chains, regulator submission, auditor views, or enterprise support features.
- 10-year retention guarantees, SOC 2 claims, managed object lock, or managed signing.
- BSL/enterprise variants.
- Other package implementations beyond assigned placeholders.
- v0.2+ features such as Supabase/Postgres storage, LangChain/Mastra wrappers, hallucination/drift detectors, LLM RCA, UI, or OpenTelemetry.
- External publish/blog/CMS flows, FCM or push-notification review, or marketing automation.
- Legal advice. Drafts and exports are tooling, not counsel.

## Main/Worker Orchestration

The main agent is the orchestrator. Workers are implementation executors.

Rules:

- Main decomposes work into small, reviewable units.
- Main delegates units to workers with explicit file ownership and quality gates.
- Workers run at reasoning level low.
- Workers edit only assigned files and never revert edits from others.
- Main reviews all worker output before integration.
- If quality is below threshold, main asks the same worker or a follow-up worker for focused fixes.
- Main repeats PDCA until quality gates pass: plan, do, check, act.
- These main-orchestrator, reasoning-low worker, no-revert, and recursive PDCA rules continue through Week 2 and later milestones.

Quality threshold:

- The MIT policy and MAGI Audit boundary are intact.
- The implementation matches the current milestone.
- Tests/type-check/lint pass where present.
- Docs are concise, usable, and aligned with positioning.
- No unrelated refactors, hidden product decisions, or ownership overreach.

When in doubt, choose the smallest working OSS runtime change and document anything that belongs later in MAGI Audit.
