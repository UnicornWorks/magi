# MAGI OSS Family — 実装計画書

> **Version**: 1.0
> **Owner**: りゅういち (UnicornWorks)
> **Date**: 2026-05-01
> **Status**: Implementation Ready
> **Scope**: 90日間で4パッケージのv0.1をリリースする実装手順書

---

## 0. この文書の使い方

戦略文書セット（`00_executive_summary.md` 〜 `04_competitive_matrix.md`）で**戦略**は確定済み。
この文書は**実装の具体的な手順**を時系列で示す。

各タスクには以下を含む：
- ⏱️ **見積時間**
- 🎯 **完了条件**（DoD: Definition of Done）
- 📦 **成果物**

毎週末（土日 = 約16時間）+ 平日夜（週10時間 = 計26時間/週）で進める前提。

---

## 1. 全体タイムライン

```
Week 0  (今すぐ)         : 環境準備・スコープ確保
Week 1  (Day 1-7)        : @magi/incident v0.1.0 ★
Week 2  (Day 8-14)       : @magi/annex-iv v0.1.0
Week 3  (Day 15-21)      : @magi/fria-forge v0.1.0
Week 4  (Day 22-28)      : @magi/post-market v0.1.0
Week 5-8 (Day 29-56)     : ドキュメント・コミュニティ・改善
Week 9-12 (Day 57-84)    : v0.2リリース・MAGI Audit Beta準備
Day 85-90               : Public Launch
```

---

## 2. Week 0 — 環境準備（今すぐ着手、所要2-4時間）

### Task 0.1: スコープとドメインの確保 ⏱️ 30分

**実行**:
```bash
# npm 組織の作成（@magi スコープ確保）
npm login
npm org create magi

# 失敗した場合の代替候補を順に試す
npm org create magi-platform
npm org create magihq
```

**完了条件 (DoD)**:
- [ ] `@magi` または代替スコープが取得できている
- [ ] `npm org ls magi` で確認可能

**成果物**: npm 組織アカウント

### Task 0.2: GitHub組織の確保 ⏱️ 15分

**判断**: 既存の `sol12378` を使うか、新規 `unicornworks` 組織を作るか

**推奨**: 新規組織 `unicornworks` を作る（個人とビジネスの分離、契約相手として明確）

**実行**:
1. GitHub.com → New Organization → Free plan
2. Organization name: `unicornworks`
3. リポジトリ作成: `unicornworks/magi`（Public、空で作成）

**完了条件**:
- [ ] `github.com/unicornworks/magi` が存在
- [ ] りゅういちさん本人がOwner権限を持っている

### Task 0.3: ドメイン確認 ⏱️ 15分

`magi-platform.com` の所有状況を確認。サブドメイン `oss.magi-platform.com` を後でDNS設定する想定。

**完了条件**:
- [ ] `magi-platform.com` がりゅういちさん所有 or 取得可能と確認
- [ ] サブドメイン追加用DNS管理画面にアクセス可能

### Task 0.4: 開発環境の確認 ⏱️ 30分

**必要なツール**:
```bash
node --version    # 22.x 以上 (LTS)
pnpm --version    # 9.x 以上
git --version     # 任意の最新版

# pnpmが古い or ない場合
corepack enable
corepack prepare pnpm@latest --activate
```

**完了条件**:
- [ ] Node.js 22.x、pnpm 9.x が動く
- [ ] GitHubのSSHキー設定済み（`ssh -T git@github.com` で確認）

### Task 0.5: シークレット類の準備 ⏱️ 30分

後でCI/CDで使うため、以下を発行・保管：

| シークレット | 取得方法 | 用途 |
|---|---|---|
| `NPM_TOKEN` | npmjs.com → Access Tokens → Generate Token (Granular, Read+Publish) | 自動publish |
| `GITHUB_TOKEN` | 自動付与（GitHub Actionsデフォルト） | リリース作成 |
| `TURBO_TOKEN` (任意) | vercel.com → Account → Tokens | Remote Cache |

**完了条件**:
- [ ] `NPM_TOKEN` を1Password等の安全な場所に保管
- [ ] GitHub repo > Settings > Secrets で `NPM_TOKEN` 登録準備

---

## 3. Week 1 — `@magi/incident` v0.1.0（メイン、Day 1-7）

### Day 1（土曜）: モノレポの土台構築 ⏱️ 6-8時間

#### Task 1.1: リポジトリ初期化 ⏱️ 30分

```bash
# クローンして移動
git clone git@github.com:unicornworks/magi.git
cd magi

# 基本ファイル作成
cat > .gitignore <<EOF
node_modules
dist
.turbo
.DS_Store
*.log
.env
.env.local
coverage
.vscode/
.idea/
EOF

cat > .nvmrc <<EOF
22
EOF

cat > .npmrc <<EOF
auto-install-peers=true
strict-peer-dependencies=false
EOF
```

#### Task 1.2: pnpm workspace 設定 ⏱️ 30分

`pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
  - "apps/*"
  - "examples/*"
```

ルート `package.json`:
```json
{
  "name": "magi",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format": "biome format --write .",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@changesets/cli": "^2.28.0",
    "turbo": "^2.5.0",
    "typescript": "^5.6.0",
    "vitest": "^2.0.0",
    "tsup": "^8.5.0"
  },
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=22"
  }
}
```

