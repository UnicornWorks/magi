# MAGI OSS Agent Guide

This repository implements the MAGI OSS Family: MIT-licensed runtime packages for operating AI agents under SRE and EU AI Act compliance pressure. Keep future work practical, scoped, and aligned with the strategy locked on 2026-05-01.

## Purpose

MAGI OSS fills the gap between LLM debugging tools and traditional incident management. It is for teams running autonomous AI agents in production who need detection, response, postmortems, and compliance artifacts for agent-specific failure modes such as infinite loops, cost spikes, hallucination, output drift, and serious incidents.

The core positioning is:

- AI agent SRE plus compliance, not generic observability.
- Self-hostable runtime libraries, not a hosted-only product.
- EU AI Act readiness across incident reporting, Annex IV, FRIA, and post-market monitoring.
- Field credibility from NERV dogfooding with 15 Anima agents.

The 4 primary OSS packages are:

- `@magi/incident`: AI-agent incident detection, response, storage, and postmortems.
- `@magi/annex-iv`: AGENTS.md/codebase to EU AI Act Annex IV documentation.
- `@magi/fria-forge`: programmable FRIA templates and generation.
- `@magi/post-market`: Article 72 post-market monitoring and reports.

Shared packages such as `@magi/core`, `@magi/storage`, and `@magi/regulatory` support the runtime layer.

## Permanent MIT Policy

All `@magi/*` OSS packages are MIT forever. Do not introduce BSL, source-available, open-core lockups, enterprise variants, telemetry backdoors, or later license-conversion language.

OSS must remain complete enough for production self-hosting and EU AI Act compliance. Commercial users may run it freely, including in production. Community-requested runtime features belong in OSS unless they clearly cross the MAGI Audit boundary.

Do not create names such as `@magi/incident-enterprise`, `@magi/audit-cloud`, or `MAGI Incident Cloud`. They blur the policy and weaken trust.

## MAGI Audit Boundary

MAGI Audit is proprietary and separate from this OSS runtime. It is one product in the MAGI Product Family and exists to aggregate OSS data into organizational workflows.

Use these boundary questions:

- Does it require multiple people, approval chains, RBAC, SSO, or organization management? Put it in MAGI Audit.
- Does it create regulator, auditor, certification, attestation, or direct-submission workflows? Put it in MAGI Audit.
- Does UnicornWorks assume legal responsibility for hosted retention, SLA, SOC 2, managed signing, or customer support? Put it in MAGI Audit.
- If all answers are no, it is probably OSS runtime functionality.

OSS owns libraries, adapters, detectors, responders, storage interfaces, CLI exports, self-hosted data formats, and manual compliance output. MAGI Audit owns multi-tenant dashboards, human review, regulator submission flows, 10-year retention guarantees, enterprise support, and MAGI family integration.

## Competitive Positioning

Do not frame MAGI OSS as a replacement for every adjacent tool. Position it by layer:

- Langfuse, Braintrust, Phoenix: debugging and traces. MAGI handles operations, response, and compliance. Say "use alongside Langfuse."
- Helicone and Bifrost: gateway layer. MAGI works at the application/agent SRE layer.
- Grafana OnCall, OneUptime, Keep: traditional incident management. MAGI understands AI-agent failure modes.
- AgentGuard and budget tools: point solutions. MAGI provides detection plus response plus postmortems plus compliance.
- Commercial GRC tools: expensive workflow platforms. MAGI OSS is programmable and self-hostable; MAGI Audit covers team workflow later.
- `@systima/aiact-audit-log`: Article 12 logging. MAGI is broader: SRE to documentation to reporting.

The one-line pitch is: "The OSS family for running AI agents under the EU AI Act."

## Week 1 v0.1 Scope

Week 1 focuses on `@magi/incident` v0.1.0 and the monorepo foundation.

Build:

- pnpm workspace, Turborepo, Biome, Vitest, strict TypeScript, Changesets.
- Initial `@magi/core` shared types.
- `@magi/incident` core types: `Incident`, `Detector`, `Responder`, `Storage`, `AgentEvent`.
- `MagiIncident` class with record, detection loop, incident creation, responder dispatch, start/stop.
- Two detectors: `infinite-loop` and `cost-spike`.
- Three responders: `SlackResponder`, `KillSwitchResponder`, `LogResponder`.
- Two storage adapters: `MemoryStorage` and `JSONLStorage`.
- Vercel AI SDK wrapper.
- Minimal README and examples, preferably grounded in NERV/CASPER.
- CI for build, test, lint, and type-check.

Definition of done:

- Package builds and tests pass.
- README has at least 3 working examples.
- `@magi/incident@0.1.0` can be published or is publish-ready.
- NERV-style production usage is represented.

