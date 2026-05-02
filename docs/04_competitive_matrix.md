# 競合差別化マトリクス：MAGI OSS Family

> **Version**: 0.1
> **Owner**: りゅういち (UnicornWorks)
> **Status**: Strategic Analysis
> **Last updated**: 2026-05-01

---

## 1. 目的

「Audit領域でなぜMAGI OSSが勝てるのか」を、各競合との具体的差分で示す。営業資料・READMEの根拠としても使う。

---

## 2. 競合マッピング（全体図）

```
                     │
             Runtime │   Workflow / Compliance
                     │
   ┌─────────────────┼─────────────────────────┐
   │                 │                         │
   │  Langfuse       │   SureCloud (GRC)       │
   │  Helicone       │   ISMS.online           │
   │  Phoenix        │   Drata / Vanta         │
DEV │  Braintrust    │ ENT (商用GRC)            │
   │  Laminar        │                         │
   │                 │                         │
   ├─────────────────┼─────────────────────────┤
   │                 │                         │
   │  AgentGuard     │   ★ MAGI OSS Family ★   │
   │  AgentBudget    │                         │
SRE │  AgentOps      │   (空白地帯)             │
   │  agent-budget-  │                         │
   │  guard          │                         │
   │                 │                         │
   └─────────────────┴─────────────────────────┘
   AIエージェント特化
```

**MAGI OSSのユニークなポジション**:
「**AIエージェントSRE × Compliance Workflow**」の交差点

---

## 3. 直接競合（5社）

### 3.1 Langfuse

| 観点 | Langfuse | MAGI OSS |
|---|---|---|
| ライセンス | MIT (core) | **MIT (永久)** + MAGI Audit (Proprietary、別製品) |
| GitHub Stars (2026/04) | 21,000+ | 0 (start) |
| 主目的 | LLM呼び出しのトレース・デバッグ | AIエージェントのSRE + EU AI Act準拠 |
| ユーザー像 | LLM開発者 | エージェント運用者 + コンプライアンス担当 |
| 自動修復 | ❌ | ✅ |
| ポストモーテム生成 | ❌ | ✅ |
| EU AI Act Annex IV | ❌ | ✅ |
| FRIA生成 | ❌ | ✅ |
| Article 73 reporting | ❌ | ✅ |

**勝ち方**: Langfuseと正面衝突しない。「Langfuseでデバッグ、MAGIで運用とコンプライアンス」と棲み分け。READMEに「Use alongside Langfuse」と明記。

**Langfuseがコピーしてきたら？**: コア戦略として「規制対応の深さ」で差別化。Langfuseは独/オーストリア発で、規制対応に手を出す可能性はあるが、AIエージェント特有のSRE（自動修復、ポストモーテム）には興味を示していない。

### 3.2 @systima/aiact-audit-log

| 観点 | systima | MAGI OSS |
|---|---|---|
| ライセンス | MIT | MIT |
| 公開時期 | 2026年2月 | 2026年5月-(予定) |
| スコープ | Article 12 ログ専門 | Article 12, 27, 72, 73 全部 + SRE |
| 機能の幅 | 狭い・深い | 広い・統合的 |
| 提供形態 | 単一パッケージ | モノレポ4パッケージ |
| バックエンド | S3互換 | Postgres / Supabase first |
| ハッシュチェーン | デフォルト有効 | opt-in |
| 自動修復 | ❌ | ✅ |
| Vercel AI SDK | ✅ | ✅ |
| LangChain | ❓ | ✅ |
| 商用バックアップ | ✅ Systima社の本業 | ✅ MAGI Audit (MAGIファミリー) |

**勝ち方**:
1. **スコープの広さ**: systimaは「ログ層」だけ。MAGIは「SRE → 文書 → 規制官提出」の全工程をカバー
2. **AIエージェント特化**: systimaは汎用LLMアプリ向け。MAGIはマルチエージェント、自動修復、ポストモーテムを持つ
3. **「AIエージェントSRE × Compliance」の二刀流**: systimaにはSRE的価値がない