#### Task 1.3: Turborepo設定 ⏱️ 20分

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**", "test/**", "vitest.config.*"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

#### Task 1.4: 共通TypeScript設定 ⏱️ 20分

ルート `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

#### Task 1.5: Biome設定 ⏱️ 10分

```bash
pnpm dlx @biomejs/biome init
```

`biome.json` 編集:
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "files": {
    "ignore": ["node_modules", "dist", ".turbo", "coverage"]
  },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

#### Task 1.6: Changesets初期化 ⏱️ 15分

```bash
pnpm changeset init
```

`.changeset/config.json` を編集:
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

#### Task 1.7: `@magi/core` 雛形作成 ⏱️ 30分

```bash
mkdir -p packages/core/src
cd packages/core
```

`package.json`:
```json
{
  "name": "@magi/core",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "type-check": "tsc --noEmit",
    "lint": "biome check ."
  },
  "publishConfig": {
    "access": "public"
  }
}
```

`tsup.config.ts`:
```typescript
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  splitting: false,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".mjs" }
  }
})
```

`tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

`src/index.ts`:
```typescript
// Common types shared across @magi/* packages

export type SystemId = string

export type RiskLevel = "minimal" | "limited" | "high" | "unacceptable"

export type Severity = "low" | "medium" | "high" | "critical"

export interface MagiConfig {
  systemId: SystemId
  riskLevel?: RiskLevel
}

export const MAGI_VERSION = "0.1.0"
```

#### Task 1.8: 初回ビルド検証 ⏱️ 20分

```bash
cd ../..  # ルートに戻る
pnpm install
pnpm build
```

**完了条件 DoD**:
- [ ] `packages/core/dist/` に `.cjs`, `.mjs`, `.d.ts` が生成される
- [ ] `pnpm test` が（テストがなくても）成功する
- [ ] git commit & push が完了している

---

### Day 2（日曜）: `@magi/incident` 実装 ⏱️ 8-10時間

#### Task 1.9: パッケージ作成 ⏱️ 30分

```bash
mkdir -p packages/incident/src/{detectors,responders,storage,postmortem,adapters}
mkdir -p packages/incident/test
mkdir -p packages/incident/examples
```

`packages/incident/package.json`:
```json
{
  "name": "@magi/incident",
  "version": "0.0.0",
  "description": "Self-hostable incident management for AI agents (EU AI Act ready)",
  "keywords": [
    "ai-agent",
    "incident-management",
    "sre",
    "eu-ai-act",
    "compliance",
    "langchain",
    "vercel-ai"
  ],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "type-check": "tsc --noEmit",
    "lint": "biome check ."
  },
  "dependencies": {
    "@magi/core": "workspace:*"
  },
  "publishConfig": { "access": "public" },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/unicornworks/magi.git",
    "directory": "packages/incident"
  }
}
```

#### Task 1.10: コア型定義 ⏱️ 1時間

`src/types.ts`:
```typescript
import type { SystemId, Severity } from "@magi/core"

export type IncidentCategory =
  | "reliability"     // 無限ループ、クラッシュ
  | "cost"            // 予算超過
  | "safety"          // ハルシネーション、有害出力
  | "drift"           // モデル性能劣化
  | "compliance"      // 規制違反

export type IncidentStatus = "open" | "mitigating" | "resolved" | "reported"

export interface Incident {
  id: string
  systemId: SystemId
  detector: string
  severity: Severity
  category: IncidentCategory
  status: IncidentStatus
  detectedAt: Date
  resolvedAt?: Date
  evidence: Record<string, unknown>
  context?: Record<string, unknown>
  metrics?: Record<string, number>
}

export interface AgentEvent {
  systemId: SystemId
  timestamp: Date
  model?: string
  inputTokens?: number
  outputTokens?: number
  cost?: number
  latencyMs?: number
  toolCalls?: string[]
  input?: string
  output?: string
  metadata?: Record<string, unknown>
}

export interface DetectorContext {
  recent: AgentEvent[]
  systemId: SystemId
  now: Date
}

export interface DetectorResult {
  severity: Severity
  category: IncidentCategory
  evidence: Record<string, unknown>
  context?: Record<string, unknown>
}

export interface Detector {
  name: string
  detect: (ctx: DetectorContext) => Promise<DetectorResult | null> | DetectorResult | null
}

export interface ResponderContext {
  incident: Incident
  notify: (severity: Severity, message: string) => Promise<void>
  kill: () => Promise<void>
  rollback: (opts?: { steps?: number }) => Promise<void>
  throttle: (opts: { rate: number; durationMs: number }) => Promise<void>
}

export interface Responder {
  name: string
  on: IncidentCategory[] | "*"
  handle: (ctx: ResponderContext) => Promise<void>
}

export interface Storage {
  save: (incident: Incident) => Promise<void>
  load: (id: string) => Promise<Incident | null>
  query: (filter: { systemId?: SystemId; since?: Date; limit?: number }) => Promise<Incident[]>
  recentEvents: (systemId: SystemId, since: Date) => Promise<AgentEvent[]>
  recordEvent: (event: AgentEvent) => Promise<void>
}
```

#### Task 1.11: メインクラス実装 ⏱️ 2時間

`src/magi-incident.ts`:
```typescript
import type { SystemId } from "@magi/core"
import type {
  Incident,
  Detector,
  Responder,
  Storage,
  AgentEvent,
  DetectorResult,
} from "./types.js"
import { randomUUID } from "node:crypto"

export interface MagiIncidentConfig {
  systemId: SystemId
  storage: Storage
  detectors: Detector[]
  responders: Responder[]
  detectionIntervalMs?: number
}

export class MagiIncident {
  private config: MagiIncidentConfig
  private intervalHandle?: NodeJS.Timeout

  constructor(config: MagiIncidentConfig) {
    this.config = {
      detectionIntervalMs: 10_000,
      ...config,
    }
  }

  async record(event: Omit<AgentEvent, "systemId" | "timestamp">): Promise<void> {
    await this.config.storage.recordEvent({
      systemId: this.config.systemId,
      timestamp: new Date(),
      ...event,
    })
  }

  async runDetection(): Promise<Incident[]> {
    const now = new Date()
    const lookback = new Date(now.getTime() - 60 * 60 * 1000) // 1h
    const recent = await this.config.storage.recentEvents(this.config.systemId, lookback)

    const triggered: Incident[] = []
    for (const detector of this.config.detectors) {
      const result = await detector.detect({ recent, systemId: this.config.systemId, now })
      if (result) {
        const incident = this.createIncident(detector.name, result)
        await this.config.storage.save(incident)
        await this.dispatchResponders(incident)
        triggered.push(incident)
      }
    }
    return triggered
  }

  start(): void {
    if (this.intervalHandle) return
    this.intervalHandle = setInterval(() => {
      this.runDetection().catch((err) => {
        console.error("[magi/incident] detection error:", err)
      })
    }, this.config.detectionIntervalMs)
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = undefined
    }
  }

  private createIncident(detectorName: string, result: DetectorResult): Incident {
    return {
      id: randomUUID(),
      systemId: this.config.systemId,
      detector: detectorName,
      severity: result.severity,
      category: result.category,
      status: "open",
      detectedAt: new Date(),
      evidence: result.evidence,
      context: result.context,
    }
  }

  private async dispatchResponders(incident: Incident): Promise<void> {
    const matching = this.config.responders.filter(
      (r) => r.on === "*" || r.on.includes(incident.category),
    )
    for (const responder of matching) {
      try {
        await responder.handle({
          incident,
          notify: async () => {
            /* implemented per responder */
          },
          kill: async () => {},
          rollback: async () => {},
          throttle: async () => {},
        })
      } catch (err) {
        console.error(`[magi/incident] responder ${responder.name} failed:`, err)
      }
    }
  }
}
```

#### Task 1.12: 検知器2つ実装 ⏱️ 1.5時間

`src/detectors/infinite-loop.ts`:
```typescript
import type { Detector } from "../types.js"

