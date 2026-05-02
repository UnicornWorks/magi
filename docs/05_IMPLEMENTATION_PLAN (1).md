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
Week 0  (今すぐ)            : 環境準備・スコープ確保
Week 1  (Day 1-7)           : @magi/incident v0.1.0 ★
Week 2  (Day 8-14)          : @magi/annex-iv v0.1.0
Week 3  (Day 15-21)         : @magi/fria-forge v0.1.0
Week 4  (Day 22-28)         : @magi/post-market v0.1.0
Week 5  (Day 29-35)         : ドキュメントサイト構築 (oss.magi-platform.com)
Week 6  (Day 36-42)         : Discord開設・GitHub整備・早期テスター10名
Week 7  (Day 43-49)         : フィードバック反映・v0.2スコープ確定・HN準備
Week 8  (Day 50-56)         : Hacker News ローンチ・v0.2 リリース
Week 9  (Day 57-63)         : MAGI Audit Beta 設計・OSS↔Cloud bridge
Week 10 (Day 64-70)         : MAGI Audit Beta MVP・Stripe 統合
Week 11 (Day 71-77)         : ピッチ資料・Beta オンボーディング
Week 12 (Day 78-84)         : Public Launch (Product Hunt)・90日振り返り
Day 85-90                   : 90日締めくくり・VCアプローチ・Day 91-180計画
```

総工数: 約340時間（90日 × 平均3.8時間/日）

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

## 7. Week 5（Day 29-35）— ドキュメントサイト構築

このフェーズの目的：4パッケージを誰でも使えるようにするため、`oss.magi-platform.com` にプロフェッショナルなドキュメントサイトを公開する。

### Day 29（月、平日夜2時間）: Mintlify セットアップ ⏱️ 2時間

#### Task 5.1: Mintlifyアカウント作成 ⏱️ 30分

```bash
# Mintlify無料プランでサインアップ
# https://mintlify.com/start
# GitHubで認証 → unicornworks/magi リポジトリと連携
```

#### Task 5.2: docs ディレクトリ初期化 ⏱️ 1.5時間

```bash
cd magi
mkdir -p apps/docs
cd apps/docs

# Mintlify CLI
npm i -g mintlify
mintlify init
```

`apps/docs/mint.json`:
```json
{
  "$schema": "https://mintlify.com/schema.json",
  "name": "MAGI OSS",
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "favicon": "/favicon.svg",
  "colors": {
    "primary": "#7C3AED",
    "light": "#A78BFA",
    "dark": "#5B21B6"
  },
  "topbarLinks": [
    { "name": "GitHub", "url": "https://github.com/unicornworks/magi" }
  ],
  "topbarCtaButton": {
    "name": "MAGI Audit",
    "url": "https://magi-platform.com/audit"
  },
  "navigation": [
    {
      "group": "Get Started",
      "pages": ["introduction", "quickstart", "eu-ai-act-overview"]
    },
    {
      "group": "Packages",
      "pages": [
        "packages/incident",
        "packages/annex-iv",
        "packages/fria-forge",
        "packages/post-market"
      ]
    },
    {
      "group": "Guides",
      "pages": [
        "guides/eu-ai-act-90-day-plan",
        "guides/agents-md-to-annex-iv",
        "guides/incident-response-playbook"
      ]
    }
  ]
}
```

**完了条件 DoD**:
- [ ] `mintlify dev` でローカル動作確認
- [ ] git push後、Mintlifyが自動でビルド開始

### Day 30（火、平日夜2時間）: ランディングと Quick Start ⏱️ 2時間

#### Task 5.3: introduction.mdx ⏱️ 1時間

`apps/docs/introduction.mdx`:
```mdx
---
title: 'MAGI OSS Family'
description: 'Self-hostable SRE and compliance for AI agents. EU AI Act ready.'
---

## Why MAGI?

You ship AI agents to production. Then at 3 AM, one of them starts hallucinating
customer data, retrying the same API call 800 times, burning $2,000 in tokens
before anyone notices. Your existing observability tools didn't see it coming.

That's the problem MAGI solves.

## Four packages, one mission

<CardGroup cols={2}>
  <Card title="@magi/incident" icon="bell" href="/packages/incident">
    Detect, respond, and document AI agent incidents
  </Card>
  <Card title="@magi/annex-iv" icon="file-lines" href="/packages/annex-iv">
    Generate EU AI Act technical documentation from your codebase
  </Card>
  <Card title="@magi/fria-forge" icon="scale-balanced" href="/packages/fria-forge">
    Fundamental Rights Impact Assessment templates
  </Card>
  <Card title="@magi/post-market" icon="chart-line" href="/packages/post-market">
    Article 72 monitoring and Article 73 reporting
  </Card>
</CardGroup>

## Built from production

