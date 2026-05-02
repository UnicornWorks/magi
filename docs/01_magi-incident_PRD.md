# `@magi/incident` — Product Requirements Document (PRD)

> **Version**: 0.1.0-draft
> **Owner**: りゅういち (UnicornWorks)
> **Status**: Pre-implementation
> **Last updated**: 2026-05-01

---

## 1. ビジョン

**「AIエージェント特化型の、自己ホスト可能なインシデント管理ライブラリ」**

LangfuseやBraintrustが「Devのデバッグ」を解決し、Grafana OnCallやKeepが「伝統的システムのアラート管理」を解決している現状で、両者の交差点—**AIエージェント特有の故障モード（無限ループ、コスト暴走、幻覚、ドリフト）に対する自動検知・自動修復・ポストモーテム**—を担うOSSは存在しない。

NERVのCASPER（16パターン自動修復システム）の知見をTypeScriptライブラリとして抽出し、世界最初の「AIエージェント向けincident-as-code」フレームワークを目指す。

---

## 2. なぜ今これを作るか

### 2.1 市場ギャップ（裏取り済み）

| 既存OSS | 何を解くか | このプロジェクトで何が違うか |
|---|---|---|
| Langfuse | LLM呼び出しのトレース | デバッグ用、リアクションがない |
| Helicone | LLMゲートウェイ | プロキシ層、エージェント抽象がない |
| Grafana OnCall | アラート→人間の通知 | AIエージェント故障モードを知らない |
| Keep | アラート集約 | 同上 |
| AgentGuard | ランタイムガードレール | 検知のみ、修復ワークフローがない |
| AWS DevOps Agent | クラウド統合インシデント対応 | AWS lock-in、自己ホスト不可 |

**ポジショニング**: "Self-hostable incident framework for autonomous AI agents."

### 2.2 規制圧力

EU AI Act Article 73（Serious Incident Reporting）が2026年8月発効。プロバイダーは深刻なインシデントを当局に報告する義務がある。「インシデントが何か」を体系的に記録・分類・保管する基盤が業界に存在しない。

### 2.3 NERVでの実証済み

15体のAnima、CASPER、MELCHIORで日々運用中。これは**他のOSS開発者が絶対に持てない優位性**。

---

## 3. ターゲットユーザー

### Primary Persona: 「Solo / Small Team でAIエージェントを本番運用している開発者」

- AnthropicのAPIを月$500-$5,000使っている
- LangChain / Vercel AI SDK / Mastra のいずれかを使っている
- LangfuseかHeliconeを既に入れているが、「夜中にエージェントが暴走しても誰も気づかない」状態
- Datadogは高すぎる、PagerDutyはAIに合っていない、と感じている

### Secondary Persona: 「規制対応を始めた中堅企業のAI Eng」

- EU AI Act対応のため、Article 73インシデント報告の体制を作る必要がある
- 法務に「serious incidentが起きたら何が起きるんですか」と聞かれて答えられない
- 監査証跡の体系化が課題

---

## 4. コアコンセプト

### 4.1 4つのプリミティブ

```
Detector  → 異常を検知する関数
Incident  → 検知された事象（型付き、永続化される）
Responder → インシデントに対する自動アクション
Postmortem → 学習可能な構造化記録
```

### 4.2 設計原則

1. **Incident-as-Code**: TypeScriptの型システムでインシデントを定義
2. **Pluggable Detectors**: 組み込み + カスタム
3. **Idempotent Responders**: 同じインシデントを2回処理しても安全
4. **Storage Agnostic**: Supabase、Postgres、SQLite、ファイルすべて対応
5. **Framework Agnostic**: LangChain、Vercel AI SDK、Mastra、生のAPIすべて
6. **Article 73 Ready**: 出力フォーマットがEU規制と互換

---

## 5. API設計

### 5.1 セットアップ

```typescript
import { MagiIncident } from '@magi/incident'
import { SupabaseStorage } from '@magi/incident/storage'
import { SlackResponder, KillSwitchResponder } from '@magi/incident/responders'

const incident = new MagiIncident({
  systemId: 'fcm-driver-screening',  // EU AI Act systemId
  storage: new SupabaseStorage({ url, key }),

  detectors: [
    {
      name: 'infinite-loop',
      type: 'pattern',
      threshold: { sameToolCalls: 10, withinMs: 60_000 },
    },
    {
      name: 'cost-spike',
      type: 'statistical',
      window: '5m',
      multiplier: 3,  // 平常時の3倍超で発火
      baseline: 'rolling-24h',
    },
    {
      name: 'hallucination',
      type: 'eval',
      goldenDataset: './evals/golden.json',
      threshold: 0.85,
      sampleRate: 0.05,
    },
    {
      name: 'output-drift',
      type: 'distributional',
      reference: './baseline/embeddings.parquet',
      method: 'wasserstein',
    },
  ],

  responders: [
    new SlackResponder({ webhook: process.env.SLACK_WEBHOOK }),
    new KillSwitchResponder({ severityThreshold: 'critical' }),
  ],
})
```