**注意**: systimaは「Article 12は実は暗号学的不変性を要求していない」という主張をしている。MAGIはこれに同意し、ハッシュチェーンをopt-inにすることで「regulatorys requirementを正しく理解している」とアピールする。

### 3.3 Helicone

| 観点 | Helicone | MAGI OSS |
|---|---|---|
| ライセンス | Apache 2.0 | MIT (core) |
| 統合方法 | プロキシ (URL change) | SDK (wrap関数) |
| GitHub Stars | 4,400+ | 0 |
| 主目的 | LLMゲートウェイ + 観測性 | エージェントSRE + コンプライアンス |
| Multi-LLM対応 | ✅ 100+モデル | ✅ プロバイダー非依存 |
| 自動修復 | ❌ | ✅ |
| EU AI Act対応 | ⚠️ 部分的 | ✅ 全面的 |

**勝ち方**: Heliconeはゲートウェイ層。MAGIはゲートウェイの上のアプリケーション層。組み合わせ可能。

### 3.4 Bifrost (Maxim AI)

| 観点 | Bifrost | MAGI OSS |
|---|---|---|
| ライセンス | OSS（要確認） | MIT |
| 主目的 | AI Gateway with governance | エージェントSRE + コンプライアンス |
| アクセス制御 | ✅ | ❌ (商用版で提供) |
| 監査ログ | ✅ | ✅ |
| 自動修復 | ❌ | ✅ |
| ポストモーテム生成 | ❌ | ✅ |
| FRIA生成 | ❌ | ✅ |

**勝ち方**: Bifrostはゲートウェイ。MAGIはアプリケーション層SREとコンプライアンス文書化。レイヤーが違う。

### 3.5 AgentGuard / AgentBudget / agent-budget-guard

| 観点 | これら3つ | MAGI OSS |
|---|---|---|
| 主目的 | コスト・予算管理 | 統合SRE + コンプライアンス |
| 機能の深さ | 浅い (1機能特化) | 深い (4パッケージ統合) |
| 自動修復 | 部分的 | ✅ 完全 |
| EU AI Act | ❌ | ✅ |
| メンテナンス | 個人プロジェクト多数 | 商用バックアップあり |

**勝ち方**: これらの機能は `@magi/incident` の `cost-spike` 検知器 + `KillSwitchResponder` で再現可能。「点」ではなく「面」で勝負。

---

## 4. 間接競合（隣接領域）

### 4.1 Microsoft Agent Governance Toolkit

| 観点 | Microsoft AGT | MAGI OSS |
|---|---|---|
| ライセンス | MIT | MIT |
| リリース | 2026年4月 | 2026年5月- |
| 主目的 | ランタイムセキュリティ | SRE + コンプライアンス |
| 構成 | 7パッケージのモノレポ | 4パッケージのモノレポ |
| バックアップ | Microsoft | UnicornWorks |
| EU AI Act対応 | 部分的 | 全面的 |
| AIエージェント特化 | ✅ | ✅ |

**勝ち方**:
1. **より日本市場に近い**: Microsoft製は英語圏優先、MAGIは日英バイリンガル
2. **コンプライアンスの深さ**: AGTはセキュリティ重視、MAGIはAuditワークフロー重視
3. **個人開発者も使える軽量さ**: Microsoftはエンタープライズ前提、MAGIはSolo Devから

**警戒事項**: Microsoftが直接競合してきたら、巨大企業に勝つのは難しい。**ニッチに特化することで生き残る**：「日本語対応」「中小企業向け」「Solo Dev向け」。

### 4.2 商用GRC（SureCloud, ISMS.online, Drata, Vanta）

| 観点 | 商用GRC | MAGI OSS |
|---|---|---|
| 価格 | $$$$$ ($50K-$500K/年) | 無料〜$$ |
| 対象 | 大企業 | 全規模 |
| AI特化 | 後付け | ネイティブ |
| OSS | ❌ | ✅ |
| Self-host | ❌ | ✅ |
| 規制官対応の深さ | ✅✅✅ | ✅✅ (発展中) |

**勝ち方**: 価格と Self-host の自由度。「SureCloudは買えないがコンプライアンスは必要」という中堅市場を狙う。