MAGI is dogfooded daily by [NERV](https://github.com/sol12378/nerv-obsidian),
a 15-agent AI organization running 24/7 since 2026.
```

#### Task 5.4: quickstart.mdx ⏱️ 1時間

5分で動くExampleを提示。`@magi/incident` のbasic usageを中心に。

**完了条件**:
- [ ] introduction と quickstart がローカルで表示される
- [ ] 内部リンクが全て機能する

### Day 31（水、平日夜2時間）: パッケージリファレンス ⏱️ 2時間

#### Task 5.5: 各パッケージのリファレンスページ ⏱️ 2時間

4ページ作成（`packages/incident.mdx` 等）。各ページに：
- Install
- API リファレンス（主要クラス・関数の型定義 + 説明）
- Code examples
- Troubleshooting

`packages/incident.mdx` テンプレート例：
```mdx
---
title: '@magi/incident'
description: 'Self-hostable incident management for AI agents'
---

## Install

<CodeGroup>
\`\`\`bash npm
npm install @magi/incident
\`\`\`

\`\`\`bash pnpm
pnpm add @magi/incident
\`\`\`
</CodeGroup>

## Core API

### `MagiIncident`

The main class that orchestrates detection and response.

\`\`\`typescript
const magi = new MagiIncident({
  systemId: 'my-agent',
  storage: memoryStorage(),
  detectors: [...],
  responders: [...],
})
\`\`\`

### Detectors

<AccordionGroup>
  <Accordion title="infiniteLoopDetector">
    Detects when the same tool is called repeatedly within a time window.
    [Source](https://github.com/unicornworks/magi/blob/main/packages/incident/src/detectors/infinite-loop.ts)
  </Accordion>
  <Accordion title="costSpikeDetector">
    Detects when current cost rate exceeds baseline by a multiplier.
  </Accordion>
</AccordionGroup>
```

**完了条件**:
- [ ] 4パッケージのリファレンスページが揃う
- [ ] APIシグネチャが実装と一致

### Day 32（木、平日夜2時間）: チュートリアル "EU AI Act 90-day plan" ⏱️ 2時間

#### Task 5.6: 主要ガイド執筆 ⏱️ 2時間

`guides/eu-ai-act-90-day-plan.mdx`:

実際の中小企業がEU AI Act対応を90日で完了するための具体的手順を、MAGI OSSを使って解説：

```
Day 1-30: AI inventory + 高リスク分類
  - @magi/annex-iv で AI システム棚卸し
  - Annex III 該当性チェック

Day 31-60: ログ + 監視
  - @magi/incident デプロイ
  - @magi/post-market でモニタリング開始

Day 61-90: 文書 + FRIA
  - @magi/annex-iv build で技術文書ドラフト
  - @magi/fria-forge init で FRIA 作成
  - 法務レビュー → CE marking 準備
```

**完了条件**:
- [ ] 90日プランのガイドが完成
- [ ] FCMの実例で各ステップを検証済み

### Day 33（金、平日夜2時間）: チュートリアル残り2本 ⏱️ 2時間

#### Task 5.7: 残り2ガイド ⏱️ 2時間

`guides/agents-md-to-annex-iv.mdx`:
- AGENTS.md の書き方ベストプラクティス
- `@magi/annex-iv build` でAnnex IVに変換
- 出力例とレビュー方法

`guides/incident-response-playbook.mdx`:
- 検知 → 対応 → ポストモーテム の標準フロー
- NERV の実例
- カスタム検知器の書き方

**完了条件**:
- [ ] 3つのガイドすべてが揃う
- [ ] 各ガイドにコード例が3つ以上

### Day 34（土）: ドメイン接続 + ロゴ ⏱️ 6-8時間

#### Task 5.8: oss.magi-platform.com にデプロイ ⏱️ 2時間

```
1. Mintlifyダッシュボードで Custom Domain 設定
2. magi-platform.com の DNS 管理画面で:
   CNAME oss → cname.mintlify.app (実際の値はMintlify指示に従う)
3. SSL証明書の自動発行を待つ (通常1時間以内)
```

#### Task 5.9: ロゴ・ブランディング ⏱️ 4時間

オプション選択：
- A. Figmaで自作（シンプルなワードマーク）
- B. Fiverr でデザイナーに発注（$50-150）
- C. Looka 等のAIロゴジェネレーター

推奨：**A（自作）**。シンプルなワードマークで十分。後で変更可能。

スタイル方向性：
- 三賢人（MAGI = Magi、東方の三博士）モチーフ
- 紫系（#7C3AED）+ 黒
- ミニマル

**完了条件**:
- [ ] `https://oss.magi-platform.com` でアクセスできる
- [ ] ロゴ（SVG）が完成、Mintlifyに反映

### Day 35（日）: バッファ + コミット ⏱️ 4時間

#### Task 5.10: 全体レビュー ⏱️ 2時間
- 全ページを読み返し、誤字・リンク切れ修正
- モバイル表示確認

#### Task 5.11: ローンチ告知準備 ⏱️ 2時間
- ドキュメントサイト公開のSNS告知文を準備
- スクリーンショット撮影

**Week 5 完了条件**:
- [ ] `oss.magi-platform.com` が完全公開
- [ ] 4パッケージのリファレンス完備
- [ ] 3つの実用ガイド完備
- [ ] X/LinkedIn で告知投稿実施

---

## 8. Week 6（Day 36-42）— コミュニティ立ち上げ

### Day 36（月、平日夜2時間）: Discord サーバー開設 ⏱️ 2時間

#### Task 6.1: Discord 構築 ⏱️ 1時間

```
チャンネル構成:
📢 announcements         (リード専用、リリース告知)
👋 introductions         (自己紹介)
💬 general               (雑談)
🆘 help                  (Q&A)
🔍 incident-help         (@magi/incident 個別)
📋 compliance-help       (Annex IV / FRIA / Article 72,73)
🎉 showcase              (利用事例)
🛠️ contributing          (PR・Issue議論)
🇯🇵 japanese             (日本語チャンネル)

ロール:
- @Contributor       (1 PR以上マージされた人)
- @Beta Tester       (MAGI Audit Beta)
- @Compliance Expert (法務・コンプライアンス専門家)
- @Maintainer        (りゅういち + 将来のメンバー)
```

#### Task 6.2: ウェルカムBot設定 ⏱️ 30分

MEE6 or Carl-bot で自動ウェルカムメッセージ：
```
👋 Welcome to MAGI OSS, {user}!

📚 Docs: https://oss.magi-platform.com
🐙 GitHub: https://github.com/unicornworks/magi
📦 npm: @magi/incident, @magi/annex-iv, @magi/fria-forge, @magi/post-market

Please read #rules and introduce yourself in #introductions!
```

#### Task 6.3: Discord招待リンクを各所に追加 ⏱️ 30分
- ドキュメントサイトのフッター
- GitHubの README、各 packages の README
- Twitter プロフィール

**完了条件 DoD**:
- [ ] Discordサーバー稼働
- [ ] 招待リンクが各所に追加

### Day 37（火、平日夜2時間）: GitHub コミュニティ整備 ⏱️ 2時間

#### Task 6.4: Issue Templates ⏱️ 30分

`.github/ISSUE_TEMPLATE/bug_report.yml`:
```yaml
name: Bug Report
description: Report a bug in @magi/* packages
labels: ["bug", "triage"]
body:
  - type: dropdown
    id: package
    attributes:
      label: Package
      options:
        - "@magi/incident"
        - "@magi/annex-iv"
        - "@magi/fria-forge"
        - "@magi/post-market"
        - "@magi/core"
        - "Other"
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: What happened?
    validations:
      required: true
  - type: textarea
    id: reproduce
    attributes:
      label: Steps to Reproduce
  - type: textarea
    id: env
    attributes:
      label: Environment
      placeholder: |
        - OS: macOS 14
        - Node: 22.5.0
        - Package version: @magi/incident@0.1.2
```

`.github/ISSUE_TEMPLATE/feature_request.yml` と `.github/ISSUE_TEMPLATE/regulatory_question.yml` も同様に作成。

#### Task 6.5: Discussions有効化 ⏱️ 15分

GitHub repo Settings > Features > Discussions ON

カテゴリ：
- 💡 Ideas
- 🙏 Q&A
- 📢 Announcements
- 🎉 Show and tell
- 🇪🇺 Compliance Questions

#### Task 6.6: CONTRIBUTING.md ⏱️ 45分

```markdown
# Contributing to MAGI OSS

Thanks for considering contributing! Here's how.

## Development setup

1. Fork & clone
2. `pnpm install`
3. `pnpm build` (verify build works)
4. `pnpm test` (verify tests pass)

## Making a change

1. Create a branch: `git checkout -b feat/my-feature`
2. Make changes
3. Add tests
4. Add a changeset: `pnpm changeset` (select packages, type, summary)
5. Push and open a PR

## Code style

- Biome enforces formatting/linting
- TypeScript strict mode
- Tests required for all new features

## DCO (no CLA needed)

We use the [Developer Certificate of Origin](https://developercertificate.org).
Sign your commits with `git commit -s`.

## License

By contributing, you agree your contributions are MIT-licensed.
```

#### Task 6.7: CODE_OF_CONDUCT.md ⏱️ 30分

Contributor Covenant 2.1 をそのまま採用。

**完了条件**:
- [ ] Issue Templates 3種類完成
- [ ] Discussions 有効化、カテゴリ設定済
- [ ] CONTRIBUTING.md, CODE_OF_CONDUCT.md コミット済

### Day 38（水、平日夜2時間）: 早期テスター募集（10名）⏱️ 2時間

#### Task 6.8: 募集投稿 ⏱️ 1時間

X/Twitter:
```
🚀 MAGI OSS Family を本番運用してくれる早期テスターを10名募集します！

特典:
✅ 1on1 オンボーディング (30分)
✅ 機能要望優先対応
✅ MAGI Audit Beta 早期招待
✅ Discord @Beta Tester ロール

応募: フォームURL or DM
対象: AIエージェントを本番運用している方
#AIエージェント #EUAI法 #OSS
```

LinkedIn 英語版も同様に投稿。

#### Task 6.9: 応募フォーム作成 ⏱️ 30分

Tally.so or Google Forms で：
- 名前、会社、役割
- 使っているAIフレームワーク
- 月間LLMコスト目安
- 興味あるパッケージ
- EU AI Act 対応状況

#### Task 6.10: 既存ネットワークへの個別DM ⏱️ 30分
- 過去にやり取りした開発者15-20名にDM
- ターゲット：AIエージェント開発者、SREエンジニア、コンプライアンス担当者

**完了条件**:
- [ ] 募集投稿が公開されている
- [ ] フォーム稼働
- [ ] 個別DM 15通以上送信

### Day 39（木、平日夜2時間）: ブログ記事「90日でEU AI Act対応」⏱️ 2時間

#### Task 6.11: Zenn 日本語記事執筆 ⏱️ 2時間

タイトル: 「90日で AI サービスを EU AI Act 対応にする方法 — MAGI OSS で」

構成:
1. 2026年8月のEU AI Act発効と日本企業への影響
2. 必要な4つの作業：ログ・文書・FRIA・モニタリング
3. MAGI OSSで90日プラン
4. FCMをモデルケースに具体的手順
5. まとめ＋呼びかけ

**完了条件**:
- [ ] Zenn 公開
- [ ] X で告知

### Day 40（金、平日夜2時間）: テスター応募者対応開始 ⏱️ 2時間

#### Task 6.12: 応募者スクリーニング ⏱️ 30分
- 応募内容を見て、優先度の高い10名選定
- 全員にThank youメール送信

#### Task 6.13: オンボーディング日程調整 ⏱️ 30分
- Calendly等で30分枠を10個用意
- 各テスターに招待

#### Task 6.14: オンボーディング資料準備 ⏱️ 1時間
- スクリーン共有用スライド
- インストール手順
- ヒアリング項目

**完了条件**:
- [ ] 10名のオンボーディング日程確定
- [ ] 資料準備完了

### Day 41（土）: テスターオンボーディング Day 1 ⏱️ 6-8時間

#### Task 6.15: 1on1 オンボーディング ×5 ⏱️ 5時間

- 各30分 + 議事録30分 = 1時間/人 × 5 = 5時間
- 内容：ユースケース確認、インストール支援、フィードバック収集

#### Task 6.16: 議事録まとめ ⏱️ 2時間
- 共通課題の抽出
- v0.2 へのフィードバック反映候補

### Day 42（日）: テスターオンボーディング Day 2 + 振り返り ⏱️ 6-8時間

#### Task 6.17: 1on1 オンボーディング ×5 ⏱️ 5時間

#### Task 6.18: Week 6 振り返り + Week 7 計画 ⏱️ 2時間
- KPI確認: GitHub stars / npm DL / Discord メンバー
- 学びをドキュメント化
- v0.2 へのフィードバック整理

**Week 6 完了条件**:
- [ ] Discord サーバー稼働、招待リンク稼働
- [ ] GitHub Issue Templates / Discussions 設定済
- [ ] 早期テスター10名のオンボーディング完了
- [ ] フィードバック議事録 10件完成

---

## 9. Week 7（Day 43-49）— v0.2 計画 + バグ修正スプリント

### Day 43（月、平日夜2時間）: フィードバック分析 ⏱️ 2時間

#### Task 7.1: フィードバック分類 ⏱️ 1.5時間

10名分のフィードバックを以下に分類：
- 🐛 Bug（即時修正）
- 🔧 Improvement（v0.1.x patch）
- ✨ Feature（v0.2 候補）
- 📚 Documentation gap

GitHub Projects に登録。

#### Task 7.2: v0.2 スコープ確定 ⏱️ 30分

```
@magi/incident v0.2.0:
  - hallucination detector (golden dataset比較)
  - drift detector (embedding distribution)
  - Postgres storage
  - Supabase storage
  - LangChain adapter
  - Vercel AI SDK adapter
  - postmortem auto-generation
  - hash chain (opt-in)

@magi/annex-iv v0.2.0:
  - docx exporter
  - 多言語対応 (en, ja)
  - 差分更新モード (`--diff`)

@magi/fria-forge v0.2.0:
  - 対話 CLI 改善 (inquirer.js)
  - カスタムテンプレートサポート
  - Annex III 自動判定の精度向上

@magi/post-market v0.2.0:
  - Slack/Email 通知
  - HTML 静的ダッシュボード生成
  - Article 73 自動トリガーの精緻化
```

**完了条件**:
- [ ] v0.2 スコープがGitHub Projectsに登録
- [ ] 各タスクに優先度とestimateが付与

### Day 44-46（火-木、平日夜計6時間）: バグ修正 + パッチリリース ⏱️ 6時間

#### Task 7.3: 緊急バグ修正 ⏱️ 2-4時間

フィードバックから出た上位3バグを修正。各：
- 再現テスト追加
- 修正
- changeset追加

#### Task 7.4: v0.1.x パッチリリース ⏱️ 1-2時間

```bash
# changesets で patch リリース
pnpm changeset
# Type: patch
# Summary: "Fix: ..."

# main にマージ → 自動 publish
```

#### Task 7.5: ドキュメント修正 ⏱️ 1-2時間

フィードバックで判明したドキュメントの不足箇所を修正。

**完了条件**:
- [ ] 上位3バグ修正完了
- [ ] パッチバージョンが npm publish 済
- [ ] ドキュメント更新

### Day 47（金、平日夜2時間）: Hacker News 準備 ⏱️ 2時間

#### Task 7.6: HN 投稿原稿準備 ⏱️ 2時間

Show HN 形式で：

```
Show HN: MAGI – Open source SRE and compliance for AI agents (EU AI Act)

Hi HN,

I've been running a 15-agent autonomous AI organization (NERV) in
production for 6+ months on a $200/month Mac Mini. Existing tools
(Langfuse, Helicone) helped with debugging, but when an agent
went into a $500 infinite loop at 3 AM, nothing alerted me.

So I built MAGI — 4 MIT-licensed packages for incident management
and EU AI Act compliance specifically for AI agents:

- @magi/incident — detect loops/cost spikes/hallucinations + auto-respond
- @magi/annex-iv — generate EU AI Act technical docs from your codebase
- @magi/fria-forge — Fundamental Rights Impact Assessment templates
- @magi/post-market — Article 72 monitoring + Article 73 reporting

It's been running NERV 24/7 for 4 weeks. EU AI Act enforcement
hits Aug 2, 2026, so I'm releasing it now to help others get
ready.

Docs: https://oss.magi-platform.com
GitHub: https://github.com/unicornworks/magi

Happy to answer questions about EU AI Act, AI agent SRE patterns,
or the architecture decisions.
```

投稿予定：Day 50（月）の UTC 14:00 = JST 23:00

**完了条件**:
- [ ] HN 投稿原稿完成
- [ ] スクリーンショット 3枚準備
- [ ] 想定Q&A 10問の答え準備

### Day 48-49（土日）: v0.2 開発スプリント Day 1-2 ⏱️ 14時間

#### Task 7.7: @magi/incident v0.2 — Postgres storage ⏱️ 4時間

`packages/incident/src/storage/postgres.ts`:
```typescript
import type { Storage, Incident, AgentEvent } from "../types.js"
import type { SystemId } from "@magi/core"

export interface PostgresStorageOptions {
  connectionString: string
  tableName?: { incidents?: string; events?: string }
}

// pg ライブラリを使った実装
// SQL: CREATE TABLE magi_incidents (...) スキーマ作成も自動
// インデックス: (system_id, detected_at DESC)
// JSONB カラム: evidence, context, metrics
```

スキーマ migrations も含める：
```sql
-- packages/incident/src/storage/postgres-schema.sql
CREATE TABLE IF NOT EXISTS magi_incidents (
  id UUID PRIMARY KEY,
  system_id TEXT NOT NULL,
  detector TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  detected_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  evidence JSONB NOT NULL,
  context JSONB,
  metrics JSONB
);
CREATE INDEX IF NOT EXISTS idx_magi_incidents_system_time
  ON magi_incidents(system_id, detected_at DESC);

CREATE TABLE IF NOT EXISTS magi_events (
  system_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost NUMERIC,
  latency_ms INTEGER,
  tool_calls TEXT[],
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_magi_events_system_time
  ON magi_events(system_id, timestamp DESC);
```

#### Task 7.8: @magi/incident v0.2 — Supabase storage ⏱️ 2時間

`packages/incident/src/storage/supabase.ts` — Postgres版のラッパー。Supabase JS client使用。

#### Task 7.9: @magi/incident v0.2 — hallucination detector ⏱️ 4時間

`packages/incident/src/detectors/hallucination.ts`:
```typescript
import type { Detector } from "../types.js"

export interface HallucinationOptions {
  goldenDataset: { input: string; expectedKeywords: string[] }[]
  similarityThreshold?: number
  sampleRate?: number  // どれくらいの割合をサンプリングするか
}

// 実装方針:
// 1. recent events から output と一致する golden を探す
// 2. expected keywords が含まれているかチェック
// 3. 含まれていない比率が閾値超なら incident
```

#### Task 7.10: テスト追加 ⏱️ 2時間

新規追加した3コンポーネントの単体テスト。

#### Task 7.11: NERV で本番テスト ⏱️ 2時間

NERV にPostgres版とhallucination detectorをデプロイ。1日動かして問題ないか確認。

**完了条件 (Day 48-49)**:
- [ ] Postgres / Supabase storage 動作
- [ ] hallucination detector 動作
- [ ] テスト追加
- [ ] NERV 本番投入

---

## 10. Week 8（Day 50-56）— Hacker News ローンチ + v0.2 リリース

### Day 50（月）: Hacker News 投稿日 ⏱️ 終日対応

#### Task 8.1: 朝のチェック ⏱️ 30分

- パッケージが npm で正常にインストールできるか
- ドキュメントサイトが正常に表示されるか
- GitHub repo がパブリックで見られるか

#### Task 8.2: JST 23:00 (UTC 14:00) に HN 投稿 ⏱️ 5分

直接 https://news.ycombinator.com/submit から投稿。

#### Task 8.3: 投稿後の対応 ⏱️ 5-8時間

- 30分以内: 全コメントに丁寧に返信
- 4時間以内: フロントページに上がるか観察
- 批判的なコメントには冷静かつ具体的に応答（非戦闘的）
- バグ報告があれば即座にissue化

```
Tips:
- 自己アップボートはNG
- 友人にアップボート依頼もNG（HNが検知しペナルティ）
- ただし「投稿しました」と告知し、興味ある人に見てもらうのはOK
```

#### Task 8.4: SNS連動 ⏱️ 30分

X 投稿:
```
Show HN に MAGI を投稿しました 🚀
https://news.ycombinator.com/item?id=...

EU AI Act 対応のための4つのOSSパッケージです。
NERV (15体のAIエージェント) で実戦投入済み。
```

LinkedIn 英語版でも告知。

**完了条件**:
- [ ] HN投稿実施
- [ ] 全コメントに返信（24時間以内）
- [ ] バグ報告は即時issue化

### Day 51（火、平日夜2時間）: HN 余波対応 ⏱️ 2時間

#### Task 8.5: トラフィック分析 ⏱️ 1時間
- npm DL 増加確認
- GitHub stars 増加確認
- Discord 加入者確認
- ドキュメントサイト訪問者数確認

#### Task 8.6: 急ぎのbug fix ⏱️ 1時間

HNコメントから判明した即時修正可能なbugを修正、パッチリリース。

### Day 52（水、平日夜2時間）: v0.2 開発続き — postmortem 自動生成 ⏱️ 2時間

#### Task 8.7: @magi/incident v0.2 — postmortem 生成 ⏱️ 2時間

`packages/incident/src/postmortem/generator.ts`:
```typescript
export interface PostmortemOptions {
  template?: "blameless" | "google-sre" | "atlassian"
  llmProvider?: "anthropic" | "openai" | "none"  // none = テンプレートのみ
  apiKey?: string
}

export async function generatePostmortem(
  incident: Incident,
  events: AgentEvent[],
  options: PostmortemOptions = {},
): Promise<string> {
  // 1. テンプレートを選択
  // 2. incident 情報を埋め込み
  // 3. timeline を events から構築
  // 4. LLM があれば root cause hypothesis を生成
  // 5. Markdown 出力
}
```

### Day 53（木、平日夜2時間）: v0.2 開発 — drift detector ⏱️ 2時間

#### Task 8.8: @magi/incident v0.2 — drift detector ⏱️ 2時間

embedding分布の変化を検知。簡易版：
- recent events の output を embed
- baseline embeddings との Wasserstein distance 計算
- 閾値超なら incident

ライブラリ使用：`@xenova/transformers` で軽量embedding。

### Day 54（金、平日夜2時間）: v0.2 開発 — LangChain / Vercel AI SDK adapter ⏱️ 2時間

#### Task 8.9: Adapters ⏱️ 2時間

`packages/incident/src/adapters/langchain.ts`:
```typescript
// LangChain BaseCallbackHandler を実装
// on_llm_start, on_llm_end, on_tool_start, on_tool_end をフック
// MagiIncident.record() に変換して送る
```

`packages/incident/src/adapters/vercel-ai.ts`:
```typescript
// Vercel AI SDK の generateText/streamText をラップ
export function withMagi(magi: MagiIncident, generateTextFn: typeof generateText) {
  return async (...args) => {
    const start = Date.now()
    const result = await generateTextFn(...args)
    await magi.record({
      model: result.modelId,
      inputTokens: result.usage.promptTokens,
      outputTokens: result.usage.completionTokens,
      latencyMs: Date.now() - start,
    })
    return result
  }
}
```

### Day 55（土）: v0.2 統合テスト + リリース準備 ⏱️ 8時間

#### Task 8.10: 統合テスト ⏱️ 4時間
- 全 v0.2 機能を結合テスト
- @magi/annex-iv の docx exporter 実装
  - `docx` (npm) ライブラリ使用
  - スキル参照（前回の docx skill 経験）
- @magi/fria-forge の対話 CLI 改善（inquirer.js 導入）
- @magi/post-market の HTML ダッシュボード
  - 静的HTML出力（Tailwind CDN + Chart.js）

#### Task 8.11: changeset 作成 ⏱️ 30分

各パッケージにminor changeset追加：
```bash
pnpm changeset
# Select: @magi/incident, @magi/annex-iv, @magi/fria-forge, @magi/post-market
# Type: minor
# Summaries書き込み
```

#### Task 8.12: ドキュメント更新 ⏱️ 3時間
- 新機能のリファレンス追加
- マイグレーションガイド v0.1 → v0.2

#### Task 8.13: NERV 全環境を v0.2 に更新 ⏱️ 30分

**完了条件**:
- [ ] v0.2 統合テスト green
- [ ] changeset コミット済
- [ ] ドキュメント更新済

### Day 56（日）: v0.2 リリース + 告知 ⏱️ 6時間

#### Task 8.14: v0.2 リリース ⏱️ 1時間

main にマージ → Changesets が Version Packages PR を作成 → マージ → 自動 publish

#### Task 8.15: リリースアナウンス ⏱️ 3時間

Zenn 記事「MAGI v0.2 リリース — Postgres対応・hallucination検知・LangChain統合」

X 投稿、LinkedIn 投稿、Discord #announcements で告知。

#### Task 8.16: Week 5-8 振り返り + KPI確認 ⏱️ 2時間

中間KPIチェック (Day 56時点):
- GitHub Stars 目標 200+ → 実績?
- npm 週間DL 目標 500+ → 実績?
- Discord メンバー 目標 50+ → 実績?
- 早期テスター継続率 目標 70%+ → 実績?

**Week 8 完了条件**:
- [ ] HN 投稿実施・対応完了
- [ ] v0.2 4パッケージ npm publish 済
- [ ] 中間KPI レポート完成

---

## 11. Week 9（Day 57-63）— MAGI Audit Beta 設計

このフェーズの目的：商用版「MAGI Audit」のBeta MVP仕様を確定し、開発に着手する。

### Day 57（月、平日夜2時間）: MAGI Audit リポジトリ作成 ⏱️ 2時間

#### Task 9.1: 別リポジトリ作成 ⏱️ 30分

```bash
# GitHub で unicornworks/magi-audit (Private) を作成
git clone git@github.com:unicornworks/magi-audit.git
cd magi-audit
```

#### Task 9.2: Next.js 15 + Supabase + Stripe 構成 ⏱️ 1.5時間

```bash
pnpm create next-app@latest . --typescript --tailwind --app --turbopack
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add stripe @stripe/stripe-js
pnpm add @magi/incident @magi/annex-iv @magi/fria-forge @magi/post-market
```

`.env.local` 雛形:
```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=  # ← NEXT_PUBLIC_ を絶対つけない
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**完了条件**:
- [ ] `pnpm dev` で localhost:3000 が起動
- [ ] Supabase Tokyo プロジェクトに接続成功

### Day 58（火、平日夜2時間）: データモデル設計 ⏱️ 2時間

#### Task 9.3: Supabase スキーマ ⏱️ 2時間

```sql
-- organizations: 顧客企業
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- members: 組織メンバー
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'reviewer', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- systems: 監視対象のAIシステム
CREATE TABLE systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  system_id TEXT NOT NULL,  -- @magi/* の SystemId
  name TEXT NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('minimal', 'limited', 'high', 'unacceptable')),
  annex_iii_point INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, system_id)
);

-- incidents: OSS から取り込んだインシデント
CREATE TABLE incidents (
  id UUID PRIMARY KEY,  -- @magi/incident の id をそのまま使う
  system_uuid UUID NOT NULL REFERENCES systems(id),
  detector TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  detected_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  evidence JSONB,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_incidents_system_time ON incidents(system_uuid, detected_at DESC);

-- ingestion_tokens: OSS → MAGI Audit のデータ送信用
CREATE TABLE ingestion_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  system_uuid UUID REFERENCES systems(id),
  token TEXT UNIQUE NOT NULL,  -- ハッシュ化して保存
  name TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_tokens ENABLE ROW LEVEL SECURITY;

-- ポリシー: メンバーは自組織のみアクセス
CREATE POLICY "members access own org" ON systems
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid())
  );
-- 同様に他テーブルも
```

**完了条件**:
- [ ] スキーマがSupabase上で作成完了
- [ ] RLSポリシー設定済
- [ ] ローカルのprismaまたはdrizzleで型生成

### Day 59-60（水・木、平日夜計4時間）: 認証 + Org作成フロー ⏱️ 4時間

#### Task 9.4: Supabase Auth セットアップ ⏱️ 2時間

`app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`:
- Email/Password + Google OAuth
- サインアップ時に組織自動作成

#### Task 9.5: 組織管理画面 ⏱️ 2時間

`app/(dashboard)/settings/organization/page.tsx`:
- 組織名変更
- メンバー招待（email base）
- ロール管理

**完了条件**:
- [ ] サインアップ→組織作成→ダッシュボード遷移
- [ ] メンバー招待機能稼働

### Day 61（金、平日夜2時間）: Ingestion API 設計 ⏱️ 2時間

#### Task 9.6: API Route 設計 ⏱️ 2時間

`app/api/ingest/incidents/route.ts`:
```typescript
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // 1. Authorization: Bearer <token> をチェック
  const token = req.headers.get("Authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "missing token" }, { status: 401 })

  // 2. token から org_id, system_uuid を取得 (RLS bypass で service_role)
  const tokenRecord = await lookupToken(token)
  if (!tokenRecord) return NextResponse.json({ error: "invalid token" }, { status: 401 })

  // 3. body から incidents 配列を取り込み
  const { incidents } = await req.json()
  // バリデーション (zod)
  // 取り込み (upsert)
  // last_used_at 更新

  return NextResponse.json({ ingested: incidents.length })
}
```

`app/api/ingest/events/route.ts` も同様に。

**完了条件**:
- [ ] Ingest API 2エンドポイント稼働
- [ ] 認証エラーハンドリング動作
- [ ] curl でテスト成功

### Day 62（土）: ダッシュボード MVP Day 1 ⏱️ 8時間

#### Task 9.7: システム一覧画面 ⏱️ 2時間

`app/(dashboard)/systems/page.tsx`:
- 登録システム一覧
- リスクレベル、最近のインシデント数表示
- "Add System" ボタン

#### Task 9.8: システム詳細画面 ⏱️ 3時間

`app/(dashboard)/systems/[id]/page.tsx`:
- インシデント timeline
- メトリクス（cost, latency, errors）
- 直近のevents表示

#### Task 9.9: インシデント詳細 ⏱️ 2時間

`app/(dashboard)/incidents/[id]/page.tsx`:
- evidence 表示
- 担当者アサイン
- レビュー機能（コメント、ステータス変更）

#### Task 9.10: Token 発行UI ⏱️ 1時間

`app/(dashboard)/settings/tokens/page.tsx`:
- 新規発行
- 既存トークン一覧
- 取り消し機能

**完了条件**:
- [ ] 4画面が動作
- [ ] OSS から ingest → ダッシュボード表示の一連の流れが動く

### Day 63（日）: OSS → Audit ブリッジパッケージ ⏱️ 6時間

#### Task 9.11: `@magi/incident-cloud-sync` 設計 ⏱️ 1時間

OSS のmonorepo に新パッケージ追加。OSSデータをMAGI Auditに送信する役割。

#### Task 9.12: 実装 ⏱️ 4時間

`packages/incident-cloud-sync/src/index.ts`:
```typescript
import type { Storage, Incident, AgentEvent } from "@magi/incident"
import type { SystemId } from "@magi/core"

export interface CloudSyncOptions {
  endpoint?: string  // default: https://magi-platform.com/api/ingest
  token: string
  batchSize?: number
  flushIntervalMs?: number
}

export function cloudSyncStorage(
  underlying: Storage,
  options: CloudSyncOptions,
): Storage {
  // underlying をラップして、save() / recordEvent() の度にバッファに追加
  // 一定数 or 一定時間で MAGI Audit に POST
  // ...
}
```

#### Task 9.13: ドキュメント更新 ⏱️ 1時間

OSS のドキュメントに「Connect to MAGI Audit」セクション追加。

**完了条件**:
- [ ] @magi/incident-cloud-sync 動作
- [ ] OSS → MAGI Audit へのデータ流入確認

---

## 12. Week 10（Day 64-70）— MAGI Audit Beta MVP仕上げ + Pricing

### Day 64-65（月火、平日夜計4時間）: Stripe 統合 ⏱️ 4時間

#### Task 10.1: Stripe商品設定 ⏱️ 30分

Stripe Dashboard で商品作成：
- MAGI Audit Free (¥0)
- MAGI Audit Pro (¥9,800/月)
- MAGI Audit Team (¥39,800/月)
- MAGI Audit Enterprise (Custom, manual contract)

#### Task 10.2: Embedded Checkout 統合 ⏱️ 2.5時間

`app/(dashboard)/billing/page.tsx`:
```typescript
// Stripe Embedded Checkout (ui_mode: 'embedded')
// FCM案件と同じパターンで実装
```

#### Task 10.3: Webhook ⏱️ 1時間

`app/api/webhooks/stripe/route.ts`:
- 5 events: customer.created, subscription.created, subscription.updated, subscription.deleted, invoice.payment_succeeded

**完了条件**:
- [ ] Pro プランへの subscription が動作
- [ ] Webhook で organizations.plan が更新される

### Day 66（水、平日夜2時間）: ランディングページ ⏱️ 2時間

#### Task 10.4: magi-platform.com/audit ⏱️ 2時間

`app/(marketing)/audit/page.tsx`:
- ヒーロー: "Team workflows for MAGI OSS"
- 価格表
- スクリーンショット
- "Start free" CTA

**完了条件**:
- [ ] ランディング公開
- [ ] サインアップフォーム動作

### Day 67-68（木金、平日夜計4時間）: バグ修正 + UX磨き ⏱️ 4時間

#### Task 10.5: 通しテスト ⏱️ 2時間

- 新規サインアップ → org作成 → token発行 → OSSから ingest → 表示 → Pro upgrade
- 全フローを実行、バグ列挙

#### Task 10.6: バグ修正 ⏱️ 2時間

### Day 69（土）: Beta 招待者選定 + 個別アプローチ ⏱️ 6時間

#### Task 10.7: 招待者リスト作成 ⏱️ 1時間

10社候補：
- 早期テスター10名から、企業所属者を優先
- LinkedIn / X でAIエージェント運用してそうな人
- FCM 関連クライアント (Rehabnic, Fishland)

#### Task 10.8: 個別アプローチメール ⏱️ 3時間

各招待先にカスタマイズしたDM/メール：
```
Subject: MAGI Audit Beta へのご招待

OSSの @magi/incident をご利用頂きありがとうございます。
Team向けの商用版 MAGI Audit のクローズドBetaを開始します。

3ヶ月無料 + 専用Slackサポート、いかがでしょうか？

返信頂ければBeta枠（残り◯枠）にお招きします。
```

#### Task 10.9: Onboarding資料 ⏱️ 2時間

PDF or Notion ページで Beta 専用ガイド作成。

**完了条件**:
- [ ] 招待メール 10通送信
- [ ] Onboarding資料 完成

### Day 70（日）: Beta 受付開始 + Week 9-10 振り返り ⏱️ 6時間

#### Task 10.10: Beta 申し込みフォーム ⏱️ 1時間

Tally.so でBeta用フォーム。条件付き：
- 早期テスター か 個別招待のみ受付
- フォーム → Stripeのfree planに自動誘導

#### Task 10.11: 申込み対応開始 ⏱️ 2時間

- 即時対応で評価上げる
- Calendly でオンボーディングMTG設定

#### Task 10.12: Week 9-10 振り返り ⏱️ 3時間

- KPI: Beta sign-up数、契約意向確認数、フィードバック品質
- 学びをドキュメント化

**Week 10 完了条件**:
- [ ] MAGI Audit Beta MVP 公開
- [ ] Stripe billing 動作
- [ ] ランディングページ公開
- [ ] Beta 申込み受付開始

---

## 13. Week 11（Day 71-77）— 第2回コミュニティ拡大 + ピッチ準備

### Day 71（月、平日夜2時間）: Beta フィードバック収集開始 ⏱️ 2時間

#### Task 11.1: 申込み済 Beta ユーザーへの個別オンボーディング日程調整 ⏱️ 2時間

### Day 72（火、平日夜2時間）: 第2回ブログ記事 ⏱️ 2時間

#### Task 11.2: dev.to 英語記事 ⏱️ 2時間

タイトル: "Building a 15-agent AI organization on a $200 Mac mini"

NERVのアーキテクチャ、MAGI OSSの実装思想を技術的に深堀り。

### Day 73（水、平日夜2時間）: ピッチ資料更新 Day 1 ⏱️ 2時間

#### Task 11.3: トラクションスライド作成 ⏱️ 2時間

Pre-seed 向けピッチに以下を追加：
- GitHub stars / npm DL の推移グラフ
- 採用企業ロゴ（許可取れたもの）
- HNでの反響
- Beta sign-up 数
- 早期ユーザーの引用

### Day 74-75（木金、平日夜計4時間）: ピッチ資料更新 Day 2-3 ⏱️ 4時間

#### Task 11.4: 競合差別化の整理 ⏱️ 2時間

`04_competitive_matrix.md` を元に、投資家にわかりやすい1スライドに圧縮。

#### Task 11.5: 財務予測の更新 ⏱️ 2時間

OSS のトラクションを Audit 売上に変換するモデル：
- DL → サインアップ転換率 (仮定: 1%)
- Free → Pro 転換率 (仮定: 5%)
- Pro ARPU ¥9,800
- 12ヶ月後、24ヶ月後、36ヶ月後の予測

### Day 76（土）: Beta オンボーディング + 改善 ⏱️ 8時間

#### Task 11.6: Beta ユーザー 1on1 × 5 ⏱️ 5時間

#### Task 11.7: 即時改善 ⏱️ 3時間

オンボーディングで判明した小さなUX問題を修正。

### Day 77（日）: Beta オンボーディング Day 2 + ピッチ完成 ⏱️ 8時間

#### Task 11.8: Beta ユーザー 1on1 × 5 ⏱️ 5時間

#### Task 11.9: ピッチ資料最終化 ⏱️ 3時間

15スライドのデック完成：
1. Title
2. Problem (AIエージェント運用の現状とEU AI Act)
3. Solution (MAGI OSS + Audit)
4. Why now (規制 + 市場成長)
5. Market size
6. Product demo screenshots
7. Traction (OSS DL, Beta users)
8. Business model (Open Core)
9. Competition matrix
10. Go-to-market
11. Financials
12. Team (りゅういち + NERV体制)
13. Ask (¥30M pre-seed)
14. Use of funds
15. Vision (10年後)

**Week 11 完了条件**:
- [ ] 第2回ブログ記事公開
- [ ] Beta ユーザー10名のオンボーディング完了
- [ ] ピッチ資料 v2 完成

---

## 14. Week 12（Day 78-84）— Public Launch 準備 + Product Hunt

### Day 78（月、平日夜2時間）: Product Hunt 準備 Day 1 ⏱️ 2時間

#### Task 12.1: ハンター獲得 ⏱️ 2時間

Product Hunt は誰がpostするか（Hunter）が重要：
- 自分でpost (Maker = Hunter)
- または既存のフォロワー多いハンターに依頼

推奨: 既知の日本人 (例: gugurun氏など) や AI界隈で著名なハンターにDM。

### Day 79（火、平日夜2時間）: Product Hunt 準備 Day 2 ⏱️ 2時間

#### Task 12.2: アセット作成 ⏱️ 2時間

- Tagline: "Self-hostable SRE & compliance for AI agents (EU AI Act)"
- 240×240 logo
- Gallery images (3-5枚): スクリーンショット
- 30秒デモ動画 (Loom等で作成)

### Day 80（水、平日夜2時間）: Public Launch 当日準備 ⏱️ 2時間

#### Task 12.3: Launch チェックリスト ⏱️ 2時間

```
□ npm packages 全部 latest tag に
□ ドキュメント最新
□ ランディングページ公開状態
□ Discord 入りやすい状態
□ 想定質問への回答準備
□ 緊急バグ修正の体制 (24時間以内対応)
```

#### Task 12.4: 招待リスト作成 ⏱️ 1時間

ローンチ当日にupvote依頼するリスト：
- 既存テスター
- 友人・知人
- 過去のクライアント
- Twitter フォロワー

### Day 81（木）: Product Hunt Launch Day ⏱️ 終日対応

#### Task 12.5: 公開 ⏱️ 12-15時間

```
05:00 (JST) ── Product Hunt 公開 (UTC 20:00)
       ※ Product Huntは毎日太平洋時間00:00に新一日が始まる
05:30 ── 個別招待DM 30通送信
06:00-12:00 ── 朝の呼びかけ、Discord、X
12:00-23:00 ── コメント返信、感謝メッセージ送信
23:00-翌05:00 ── 海外ユーザー対応 (英語DM、Discord)
```

#### Task 12.6: Twitter スレッド ⏱️ 1時間

ローンチ告知のスレッド (10-15ツイート):
- なぜ作ったか
- 4パッケージの説明
- NERVでの実証
- EU AI Act対応
- 今後のロードマップ

**完了条件**:
- [ ] Product Hunt 上位5位以内に入る (目標)
- [ ] X スレッドが50RT以上 (目標)

### Day 82（金、平日夜2時間）: Launch 振り返り + バグ対応 ⏱️ 2時間

#### Task 12.7: トラフィック分析 ⏱️ 1時間
- npm DL 急増確認
- GitHub stars 急増確認
- ドキュメントサイト訪問者
- Discord 加入者
- Beta sign-up

#### Task 12.8: 緊急バグ修正 ⏱️ 1時間

### Day 83（土）: 90日間振り返り + 次の90日計画 Day 1 ⏱️ 8時間

#### Task 12.9: 全KPI最終評価 ⏱️ 3時間

| 指標 | 目標 | 実績 | 評価 |
|---|---|---|---|
| GitHub Stars (合計) | 300+ | ? | ? |
| npm 週間DL (合計) | 1,000+ | ? | ? |
| 外部Contributor | 3名+ | ? | ? |
| Discord メンバー | 100+ | ? | ? |
| Beta sign-up | 20+ | ? | ? |
| Public ブログ記事 | 4本+ | ? | ? |

#### Task 12.10: 学びの言語化 ⏱️ 2時間

- 何が予想通り
- 何が予想以上
- 何が予想外（ネガティブ）
- 学びをドキュメント化（次の90日に活かす）

#### Task 12.11: Day 91-180 計画ドラフト ⏱️ 3時間

優先順位（仮）：
- MAGI Audit Beta → GA への移行
- v0.3 開発（コミュニティ要望ベース）
- Pre-seed 資金調達アプローチ
- 国際カンファレンス登壇 (AI Engineer Summit など)

### Day 84（日）: Day 91-180 計画 Day 2 + コミュニケーション ⏱️ 8時間

#### Task 12.12: 次フェーズ計画完成 ⏱️ 4時間

Day 91-180 計画書をMarkdownで作成。Day 1-90 と同じ粒度で。

#### Task 12.13: Beta ユーザーへの感謝メール ⏱️ 2時間

各Beta ユーザーに個別メール：
- これまでの協力への感謝
- 90日の成果
- 次の3ヶ月のロードマップ
- 継続協力のお願い

#### Task 12.14: 早期テスター 10名への感謝メール ⏱️ 2時間

同様に。

**Week 12 完了条件**:
- [ ] Product Hunt Launch 実施
- [ ] 90日 KPI 最終レポート完成
- [ ] Day 91-180 計画書ドラフト完成
- [ ] Beta + 早期テスターへの感謝メール送信

---

## 15. Day 85-90 — 90日締めくくり + 次フェーズ準備

### Day 85（月、平日夜2時間）: 振り返りブログ ⏱️ 2時間

#### Task 13.1: Zenn 90日振り返り記事 ⏱️ 2時間

タイトル: 「Solo Devが90日で4つのOSS + 商用Beta を出した話」

構成:
- 開始時の状態
- 90日で起きたこと（数字で）
- うまくいったこと
- 失敗したこと
- 次の90日

### Day 86（火、平日夜2時間）: 英語版振り返りブログ ⏱️ 2時間

#### Task 13.2: dev.to / Medium 英語記事 ⏱️ 2時間

日本語記事の英訳 + 国際的な文脈（EU AI Act施行直前のタイミング）を強調。

### Day 87（水、平日夜2時間）: ピッチアプローチリスト作成 ⏱️ 2時間

#### Task 13.3: VC リサーチ ⏱️ 2時間

Pre-seed ¥30M を狙う。日本＋アジアのアーリーステージVCをリストアップ：

```
日本のAI/SaaS特化 Pre-seed VC:
- Coral Capital
- ANRI
- East Ventures
- Genesia Ventures
- Nippon Venture Capital
- Salesforce Ventures Japan
- DEEPCORE (DeNAグループ)
- ジェネシア・ベンチャーズ
- DNX Ventures
- One Capital

アジア:
- Sequoia Capital India/SEA
- Antler
- Wavemaker Partners
```

各VCのthesis、ポートフォリオ、コンタクト先を整理。

### Day 88（木、平日夜2時間）: 1社目アプローチ ⏱️ 2時間

#### Task 13.4: コールドメール送信 ⏱️ 2時間

Top 5 VCに個別メッセージ：
- LinkedIn DM or 紹介経由
- ピッチデック添付
- 30分MTG 依頼

### Day 89（金、平日夜2時間）: コミュニティ感謝企画 ⏱️ 2時間

#### Task 13.5: Discord で 90日感謝AMA ⏱️ 2時間

「90日の振り返り + Q&A」を Discord ボイスチャンネルで実施。
- 録音 → YouTube/X にアップロード

### Day 90（土）: 次フェーズスタート ⏱️ 8時間

#### Task 13.6: Day 91-180 詳細計画 完成 ⏱️ 4時間

ドラフトを精緻化、各タスクを GitHub Projects に登録。

#### Task 13.7: 次の機能スプリント開始 ⏱️ 4時間

v0.3 の最初のタスクに着手。コミュニティ要望Top3から：
- 例: OpenTelemetry adapter
- 例: Web UI (静的HTML) for incidents
- 例: Discord/Teams responder

**Day 90 完了条件 (90日締めくくり)**:
- [ ] 振り返りブログ 日英 公開
- [ ] VC アプローチ 5社以上開始
- [ ] Day 91-180 計画書 GitHub Projects に登録
- [ ] Discord AMA 実施
- [ ] 次フェーズ着手済

---

## 16. 日数別工数サマリー

```
Week 0  (準備)                : 約2-4時間 (即着手)
Week 1  (Day 1-7)             : 約32時間 (土日16h + 平日16h)
Week 2  (Day 8-14)            : 約26時間
Week 3  (Day 15-21)           : 約26時間
Week 4  (Day 22-28)           : 約26時間
Week 5  (Day 29-35)           : 約20時間 (ドキュメント中心、軽め)
Week 6  (Day 36-42)           : 約26時間 (オンボーディング含む)
Week 7  (Day 43-49)           : 約24時間 (HN準備)
Week 8  (Day 50-56)           : 約30時間 (HN対応 + v0.2)
Week 9  (Day 57-63)           : 約26時間 (MAGI Audit着手)
Week 10 (Day 64-70)           : 約26時間 (MAGI Audit MVP)
Week 11 (Day 71-77)           : 約24時間 (ピッチ + Beta対応)
Week 12 (Day 78-84)           : 約30時間 (Public Launch)
Day 85-90 (締めくくり)         : 約20時間
─────────────────────────────────
合計                          : 約340時間 (90日)
平均                          : 約3.8時間/日
```

このペースは「平日夜2時間 + 土日各6-8時間」前提で達成可能。

---

## 17. 90日後（Day 91以降）の展望

### Day 91-180（次の90日）の暫定方針

1. **MAGI Audit Beta → GA**
   - Pro プラン公開
   - 最初の有料顧客 5社以上
   - MRR ¥50,000+ 達成

2. **OSS v1.0 リリース**
   - 各パッケージ プロダクション認定
   - SemVer commitment

3. **Pre-seed 資金調達**
   - ¥30M pre-seed クローズ
   - BizDev共同創業者の獲得

4. **国際展開**
   - AI Engineer Summit (米国/欧州) 登壇
   - 英語コミュニティの拡大

5. **MAGIファミリー他製品の開発開始**
   - MAGI for Devs を最優先
   - MAGI Shield をその次

詳細は Day 90 で作成する Day 91-180 計画書を参照。

---

## 18. 改訂履歴

| バージョン | 日付 | 主な変更 |
|---|---|---|
| 1.0 | 2026-05-01 | 初版作成（Day 1-28詳細、Day 29-90概要） |
| 1.1 | 2026-05-01 | Day 29-90 を Day 1-28 と同粒度で詳細化 |

---

## 19. ファイル構成最終形

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

## 20. 進捗トラッキング

各タスクの完了状況をGitHub Projectsで管理：

```
github.com/unicornworks/magi/projects/1
- カラム: Backlog, Week N, In Progress, Review, Done
- 各タスクをIssueとして登録、PRとリンク
- 毎週日曜にレビュー（30分）
```

---

## 21. リスク対応

| リスク | トリガー | 対応 |
|---|---|---|
| `@magi` スコープ取得失敗 | Day 0 | 即座に `@magi-platform` 等の代替に切替 |
| Day 1の実装が間に合わない | Day 1終了時 | スコープ縮小: 検知器1つ + Responder1つ + Memory storageのみ |
| NERVへの組込みでバグ多発 | Day 6 | v0.1.0リリースを1週間延期、修正に専念 |
| HackerNewsで批判的コメント | Day 30 | 1日でissueに反映、改善PRを公開、誠実に対応 |
| Microsoft AGTが類似機能リリース | 任意 | 日本市場・中小企業特化で差別化、競合分析記事を出す |
| バーンアウト | 任意 | Discord開設後、外部コントリビューターに業務委譲 |

---

## 22. 即座に着手すべき3タスク（このドキュメントを読み終えたらすぐ）

1. **`npm org create magi`** を実行 (5分)
2. **GitHub `unicornworks` 組織作成 + `magi` repo作成** (15分)
3. **NPM_TOKEN 発行** (10分)

この3つが完了したら、Day 1の実装に入れる。

---

## 23. 補助資料（参照すべき外部リソース）

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

## 24. 結論

**90日で4パッケージのv0.1リリース + MAGI Audit Beta準備完了**を目指す。

- Week 1: `@magi/incident` (主役)
- Week 2-4: 残り3パッケージ
- Week 5-8: ドキュメント + コミュニティ
- Week 9-12: v0.2 + MAGI Audit Beta準備

毎週末16時間 + 平日夜10時間 = **週26時間 × 12週 = 312時間**で完遂可能。

**最初の意思決定**: このドキュメントを読み終えたら、まず `npm org create magi` を実行する。それから次の戦略質問に進む。