### 5.2 エージェントのラップ

```typescript
// LangChain
const tracedAgent = incident.wrap(agent)

// Vercel AI SDK
const { text } = await incident.track(generateText, {
  systemId: 'fcm-driver-screening',
  metadata: { userId, sessionId },
})

// 生のAPI呼び出し
incident.record({
  model: 'claude-opus-4-7',
  inputTokens: 3000,
  outputTokens: 800,
  toolCalls: ['db.query', 'slack.send'],
  cost: 0.045,
  latencyMs: 2300,
})
```

### 5.3 自動修復ワークフロー（CASPER相当）

```typescript
incident.on('infinite-loop', async (ctx) => {
  // CASPER 16パターンの一部をTS化
  await ctx.kill()                          // 即座にエージェント停止
  await ctx.rollback({ steps: 1 })          // 直前の設定にrevert
  await ctx.notify('high')                  // Slack通知
  await ctx.createPostmortem({              // 構造化記録
    template: 'agentic-loop',
    rootCause: 'auto-detect',
  })
})

incident.on('cost-spike', async (ctx) => {
  if (ctx.severity === 'critical') {
    await ctx.killAll()  // 全エージェント停止
    await ctx.escalate('on-call')
  } else {
    await ctx.throttle({ rate: 0.5, durationMs: 600_000 })
  }
})
```

### 5.4 ポストモーテム生成

```typescript
// インシデント発生後、自動でポストモーテム下書きが作られる
const postmortem = await incident.getPostmortem(incidentId)

// LLMで根本原因分析（オプション）
await postmortem.analyze({
  llm: 'claude-opus-4-7',
  context: ['logs', 'metrics', 'config-history'],
})

// 公開可能なMarkdownとして出力
await postmortem.export({
  format: 'markdown',
  template: 'blameless',  // SRE標準
  redact: ['userId', 'pii'],
})

// EU AI Act Article 73提出フォーマット
await postmortem.export({
  format: 'eu-serious-incident',
  output: './reports/article-73-{date}.json',
})
```

### 5.5 検知器の自作

```typescript
import { defineDetector } from '@magi/incident'

export const customLoopDetector = defineDetector({
  name: 'fcm-loop',
  detect: async (ctx) => {
    const recent = await ctx.queryRecent({ minutes: 5 })
    const sameInput = recent.filter((r) =>
      r.input === recent[0]?.input
    )
    if (sameInput.length >= 5) {
      return {
        severity: 'high',
        category: 'reliability',
        evidence: sameInput,
      }
    }
    return null
  },
})
```

---

## 6. データモデル

### 6.1 PostgreSQL スキーマ