If time collapses, reduce to one detector, one responder, and memory storage rather than widening the surface with unfinished features.

## Week 2 v0.1 Scope

Week 2 focuses on `@magi/annex-iv` v0.1.0: a local CLI and library that turns agent/codebase context into a practical EU AI Act Annex IV technical documentation draft.

Build:

- Package name: `@magi/annex-iv`.
- CLI binary: `magi-annex-iv`.
- Annex IV 9-section draft generator that emits a complete first-pass document from local repo context and user-provided metadata.
- AGENTS.md/AGENT.MD fallback behavior: prefer `AGENTS.md` when present, otherwise read `AGENT.MD`; handle either file being absent with a clear prompt or error.
- Markdown output as the primary artifact.
- Pandoc PDF wrapper behavior: if pandoc is available, wrap Markdown export into PDF; if unavailable, keep Markdown output and print the exact pandoc install/usage hint without failing the core generation.
- Minimal README and examples showing a self-hosted/manual compliance workflow.

Definition of done:

- `@magi/annex-iv@0.1.0` builds and tests pass.
- CLI can generate the 9-section Annex IV draft from a sample repo.
- Missing metadata and missing agent docs produce actionable messages.
- PDF export is best-effort and never blocks Markdown generation.

If time collapses, keep the generator, CLI, AGENTS fallback, and Markdown output; defer richer PDF formatting and advanced code analysis.

## Week 3 v0.1 Scope

Week 3 focuses on `@magi/fria-forge` v0.1.0: a local CLI and library that turns project metadata, intended-use context, risk inputs, mitigations, and monitoring plans into a practical Fundamental Rights Impact Assessment draft.

Build:

- Package name: `@magi/fria-forge`.
- CLI binary: `magi-fria-forge`.
- FRIA draft generator for high-risk AI system context, affected groups, fundamental-rights risks, mitigations, human oversight, monitoring, and residual risk notes.
- Local/manual input workflow with examples that can be run without MAGI Audit.
- Markdown output as the primary artifact.
- Clear disclaimer in generated output and docs: generated FRIAs are draft tooling artifacts, not legal advice.
- Minimal README and examples showing self-hosted/manual compliance drafting.

Definition of done:

- `@magi/fria-forge@0.1.0` builds and tests pass.
- CLI can generate a complete FRIA draft from sample metadata.
- Missing required metadata produces actionable messages.
- Generated output is visibly marked as a draft for external legal review.

If time collapses, keep the generator, CLI, Markdown output, sample metadata, and disclaimer; defer advanced risk scoring, PDF formatting, and integrations.

## Explicit Out Of Scope

Do not add these to the Week 1, Week 2, or Week 3 OSS implementation:

- MAGI Audit product code, SaaS dashboards, Stripe, pricing, or hosted workflows.
- SSO, RBAC, organization management, approval chains, auditor views, or regulator direct submission.
- 10-year retention guarantees, SOC 2 claims, managed cryptographic signing, or SLA language.
- BSL, enterprise package variants, or commercial licensing code.
- `@magi/post-market` beyond placeholders unless explicitly assigned.
- Hallucination and drift detectors, Postgres/Supabase storage, postmortem LLM RCA, OpenTelemetry, and UI unless the current milestone is v0.2+.
- npm publish, external publishing flows, public blog/CMS publishing, FCM/push notification review, and marketing automation.
- Hosted MAGI Audit workflows, public regulator submission flows, and managed legal/compliance services.
- Legal advice. Templates, generated FRIAs, and exports are draft tooling artifacts, not legal counsel; external legal review remains outside local OSS scope.

## Orchestration Rules

The main agent acts as orchestrator. It owns planning, decomposition, integration, review, and final quality.

Delegation model:

- Main agent splits work into small implementation units with clear file ownership and done criteria.
- Workers receive narrow tasks and must run at reasoning level low.
- Workers must only edit assigned files and must not revert edits made by others.
- Main agent reviews each worker output before accepting it.
- If output is below the quality threshold, main agent recursively asks for focused fixes until the unit passes.
- Main agent runs PDCA loops: plan the unit, do the implementation, check against docs/tests/policy, act by fixing or delegating again.
- These main-orchestrator, reasoning-low worker, no-revert, recursive review/repair, and PDCA-until-gates-pass rules continue through Week 3 and later milestones.

Quality gates:

- License boundary preserved.
- Week scope respected.
- Tests, type-checks, and lint pass when available.
- Public docs are concise and accurate.
- OSS remains usable without MAGI Audit.
- No unrelated refactors or ownership drift.

When uncertain, prefer the smallest change that preserves the MIT runtime promise and keeps MAGI Audit as a complementary workflow platform, not a gated upgrade path.