export interface InfiniteLoopOptions {
  sameToolCallsThreshold?: number
  withinMs?: number
}

export function infiniteLoopDetector(opts: InfiniteLoopOptions = {}): Detector {
  const threshold = opts.sameToolCallsThreshold ?? 10
  const window = opts.withinMs ?? 60_000

  return {
    name: "infinite-loop",
    detect: ({ recent, now }) => {
      const cutoff = now.getTime() - window
      const events = recent.filter((e) => e.timestamp.getTime() > cutoff)

      const toolCounts = new Map<string, number>()
      for (const e of events) {
        for (const tool of e.toolCalls ?? []) {
          toolCounts.set(tool, (toolCounts.get(tool) ?? 0) + 1)
        }
      }

      for (const [tool, count] of toolCounts) {
        if (count >= threshold) {
          return {
            severity: "high" as const,
            category: "reliability" as const,
            evidence: { tool, count, windowMs: window },
          }
        }
      }
      return null
    },
  }
}
```

`src/detectors/cost-spike.ts`:
```typescript
import type { Detector } from "../types.js"

export interface CostSpikeOptions {
  windowMs?: number
  baselineWindowMs?: number
  multiplier?: number
}

export function costSpikeDetector(opts: CostSpikeOptions = {}): Detector {
  const window = opts.windowMs ?? 5 * 60_000
  const baseline = opts.baselineWindowMs ?? 24 * 60 * 60_000
  const multiplier = opts.multiplier ?? 3

  return {
    name: "cost-spike",
    detect: ({ recent, now }) => {
      const winCut = now.getTime() - window
      const baseCut = now.getTime() - baseline

      const winEvents = recent.filter((e) => e.timestamp.getTime() > winCut)
      const baseEvents = recent.filter(
        (e) => e.timestamp.getTime() > baseCut && e.timestamp.getTime() <= winCut,
      )

      const winCost = winEvents.reduce((s, e) => s + (e.cost ?? 0), 0)
      const baseCost = baseEvents.reduce((s, e) => s + (e.cost ?? 0), 0)
      if (baseEvents.length === 0 || baseCost === 0) return null

      const winRate = winCost / window
      const baseRate = baseCost / (baseline - window)

      if (winRate > baseRate * multiplier) {
        return {
          severity: winRate > baseRate * multiplier * 2 ? "critical" : "high",
          category: "cost" as const,
          evidence: {
            winCostUsd: winCost,
            baselineRateUsdPerMs: baseRate,
            currentRateUsdPerMs: winRate,
            multiplier: winRate / baseRate,
          },
        }
      }
      return null
    },
  }
}
```

#### Task 1.13: Responder3つ実装 ⏱️ 1時間

`src/responders/log.ts`:
```typescript
import type { Responder } from "../types.js"

export function logResponder(): Responder {
  return {
    name: "log",
    on: "*",
    handle: async ({ incident }) => {
      console.warn(
        `[magi/incident] ${incident.severity.toUpperCase()} ` +
          `${incident.category}/${incident.detector}: ${JSON.stringify(incident.evidence)}`,
      )
    },
  }
}
```

`src/responders/slack.ts`:
```typescript
import type { Responder } from "../types.js"