### 4.3 OneUptime / Grafana OnCall / Keep

| 観点 | これら | MAGI OSS |
|---|---|---|
| 主目的 | 一般システム監視 | AIエージェント特化 |
| AI故障モード理解 | ❌ | ✅ |
| EU AI Act対応 | ❌ | ✅ |
| インテグレーション | 広い (DataDog, Slack等) | AIスタック (LangChain, Vercel AI等) |

**勝ち方**: これらは伝統的システム向け。MAGIはAIエージェント特化で、検知器・ポストモーテムテンプレートがAI特有の故障モード（幻覚、ループ、ドリフト）を理解する。

---

## 5. 各MAGIパッケージごとの個別差別化

### 5.1 `@magi/incident` の競合

| 競合 | カテゴリ | 主な差分 |
|---|---|---|
| Langfuse | LLM Observability | デバッグ vs SRE自動修復 |
| AgentGuard | エージェントガードレール | 検知のみ vs 検知+修復+ポストモーテム |
| OneUptime | 一般インシデント管理 | AI非対応 vs AI特化 |
| Grafana OnCall | アラート管理 | 通知 vs 自動修復ワークフロー |

**勝ち筋**: 「AIエージェント特化 × 自動修復ワークフロー × ポストモーテム自動生成」のトリプル。各単機能には負けても、統合で勝つ。

### 5.2 `@magi/fria-forge` の競合

| 競合 | カテゴリ | 主な差分 |
|---|---|---|
| 商用GRC各社 | FRIAテンプレート | 高額 vs 無料OSS |
| ECNL/DIHRガイド | PDFガイド | ドキュメント vs プログラマブル |
| ALIGNERテンプレート | PDFテンプレート | 静的 vs 自動生成 |
| VerifyWise | テンプレート | Web フォーム vs CLI/SDK |
| kla.digital | Annex IV Generator | UIのみ vs CI/CD組込み可能 |

**勝ち筋**: **FRIAをプログラマブルにした最初のOSS**。コードベースから自動生成するアプローチは現状ゼロ。

### 5.3 `@magi/annex-iv` の競合

| 競合 | カテゴリ | 主な差分 |
|---|---|---|
| kla.digital | Annex IV Generator | 商用Web vs OSS CLI |
| 商用GRC | 文書管理 | 手動入力 vs gitスキャン |
| 手書き Word文書 | 現状の主流 | 工数大 vs 自動 |

**勝ち筋**: **AGENTS.md → Annex IV 自動変換**。OpenAI標準と接続することで、60,000+のAGENTS.mdユーザーへの自然な経路。

### 5.4 `@magi/post-market` の競合

| 競合 | カテゴリ | 主な差分 |
|---|---|---|
| FireTail | Article 12 SaaS | 商用 vs OSS |
| Datadog AIモニタリング | エンタープライズ監視 | 高額 vs 無料 |
| 自社で作る | スクラッチ実装 | 工数大 vs パッケージ済み |

**勝ち筋**: **Article 72ポストマーケット監視のOSSは現状ゼロ**。完全空白地帯。

---

## 6. 戦略的なナラティブ（OSS PRに使う）

### 6.1 1行ピッチ

> "The OSS family for running AI agents under EU AI Act."

### 6.2 30秒ピッチ

> "Langfuseはエージェントのデバッグを解決した。
> しかし、本番で動くエージェントが暴走したとき、
> 規制官に説明するための仕組みは誰も作っていなかった。
>
> MAGIは、NERVで15体のAIエージェントを毎日運用してきた知見から生まれた、
> AIエージェントのSREとEU AI Actコンプライアンスを統合する4パッケージのOSSファミリーです。"

### 6.3 ポジショニングステートメント

> **For** AIエージェントを本番運用しているSolo Dev〜中小企業
> **Who** Langfuseでデバッグしたが、運用と規制対応がない
> **MAGI is** AIエージェント特化のSRE × コンプライアンスOSSファミリー
> **That** 自動修復・ポストモーテム・EU AI Act準拠文書を一気通貫で提供する
> **Unlike** 単機能OSS（AgentGuard等）や高額商用GRC（SureCloud等）
> **We** NERVで毎日ドッグフーディングしている、唯一の実戦投入済みOSS