```sql
CREATE TABLE magi_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT NOT NULL,           -- EU AI Act mapping
  detector TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL,            -- reliability, cost, safety, drift, ...
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigating', 'resolved', 'reported')),

  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  reported_at TIMESTAMPTZ,           -- Article 73 reporting

  evidence JSONB NOT NULL,
  context JSONB,
  metrics JSONB,

  -- Article 73 fields
  is_serious BOOLEAN DEFAULT false,
  affects_fundamental_rights BOOLEAN DEFAULT false,
  authority_notified BOOLEAN DEFAULT false,

  -- Hash chain for tamper evidence (optional)
  prev_hash TEXT,
  this_hash TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_system ON magi_incidents(system_id, detected_at DESC);
CREATE INDEX idx_incidents_open ON magi_incidents(status) WHERE status != 'resolved';

CREATE TABLE magi_postmortems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES magi_incidents(id),
  root_cause TEXT,
  contributing_factors JSONB,
  timeline JSONB,
  remediation JSONB,
  lessons_learned TEXT,
  template TEXT NOT NULL DEFAULT 'blameless',
  authored_by TEXT,
  reviewed_by TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 6.2 Hash Chain（tamper-evidence、オプション）

`@systima/aiact-audit-log` 等との差別化として、**tamper evidenceは「opt-in」**にする。

> Article 12は実は暗号学的不変性を要求していない。デフォルトでは普通のappend-only、必要な人だけハッシュチェーンを有効化する設計が正しい。

---

## 7. ロードマップ

### v0.1.0 (Day 1, 土曜1日)

- [ ] コアタイプ定義（`Incident`, `Detector`, `Responder`）
- [ ] `MagiIncident` クラス基本実装
- [ ] `infinite-loop`, `cost-spike` の2検知器
- [ ] `SlackResponder`, `KillSwitchResponder`, `LogResponder`
- [ ] `MemoryStorage`（テスト用）, `JSONLStorage`（ファイル）
- [ ] Vercel AI SDK ラッパー
- [ ] 最小限のREADME + Examples（NERVを例に）
- [ ] npm publish: `@magi/incident@0.1.0`

### v0.2.0 (Week 1)

- [ ] `SupabaseStorage`, `PostgresStorage`
- [ ] LangChain / Mastra ラッパー
- [ ] `hallucination`, `output-drift` 検知器
- [ ] ポストモーテム自動生成（テンプレートベース）
- [ ] CLI: `magi-incident init`, `magi-incident report`
- [ ] Documentation site (Docusaurus or Nextra)

### v0.5.0 (Month 1)

- [ ] LLM-powered根本原因分析（オプション、別パッケージ `@magi/incident-rca`）
- [ ] Article 73 export format
- [ ] Hash chain（opt-in tamper evidence）
- [ ] Web UI（インシデント可視化、別パッケージ `@magi/incident-ui`）
- [ ] OpenTelemetry integration

### v1.0.0 (Month 3)

- [ ] Production hardening
- [ ] Multi-tenant対応
- [ ] Audit Council Reviewer Mode（規制官向けread-onlyビュー）
- [ ] MAGI Audit商用版との連携API

---

## 8. 競合との差別化マトリクス

| 観点 | Langfuse | Helicone | Grafana OnCall | AgentGuard | **@magi/incident** |
|---|---|---|---|---|---|
| AIエージェント特化 | ⚠️ | ⚠️ | ❌ | ✅ | ✅ |
| 自動修復ワークフロー | ❌ | ❌ | ⚠️ runbook | ❌ | ✅ |
| ポストモーテム生成 | ❌ | ❌ | ❌ | ❌ | ✅ |
| EU AI Act Article 73 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 自己ホスト可能 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 実戦投入実績 | ✅ | ✅ | ✅ | ⚠️ | ✅ NERV 15体 |

---

## 9. ライセンス戦略

- **`@magi/incident`**: **MIT**（永久に、完全機能）
- **エンタープライズ機能（SSO, RBAC, 規制官提出ワークフロー, 監査証跡管理 等）**:
  → このパッケージには**含めない**
  → MAGIプロダクトファミリーの一員である **MAGI Audit**（Proprietary、別レポ）が担当

詳細は `03_license_boundary.md` を参照。

**OSSとMAGI Auditの分業原則**:
- OSS = Runtime（コードに組み込まれる、開発者が使う、Self-host）
- MAGI Audit = Workflow + Compliance Platform（複数人で使う、規制官・監査人向け）

---

## 10. 成功指標（KPI）

### v0.1 (Day 1)

- npm publish成功
- READMEに動くExampleが3つ
- NERVの本番で動く

### v0.5 (Month 1)

- GitHub Stars: 100+
- npm週間DL: 500+
- ブログ記事 (Zenn / dev.to / Hacker News): 1本
- 外部利用者からのIssue: 5件以上

### v1.0 (Month 3)

- GitHub Stars: 500+
- npm週間DL: 2,000+
- 商用契約問い合わせ: 5件以上

---

## 11. リスクと対応

| リスク | 影響 | 対応 |
|---|---|---|
| Langfuseが類似機能を実装 | 大 | 「自動修復ワークフロー」「Article 73対応」で差別化 |
| EU AI Actが延期される | 中 | コア機能はインシデント管理で、規制対応は付加機能とする |
| MAGI Audit商用版との境界が曖昧化 | 中 | OSSはランタイム、商用は監査ワークフロー、と明確に分離 |
| メンテナーが1人 | 大 | 早期にcontributor募集、Discord/Slack開設 |

---

## 12. 次の意思決定ポイント

1. **ネーミング最終確定**: `@magi/incident` vs `magi-incident` vs `nerv-incident`
2. **Storageの優先度**: Supabase first か Postgres first か
3. **MAGI Audit商用版へのライセンス境界線**
4. **初回ブログ記事のテーマ**: 「NERVのCASPERをOSS化した話」が最有力