export function slackResponder(opts: { webhookUrl: string }): Responder {
  return {
    name: "slack",
    on: "*",
    handle: async ({ incident }) => {
      const text =
        `🚨 *${incident.severity.toUpperCase()}* incident in \`${incident.systemId}\`\n` +
        `Detector: \`${incident.detector}\`\n` +
        `Category: ${incident.category}\n` +
        `Evidence: \`\`\`${JSON.stringify(incident.evidence, null, 2)}\`\`\``

      await fetch(opts.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
    },
  }
}
```

`src/responders/kill-switch.ts`:
```typescript
import type { Responder, Severity } from "../types.js"

export interface KillSwitchOptions {
  severityThreshold?: Severity
  onKill: () => Promise<void> | void
}

export function killSwitchResponder(opts: KillSwitchOptions): Responder {
  const threshold = opts.severityThreshold ?? "critical"
  const order: Severity[] = ["low", "medium", "high", "critical"]

  return {
    name: "kill-switch",
    on: "*",
    handle: async ({ incident }) => {
      const incidentLevel = order.indexOf(incident.severity)
      const thresholdLevel = order.indexOf(threshold)
      if (incidentLevel >= thresholdLevel) {
        await opts.onKill()
      }
    },
  }
}
```

#### Task 1.14: Storage実装 ⏱️ 1時間

`src/storage/memory.ts`:
```typescript
import type { Storage, Incident, AgentEvent } from "../types.js"
import type { SystemId } from "@magi/core"

export function memoryStorage(): Storage {
  const incidents = new Map<string, Incident>()
  const events: AgentEvent[] = []

  return {
    save: async (incident) => {
      incidents.set(incident.id, incident)
    },
    load: async (id) => incidents.get(id) ?? null,
    query: async ({ systemId, since, limit = 100 }) => {
      let results = Array.from(incidents.values())
      if (systemId) results = results.filter((i) => i.systemId === systemId)
      if (since) results = results.filter((i) => i.detectedAt >= since)
      return results.slice(0, limit)
    },
    recentEvents: async (systemId: SystemId, since: Date) => {
      return events.filter((e) => e.systemId === systemId && e.timestamp >= since)
    },
    recordEvent: async (event) => {
      events.push(event)
      // Keep only last 10000 events to avoid memory leak
      if (events.length > 10_000) events.splice(0, events.length - 10_000)
    },
  }
}
```

`src/storage/jsonl.ts`:
```typescript
import { appendFile, readFile } from "node:fs/promises"
import type { Storage, Incident, AgentEvent } from "../types.js"

export function jsonlStorage(opts: { incidentsPath: string; eventsPath: string }): Storage {
  return {
    save: async (incident) => {
      await appendFile(opts.incidentsPath, JSON.stringify(incident) + "\n")
    },
    load: async (id) => {
      try {
        const content = await readFile(opts.incidentsPath, "utf8")
        for (const line of content.split("\n").filter(Boolean)) {
          const inc = JSON.parse(line) as Incident
          if (inc.id === id) return inc
        }
      } catch {
        return null
      }
      return null
    },
    query: async ({ systemId, since, limit = 100 }) => {
      try {
        const content = await readFile(opts.incidentsPath, "utf8")
        const all = content
          .split("\n")
          .filter(Boolean)
          .map((l) => JSON.parse(l) as Incident)
        let results = all
        if (systemId) results = results.filter((i) => i.systemId === systemId)
        if (since) results = results.filter((i) => new Date(i.detectedAt) >= since)
        return results.slice(-limit)
      } catch {
        return []
      }
    },
    recentEvents: async (systemId, since) => {
      try {
        const content = await readFile(opts.eventsPath, "utf8")
        const all = content
          .split("\n")
          .filter(Boolean)
          .map((l) => JSON.parse(l) as AgentEvent)
        return all.filter((e) => e.systemId === systemId && new Date(e.timestamp) >= since)
      } catch {
        return []
      }
    },
    recordEvent: async (event) => {
      await appendFile(opts.eventsPath, JSON.stringify(event) + "\n")
    },
  }
}
```

#### Task 1.15: エクスポートと最終結合 ⏱️ 30分

`src/index.ts`:
```typescript
export { MagiIncident } from "./magi-incident.js"
export type { MagiIncidentConfig } from "./magi-incident.js"
export type {
  Incident,
  IncidentCategory,
  IncidentStatus,
  AgentEvent,
  Detector,
  DetectorContext,
  DetectorResult,
  Responder,
  ResponderContext,
  Storage,
} from "./types.js"

// Detectors
export { infiniteLoopDetector } from "./detectors/infinite-loop.js"
export { costSpikeDetector } from "./detectors/cost-spike.js"

// Responders
export { logResponder } from "./responders/log.js"
export { slackResponder } from "./responders/slack.js"
export { killSwitchResponder } from "./responders/kill-switch.js"

// Storage
export { memoryStorage } from "./storage/memory.js"
export { jsonlStorage } from "./storage/jsonl.js"
```

**完了条件 DoD**:
- [ ] `pnpm build` がエラーなく成功
- [ ] `dist/index.mjs`, `dist/index.d.ts` が生成される
- [ ] `import { MagiIncident, infiniteLoopDetector } from "@magi/incident"` が型エラーなく動く

---

### Day 3-4（平日夜）: テスト・例・ドキュメント ⏱️ 6時間

#### Task 1.16: 単体テスト ⏱️ 2時間

`packages/incident/test/detectors.test.ts`:
```typescript
import { describe, it, expect } from "vitest"
import { infiniteLoopDetector, costSpikeDetector } from "../src/index.js"

describe("infiniteLoopDetector", () => {
  const detector = infiniteLoopDetector({ sameToolCallsThreshold: 3, withinMs: 60_000 })

  it("detects when same tool is called repeatedly", async () => {
    const now = new Date()
    const events = Array.from({ length: 5 }, (_, i) => ({
      systemId: "test",
      timestamp: new Date(now.getTime() - i * 1000),
      toolCalls: ["db.query"],
    }))

    const result = await detector.detect({ recent: events, systemId: "test", now })
    expect(result?.category).toBe("reliability")
    expect(result?.severity).toBe("high")
  })

  it("does not trigger below threshold", async () => {
    const now = new Date()
    const events = [{ systemId: "test", timestamp: now, toolCalls: ["db.query"] }]
    const result = await detector.detect({ recent: events, systemId: "test", now })
    expect(result).toBeNull()
  })
})

describe("costSpikeDetector", () => {
  const detector = costSpikeDetector({
    windowMs: 60_000,
    baselineWindowMs: 24 * 60 * 60_000,
    multiplier: 2,
  })

  it("detects cost spike", async () => {
    const now = new Date()
    const events = [
      // Window: $10 in last minute
      { systemId: "test", timestamp: new Date(now.getTime() - 30_000), cost: 10 },
      // Baseline: $1/hour over 23 hours
      ...Array.from({ length: 23 }, (_, i) => ({
        systemId: "test",
        timestamp: new Date(now.getTime() - (i + 2) * 60 * 60_000),
        cost: 1,
      })),
    ]
    const result = await detector.detect({ recent: events, systemId: "test", now })
    expect(result?.category).toBe("cost")
  })
})
```

#### Task 1.17: 結合テスト ⏱️ 1時間

`packages/incident/test/integration.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest"
import {
  MagiIncident,
  infiniteLoopDetector,
  logResponder,
  memoryStorage,
} from "../src/index.js"

describe("MagiIncident integration", () => {
  it("triggers responder when detector fires", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const storage = memoryStorage()

    const magi = new MagiIncident({
      systemId: "test-system",
      storage,
      detectors: [infiniteLoopDetector({ sameToolCallsThreshold: 2, withinMs: 60_000 })],
      responders: [logResponder()],
    })

    // Record events to trigger
    await magi.record({ toolCalls: ["api.call"] })
    await magi.record({ toolCalls: ["api.call"] })
    await magi.record({ toolCalls: ["api.call"] })

    const incidents = await magi.runDetection()

    expect(incidents).toHaveLength(1)
    expect(incidents[0]?.detector).toBe("infinite-loop")
    expect(consoleWarn).toHaveBeenCalled()

    consoleWarn.mockRestore()
  })
})
```

`vitest.config.ts` (パッケージルート):
```typescript
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    coverage: { provider: "v8" },
  },
})
```

#### Task 1.18: 例の作成 ⏱️ 1時間

`packages/incident/examples/basic.ts`:
```typescript
import {
  MagiIncident,
  infiniteLoopDetector,
  costSpikeDetector,
  logResponder,
  jsonlStorage,
} from "@magi/incident"

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
})