---

## 7. SEO / Discovery 戦略

### 7.1 ターゲットキーワード

**英語**:
- "AI agent incident management"
- "EU AI Act open source"
- "FRIA generator"
- "Annex IV technical documentation"
- "AI agent SRE"
- "LangChain incident response"

**日本語**:
- "EU AI Act 対応 OSS"
- "AIエージェント 監視"
- "AIエージェント インシデント管理"

### 7.2 ローンチ戦略

各パッケージごとにブログ記事を1本ずつ：

1. **`@magi/incident`**: 「NERVのCASPERをOSS化した話」(Zenn日本語 → Medium英訳)
2. **`@magi/annex-iv`**: 「AGENTS.mdからEU AI Act Annex IV技術文書を自動生成する」
3. **`@magi/fria-forge`**: 「Solo DevがFRIAを5分で書く方法」
4. **`@magi/post-market`**: 「2026年8月までにAIサービスがやるべき10のこと」

### 7.3 Hacker News 投稿戦略

- タイミング: 火-木の朝 (UTC 14:00頃 = 日本時間23時)
- タイトル: "Show HN: MAGI – Open source SRE and compliance for AI agents (EU AI Act ready)"
- 比較対象を明示（Langfuse、systimaとの違い）

---

## 8. 勝てる理由（最終要約）

1. **時機**: EU AI Act 2026年8月発効まで3ヶ月
2. **空白**: AIエージェント特化のSRE × コンプライアンス統合OSSは存在しない
3. **実証**: NERVで毎日ドッグフーディング → 唯一の本物
4. **戦略**: モノレポで統合、しかし疎結合（各パッケージ単独でも価値）
5. **戦術**: Open Coreで持続可能なビジネス（HashiCorpモデル）
6. **地理的優位**: 日本人開発者でこの領域に取り組む競合なし

---

## 9. 失敗シナリオと撤退条件

### 9.1 失敗シナリオ

| シナリオ | 確率 | 影響 | 対応 |
|---|---|---|---|
| EU AI Act が更に延期 (Digital Omnibusで2027年に) | 中 | 中 | コア機能はSREなので延期に強い |
| Microsoft AGTがコンプライアンス機能を追加 | 中 | 大 | 日本市場特化、軽量さで生き残る |
| Langfuseがエージェント自動修復を実装 | 低 | 中 | コンプライアンス層で差別化 |
| systimaがスコープ拡大 | 低 | 中 | モノレポ統合と実戦実績で勝負 |
| 個人での運営が限界 (バーンアウト) | 高 | 大 | 早期にcontributor募集、Discord開設 |

### 9.2 撤退条件

以下すべてが該当した場合、Pivot を検討：

- v0.5 公開後3ヶ月で GitHub Stars < 50
- npm週間DL < 100
- 外部からのコントリビューションPR = 0
- MAGI Audit Beta sign-up < 10

---

## 10. 競合ウォッチリスト

定期的にチェックすべき競合（月1回）：

- [ ] @systima/aiact-audit-log の更新
- [ ] Langfuse の roadmap (langfuse.com/changelog)
- [ ] Microsoft Agent Governance Toolkit (github.com/microsoft/agent-governance-toolkit)
- [ ] Helicone の compliance 機能追加
- [ ] EU Commission の AI Act 公式ガイダンス更新
- [ ] OWASP LLM Top 10 / Agentic Top 10 の改訂
- [ ] Linux Foundation Agentic AI Foundation の動向

---

## 11. 結論

**MAGI OSS Familyは、4つの軸で誰も埋めていない空白を埋める：**

1. AIエージェント特化（≠ 一般システム監視）
2. SRE × Compliance 統合（≠ 単機能OSS）
3. EU AI Act 全条文対応（≠ Article 12のみ）
4. NERV実戦投入済み（≠ デモ実装）

この4軸の交点には、現状**競合がいない**。
しかも EU AI Act 2026年8月発効により、需要が法的に強制される。

**勝てる確率は高い。実行のスピードが鍵。**