// Record AI agent events
await magi.record({
  model: "claude-opus-4-7",
  inputTokens: 3000,
  outputTokens: 800,
  cost: 0.045,
  latencyMs: 2300,
  toolCalls: ["db.query", "slack.send"],
})

// Run detection (or use magi.start() for periodic)
await magi.runDetection()
```

#### Task 1.19: README作成 ⏱️ 2時間

`packages/incident/README.md`:
```markdown
# @magi/incident

> Self-hostable incident management for AI agents. EU AI Act ready.

[![npm](https://img.shields.io/npm/v/@magi/incident)](https://npmjs.com/package/@magi/incident)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why @magi/incident?

LLM observability tools (Langfuse, Helicone) help you debug. Traditional
incident management (PagerDuty, Grafana OnCall) doesn't understand AI agents.

`@magi/incident` fills the gap: detect, respond, and document AI agent
incidents — built from production lessons running 15 autonomous agents 24/7
in NERV.

## Features

- 🔍 **AI-aware detectors**: infinite loops, cost spikes, hallucinations, drift
- ⚡ **Auto-response**: kill, rollback, throttle, notify
- 📋 **Postmortem generation** (coming in v0.2)
- 🇪🇺 **EU AI Act ready**: Article 73 export format
- 🏗️ **Storage agnostic**: Memory, JSONL, Postgres, Supabase
- 🔌 **Framework agnostic**: works with any AI SDK

## Install

\`\`\`bash
npm install @magi/incident
# or
pnpm add @magi/incident
\`\`\`

## Quick Start

\`\`\`typescript
import {
  MagiIncident,
  infiniteLoopDetector,
  costSpikeDetector,
  logResponder,
  jsonlStorage,
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

// Record agent events
await magi.record({
  model: "claude-opus-4-7",
  cost: 0.045,
  toolCalls: ["db.query"],
})

// Detect
const incidents = await magi.runDetection()

// Or run periodically
magi.start()
\`\`\`

## License

MIT, forever. We commit to never relicense the core OSS.

## Production users

Used in production by [NERV](https://github.com/sol12378/nerv-obsidian) — 15
autonomous AI agents running 24/7 since 2026.

## Roadmap

- [ ] v0.2: Postmortem generation, drift/hallucination detectors
- [ ] v0.3: Postgres/Supabase storage, LangChain adapter
- [ ] v0.5: Article 73 export, hash chain (opt-in)
- [ ] v1.0: Production hardening

For team workflows (multi-user reviews, SSO, regulator submission), see
[MAGI Audit](https://oss.magi-platform.com/audit) — part of the
[MAGI Product Family](https://magi-platform.com).
```

#### Task 1.20: NERVへの組込み（ドッグフーディング） ⏱️ 1時間

NERVの `gendo` Anima のスクリプトに `@magi/incident` を組み込む（`npm link` または local file path で）。

**完了条件 DoD**:
- [ ] `pnpm test` がgreenで通る
- [ ] examples/basic.ts が動く
- [ ] NERVの本番でログが取れている

---

### Day 5（平日夜）: CI/CD構築 ⏱️ 4時間

#### Task 1.21: GitHub Actions CI ⏱️ 1時間

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test
      - run: pnpm type-check
      - run: pnpm lint
```

#### Task 1.22: Release Workflow ⏱️ 2時間

`.github/workflows/release.yml`:
```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - uses: changesets/action@v1
        with:
          publish: pnpm release
          version: pnpm version
          commit: "chore(release): version packages"
          title: "chore(release): version packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### Task 1.23: Secret登録 ⏱️ 30分

GitHub repo > Settings > Secrets and variables > Actions:
- `NPM_TOKEN` を登録

#### Task 1.24: 動作テスト ⏱️ 30分

```bash
# テストPRを作る
git checkout -b test-ci
echo "test" >> README.md
git add . && git commit -m "test: trigger ci"
git push -u origin test-ci
# GitHubでPR作成 → CIが緑になることを確認
```

**完了条件 DoD**:
- [ ] PRでCIが自動実行される
- [ ] mainマージで`Version Packages` PR が自動生成される

---

### Day 6（土曜）: v0.1.0 リリース ⏱️ 4時間

#### Task 1.25: 初回 changeset ⏱️ 15分

```bash
pnpm changeset
# Selected packages: @magi/core, @magi/incident
# Type of change: minor
# Summary: "Initial release of @magi/incident with infinite-loop and cost-spike detectors"
git add .changeset
git commit -m "chore: initial release changeset"
git push
```

#### Task 1.26: バージョンPRをマージ ⏱️ 15分

GitHub Actionsが `Version Packages` PR を自動生成 → マージ → npm publishが自動実行

**完了条件 DoD**:
- [ ] `npm view @magi/incident` でv0.1.0が見える
- [ ] `npm install @magi/incident` が他環境で成功する

#### Task 1.27: NERVへの本番投入 ⏱️ 2時間

```bash
# NERV側で
cd ~/nerv-obsidian
npm install @magi/incident
# gendoのコードを更新してmagi-incidentを使うように
```

#### Task 1.28: 公開アナウンス（日本語） ⏱️ 1.5時間

Zenn/note に記事投稿:
- タイトル「NERVのCASPERをOSS化した話 — @magi/incident v0.1.0」
- 内容: なぜ作ったか、ハーネスエンジニアリングとの関連、使い方

X (Twitter) でアナウンス：
```
🚨 リリース！

NERV (15体のAIエージェント運用) で使ってきた
インシデント管理ライブラリをOSS化しました。

@magi/incident v0.1.0
- AI特有の故障モード検知
- 自動修復ワークフロー  
- EU AI Act対応の準備

npm: https://npmjs.com/@magi/incident
```

---

### Day 7（日曜）: バッファ / Week 2準備 ⏱️ 4時間

- バグ修正、READMEの磨き込み
- Issueがあれば対応
- Week 2の `@magi/annex-iv` の調査・設計

---

## 4. Week 2 — `@magi/annex-iv` v0.1.0（Day 8-14）

### スコープ
**コードベースとAGENTS.mdをスキャンして、EU AI Act Annex IV技術文書のMarkdown初稿を生成するCLI + ライブラリ**

### Annex IV の9セクション

EU AI Act Annex IV が要求する技術文書の構成：
1. システムの一般説明
2. 詳細仕様（コンポーネント、トレーニング、データセット）
3. システムのモニタリング、機能、コントロール
4. 性能評価（精度、堅牢性、サイバーセキュリティ）
5. リスク管理システム
6. 開発・トレーニング・テスト中の変更
7. 適用された調和規格
8. 適合宣言書
9. 市販後モニタリングシステム

### Day 8-9（土日）: コア実装 ⏱️ 12時間

#### Task 2.1: パッケージ作成 ⏱️ 30分

```bash
mkdir -p packages/annex-iv/src/{scanner,sections,exporters,cli}
```

#### Task 2.2: AGENTS.md パーサー ⏱️ 2時間

`src/scanner/agents-md.ts`:
- AGENTS.mdをMarkdownASTでパース
- セクション構造を抽出
- メタデータ（model、tools、constraints等）を構造化

#### Task 2.3: コードベーススキャナー ⏱️ 3時間

`src/scanner/codebase.ts`:
- `package.json` から依存関係を抽出
- `git log` から変更履歴を取得
- README.mdから概要を抽出
- TypeScriptの型定義からデータ構造を抽出

#### Task 2.4: Annex IV セクション生成器 ⏱️ 4時間

`src/sections/section-1-general.ts` 〜 `src/sections/section-9-monitoring.ts`:
- 各セクションごとにテンプレート + 自動補完ロジック
- 不足箇所には `<!-- TODO: Manual input required -->` を挿入

#### Task 2.5: Markdown出力 ⏱️ 1時間

`src/exporters/markdown.ts`:
- 9セクションを連結
- 目次生成
- メタデータヘッダー

#### Task 2.6: CLI ⏱️ 1.5時間

`src/cli/index.ts`:
```typescript
#!/usr/bin/env node
import { Command } from "commander"

const program = new Command()
program
  .name("magi-annex-iv")
  .description("Generate EU AI Act Annex IV technical documentation")
  .version("0.1.0")

program
  .command("build")
  .option("-r, --root <path>", "Project root", ".")
  .option("-a, --agents-md <path>", "Path to AGENTS.md", "./AGENTS.md")
  .option("-o, --output <path>", "Output path", "./annex-iv.md")
  .action(async (opts) => {
    // ... build logic
  })

program.parse()
```

`package.json` に `bin` 追加:
```json
"bin": {
  "magi-annex-iv": "./dist/cli/index.cjs"
}
```

### Day 10-11: テスト・ドキュメント・examples ⏱️ 6時間

- 単体テスト
- README作成
- FCMの実例で生成→手動レビュー→改善

### Day 12: PDF出力（pandoc経由） ⏱️ 3時間

`src/exporters/pdf.ts`:
- pandocバイナリを呼び出してmd→PDF変換

### Day 13: リリース ⏱️ 2時間

- changeset作成 → 自動publish

### Day 14: 公開ブログ（英語） ⏱️ 4時間

dev.to / Hacker News に投稿:
- "Generate EU AI Act Annex IV from your codebase + AGENTS.md"

---

## 5. Week 3 — `@magi/fria-forge` v0.1.0（Day 15-21）

### スコープ
**FRIA（Fundamental Rights Impact Assessment）テンプレートを生成するCLI + ライブラリ**

### 主要機能
1. システム情報入力（CLI対話形式 or JSON）
2. Annex III高リスク分類の自動判定
3. 影響を受ける基本権の自動マッピング
4. 3つのテンプレート生成（DIHR/ECNL、ALIGNER、Commission）
5. Markdown / PDF出力

### Day 15-16: コア実装 ⏱️ 12時間

#### Task 3.1: 基本権データベース構築 ⏱️ 3時間
- EU基本権憲章の14基本権をJSON化
- 各権利と高リスクAI使用例のマッピング

#### Task 3.2: Annex III分類エンジン ⏱️ 2時間
- 8カテゴリ（生体認証、教育、雇用、信用、社会保障、法執行、移民、司法）の判定ロジック

#### Task 3.3: テンプレートエンジン ⏱️ 4時間
- DIHR/ECNL の5フェーズ構造
- ALIGNER の脅威シナリオ形式
- Commission の標準テンプレート

#### Task 3.4: 対話CLI ⏱️ 3時間
```bash
npx @magi/fria-forge init
# 質問: System name? Sector? Affected groups?
# → fria.draft.md を生成
```

### Day 17-18: テスト・ドキュメント ⏱️ 6時間

### Day 19-20: 法務確認 + リリース ⏱️ 6時間

**重要**: 「これは法律相談ではない」のディスクレーマーを明記

### Day 21: 公開ブログ ⏱️ 4時間

「Solo DevがFRIAを5分で書く方法」

---

## 6. Week 4 — `@magi/post-market` v0.1.0（Day 22-28）

### スコープ
**Article 72 ポストマーケット監視と、Article 73 重大インシデント自動報告のためのライブラリ**

### 主要機能
1. メトリクス継続監視（drift、bias、accuracy）
2. 月次/週次レポート自動生成
3. Article 73トリガー（重大度判定）
4. レポートのMarkdown/JSON出力

### Day 22-23: コア実装 ⏱️ 12時間

#### Task 4.1: Monitor基底クラス ⏱️ 2時間
- `Monitor` インターフェース定義
- スケジューラー組み込み

#### Task 4.2: 内蔵モニター3つ ⏱️ 4時間
- `accuracyMonitor` — golden datasetとの比較
- `biasMonitor` — protected attributesでの結果分布チェック
- `driftMonitor` — embeddings分布のWasserstein距離

#### Task 4.3: レポートビルダー ⏱️ 3時間
- 期間集計
- グラフ生成（vega-liteで静的画像）
- Markdown出力

#### Task 4.4: Article 73 連携 ⏱️ 3時間
- 重大インシデント定義（fundamental rights影響、健康・安全リスク等）
- @magi/incident との統合
- 自動エクスポート（JSON、規制官提出フォーマット）

### Day 24-25: テスト・ドキュメント ⏱️ 6時間

### Day 26-27: リリース + 統合例 ⏱️ 6時間

`examples/full-stack.ts`:
- 4パッケージすべてを使った統合例
- FCMをモデルケースに

### Day 28: 公開ブログ ⏱️ 4時間

「2026年8月までにAIサービスがやるべき10のこと」

---

## 7. Week 5-8 — Phase 2: ドキュメント・コミュニティ・改善（Day 29-56）

### Week 5: ドキュメントサイト構築

#### Task 5.1: Mintlify セットアップ ⏱️ 6時間
- `apps/docs` 作成
- `oss.magi-platform.com` にデプロイ
- 4パッケージのリファレンス

#### Task 5.2: チュートリアル ⏱️ 8時間
- "Quick Start" (5分で動かす)
- "EU AI Act 90-day compliance plan" (本格ガイド)
- "From AGENTS.md to regulator submission"

### Week 6: コミュニティ立ち上げ

#### Task 6.1: Discord サーバー開設 ⏱️ 2時間
- チャンネル: #general, #help, #showcase, #compliance, #contributing
- ロール: Contributor, Beta Tester, Compliance Expert

#### Task 6.2: GitHub整備 ⏱️ 4時間
- Issue Templates
- Discussion有効化
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md

#### Task 6.3: 早期テスター10名募集 ⏱️ 継続
- Twitter/X、LinkedIn、HN等で募集
- 1on1ミーティング（30分×10）

### Week 7-8: フィードバック反映 + v0.2 計画

- v0.1の使用感フィードバック収集
- v0.2 のスコープ確定（hallucination/drift detector、Postgres storage、postmortem生成）
- バグ修正・小さな改善のリリース

---

## 8. Week 9-12 — Phase 3: v0.2 + MAGI Audit Beta準備（Day 57-84）

### Week 9-10: v0.2 リリース

各パッケージの主要機能拡張：

| パッケージ | v0.2の追加機能 |
|---|---|
| `@magi/incident` | hallucination/drift detector, Postgres storage, LangChain adapter, postmortem generation |
| `@magi/annex-iv` | docx出力, 多言語対応（日英） |
| `@magi/fria-forge` | 対話UI改善, テンプレートのCustom化 |
| `@magi/post-market` | Slack/Email通知, ダッシュボード（静的HTML出力） |

### Week 11-12: MAGI Audit Beta準備

#### Task 8.1: MAGI Audit リポジトリ作成 ⏱️ 4時間
- `github.com/unicornworks/magi-audit` (Private)
- Next.js + Supabase + Stripe
- OSSとのデータ互換性

#### Task 8.2: Beta機能MVP ⏱️ 40時間
- マルチシステムダッシュボード
- ユーザー認証（Supabase Auth）
- OSSからのデータインポート
- 簡易レビュー機能

#### Task 8.3: Beta募集 ⏱️ 4時間
- ランディングページ
- 招待リスト作成
- 5社へ個別アプローチ

---

## 9. Day 85-90 — Public Launch

### Task 9.1: Hacker News投稿 ⏱️ 2時間
- タイトル: "Show HN: MAGI – Open source SRE and compliance for AI agents (EU AI Act ready)"
- タイミング: 火-木の朝 (UTC 14:00 = JST 23:00)

### Task 9.2: Product Hunt投稿 ⏱️ 4時間
- スクリーンショット、デモ動画
- ハント担当を依頼（既存コミュニティから）

### Task 9.3: ピッチ資料更新 ⏱️ 6時間
- Pre-seed向けに、OSS実績を組み込む
- GitHub stars、npm DL、利用企業を追記

### Task 9.4: 90日振り返り ⏱️ 4時間
- KPI達成度評価
- 次の90日計画

---

## 10. ファイル構成最終形

```
github.com/unicornworks/magi/
├── .changeset/
├── .github/workflows/
│   ├── ci.yml
│   └── release.yml
├── .gitignore
├── .npmrc
├── .nvmrc
├── biome.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── turbo.json
├── README.md
├── LICENSE  (MIT)
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
│
├── packages/
│   ├── core/                  # 共通型
│   ├── incident/              # Project 1
│   ├── annex-iv/              # Project 2
│   ├── fria-forge/            # Project 3
│   └── post-market/           # Project 4
│
├── apps/
│   └── docs/                  # Mintlify ドキュメント
│
└── examples/
    ├── nerv-full-stack/
    ├── fcm-compliance/
    └── starter-template/
```

---

## 11. 進捗トラッキング

各タスクの完了状況をGitHub Projectsで管理：

```
github.com/unicornworks/magi/projects/1
- カラム: Backlog, Week N, In Progress, Review, Done
- 各タスクをIssueとして登録、PRとリンク
- 毎週日曜にレビュー（30分）
```

---

## 12. リスク対応

| リスク | トリガー | 対応 |
|---|---|---|
| `@magi` スコープ取得失敗 | Day 0 | 即座に `@magi-platform` 等の代替に切替 |
| Day 1の実装が間に合わない | Day 1終了時 | スコープ縮小: 検知器1つ + Responder1つ + Memory storageのみ |
| NERVへの組込みでバグ多発 | Day 6 | v0.1.0リリースを1週間延期、修正に専念 |
| HackerNewsで批判的コメント | Day 30 | 1日でissueに反映、改善PRを公開、誠実に対応 |
| Microsoft AGTが類似機能リリース | 任意 | 日本市場・中小企業特化で差別化、競合分析記事を出す |
| バーンアウト | 任意 | Discord開設後、外部コントリビューターに業務委譲 |

---

## 13. 即座に着手すべき3タスク（このドキュメントを読み終えたらすぐ）

1. **`npm org create magi`** を実行 (5分)
2. **GitHub `unicornworks` 組織作成 + `magi` repo作成** (15分)
3. **NPM_TOKEN 発行** (10分)

この3つが完了したら、Day 1の実装に入れる。

---

## 14. 補助資料（参照すべき外部リソース）

### 技術スタック
- Turborepo: https://turborepo.dev
- pnpm workspaces: https://pnpm.io/workspaces
- Changesets: https://github.com/changesets/changesets
- tsup: https://tsup.egoist.dev
- Vitest: https://vitest.dev
- Biome: https://biomejs.dev

### 規制関連
- EU AI Act 公式: https://artificialintelligenceact.eu
- Article 12 (Logging): https://artificialintelligenceact.eu/article/12/
- Article 27 (FRIA): https://artificialintelligenceact.eu/article/27/
- Article 72 (Post-market): https://artificialintelligenceact.eu/article/72/
- Article 73 (Serious Incidents): https://artificialintelligenceact.eu/article/73/
- DIHR/ECNL FRIA Guide: https://ecnl.org/publications/guide-fundamental-rights-impact-assessments-fria

### 競合参考（リスペクトを持って学ぶ）
- Langfuse: https://github.com/langfuse/langfuse
- @systima/aiact-audit-log: https://systima.ai
- Microsoft Agent Governance Toolkit: https://opensource.microsoft.com

---

## 15. 結論

**90日で4パッケージのv0.1リリース + MAGI Audit Beta準備完了**を目指す。

- Week 1: `@magi/incident` (主役)
- Week 2-4: 残り3パッケージ
- Week 5-8: ドキュメント + コミュニティ
- Week 9-12: v0.2 + MAGI Audit Beta準備

毎週末16時間 + 平日夜10時間 = **週26時間 × 12週 = 312時間**で完遂可能。

**最初の意思決定**: このドキュメントを読み終えたら、まず `npm org create magi` を実行する。それから次の戦略質問に進む。
