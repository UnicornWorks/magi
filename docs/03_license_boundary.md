# MAGI OSS × MAGI Audit のライセンス境界線設計（改訂版）

> **Version**: 0.2 (2026-05-01 改訂)
> **Owner**: りゅういち (UnicornWorks)
> **Status**: Strategy Document
> **重要な変更**: BSLによる二重OSS戦略を廃止。商用機能はすべて「MAGI Audit」（MAGIプロダクトファミリーの1製品）に集約する**純MITモデル**へ転換。

---

## 1. なぜ純MIT戦略へ転換したか

### 1.1 旧設計の問題点

v0.1で提案した「MIT (core) + BSL (enterprise) + Proprietary (cloud)」の3層モデルには以下の問題があった：

1. **境界が複雑**: ユーザーが「自分のユースケースはどのライセンスか」を判断するコストが高い
2. **OSSと商用版で機能の重複が発生**: 同じ機能をOSS版・enterprise版・cloud版で3回実装する
3. **MAGIプロダクトファミリー全体の整合性が崩れる**: MAGI for Devs / Workforce / Audit / Council / Persona / Shield / Marketplace の7製品体系のうち、Auditだけ「OSS + Enterprise + Cloud」の3層になり、他製品と非対称
4. **コミュニティへの誘い水と見抜かれるリスク**: 「OSSを使い始めると、すぐ機能制限にぶつかる」という印象を与える

### 1.2 新設計の優位性

**「OSSは100% MIT、商用化はMAGI Auditが担う」** という分離により：

1. ✅ **ユーザー体験が単純**: OSSを使うか、MAGI Auditを契約するか、の二択
2. ✅ **MAGIプロダクトファミリーと完全整合**: 7製品の中の1つ（Audit）として商用機能が位置づけられる
3. ✅ **コミュニティの信頼が最大化**: 「OSSは永久に完全機能、商用はワークフロー価値」という明確なメッセージ
4. ✅ **ブランディングの一貫性**: MAGIファミリー全体が「MAGI = 統合プラットフォーム」と認識される
5. ✅ **OSSは純粋にRuntime、Auditは純粋にWorkflow/Compliance Platform** という明確な役割分担

---

## 2. 新しい2層構造

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         MAGI Product Family (商用)              │
│  ┌──────────┬──────────┬──────────┬─────────┐ │
│  │ MAGI for │ MAGI for │ MAGI     │ MAGI    │ │
│  │ Devs     │ Workforce│ Audit ★  │ Council │ │
│  ├──────────┼──────────┼──────────┼─────────┤ │
│  │ MAGI for │ MAGI     │ MAGI     │         │ │
│  │ Persona  │ Shield   │Marketplace│         │ │
│  └──────────┴──────────┴──────────┴─────────┘ │
│                       ↑                         │
│             OSSデータを集約・可視化              │
└───────────────────────┼─────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────┐
│                       │                         │
│       MAGI OSS Family (MIT, 完全機能)            │
│  ┌──────────────┬─────────────┐                │
│  │ @magi/       │ @magi/      │                │
│  │ incident     │ annex-iv    │                │
│  ├──────────────┼─────────────┤                │
│  │ @magi/       │ @magi/      │                │
│  │ fria-forge   │ post-market │                │
│  └──────────────┴─────────────┘                │
│       ↑ NERV (15体のAnima) で実戦投入            │
└─────────────────────────────────────────────────┘
```

**シンプルな分離**:
- OSS = **Runtime**（コードに組み込まれる、開発者が使う、Self-host）
- MAGI Audit = **Workflow + Compliance Platform**（組織で使う、規制官・経営者・監査人が使う、Hosted）

---

## 3. OSS と MAGI Audit の役割分担

### 3.1 OSSが担う領域（Runtime）

OSSパッケージは**完全な機能セット**を持つ。商用版で機能制限することはしない。

#### `@magi/incident`
- ✅ 全検知器（loop, cost-spike, hallucination, drift, custom）
- ✅ 全Responder（kill, rollback, throttle, slack, email, webhook）
- ✅ ポストモーテム自動生成
- ✅ Article 73 export (JSON)
- ✅ Hash chain (opt-in tamper evidence)
- ✅ Postgres / Supabase / SQLite / JSONL すべて対応
- ✅ LangChain / Vercel AI SDK / Mastra アダプター

#### `@magi/annex-iv`
- ✅ コードベーススキャン
- ✅ Annex IV 全9セクション自動生成
- ✅ Markdown / PDF / docx 出力
- ✅ AGENTS.md 統合
- ✅ git history からのリネージ抽出

#### `@magi/fria-forge`
- ✅ FRIAテンプレート全種（DIHR/ECNL, ALIGNER, Commission）
- ✅ システム自動スキャン
- ✅ 基本権の自動マッピング
- ✅ Markdown / PDF 出力

#### `@magi/post-market`
- ✅ 月次/週次自動レポート
- ✅ 差別バイアス監視
- ✅ Article 73 自動トリガー
- ✅ Drift detection

**OSSだけで本番運用とEU AI Act準拠が可能**。これが信頼の源泉。

### 3.2 MAGI Auditが担う領域（Workflow + Platform）

MAGI Auditは「OSSを置き換える」のではなく「OSSの上に乗る」。

#### マルチシステム・マルチテナント統合
- 複数システム（FCM、Rehabnic、Fishland等）の統合ダッシュボード
- 組織ヒエラルキー、複数プロジェクト管理
- システム横断の比較分析

#### ヒューマン・ワークフロー
- インシデント・トリアージ（複数人レビュー、承認チェーン）
- FRIA協調作成（法務 + プロダクト + データチーム）
- Annex IV レビュー＆承認フロー
- ポストモーテム共同編集
- 監査タスクの割り当て・進捗管理

#### 規制官対応
- 規制官への直接提出ワークフロー（電子署名、監査証跡パッケージング）
- 認証局連携（CE marking workflow）
- 通知ワークフロー（Article 73のserious incident、当局報告）
- 監査官専用ビュー（read-only, 検索可能）

#### エンタープライズ機能
- SSO (SAML, OIDC, OAuth)
- RBAC (5+ roles)
- SOC 2 Type II 認証
- 10年自動保管 + 削除証明
- SLA 99.9%
- 24/7 サポート
- 専用Slackチャネル / Customer Success

#### MAGIファミリー統合
- MAGI for Devs（開発時のガードレール）からMAGI Auditへの自動データ流入
- MAGI for Workforce（従業員向けAI監査）との連携
- MAGI Shield（セキュリティ）との統合
- MAGI Marketplace（認定ベンダー登録）

### 3.3 境界線の3つの判断軸

何が OSS で、何が MAGI Audit かを判断する3つの質問：

#### 質問1: 「組織内の複数人が触るか？」

- YES → MAGI Audit (RBAC, multi-user reviews, approval chains)
- NO → OSS

#### 質問2: 「規制官・第三者監査人が見るか？」

- YES → MAGI Audit (regulatory submission workflows, attestation, certified output)
- NO → OSS

#### 質問3: 「データの法的責任が UnicornWorks に移るか？」

- YES → MAGI Audit (10年保管保証, SLA, SOC 2, 専用契約)
- NO → OSS

**もし3つとも NO なら、それはOSS機能。3つのうち1つでも YES なら、MAGI Audit機能。**

---

## 4. 機能マトリクス（決定版）

### 4.1 `@magi/incident` × MAGI Audit

| 機能 | OSS | MAGI Audit |
|---|:---:|:---:|
| **Detection** | | |
| 組み込み検知器（loop, cost, drift, hallucination） | ✅ | ✅ |
| カスタム検知器API | ✅ | ✅ |
| LLM-powered根本原因分析 | ✅ | ✅ |
| **Response** | | |
| Slack/Email/Webhook | ✅ | ✅ |
| 自動修復（kill, rollback, throttle） | ✅ | ✅ |
| 承認チェーン付き修復 | ❌ | ✅ |
| **Postmortem** | | |
| テンプレート生成 | ✅ | ✅ |
| LLM生成 | ✅ | ✅ |
| マルチユーザーレビュー | ❌ | ✅ |
| 公開ステータスページ | ❌ | ✅ |
| **Storage** | | |
| Memory / JSONL / Postgres / Supabase | ✅ | ✅ (managed) |
| Tamper-evident hash chain | ✅ opt-in | ✅ default + signed |
| Cryptographic signing (Ed25519) | ✅ opt-in | ✅ managed keys |
| Append-only S3 (Object Lock) | ⚠️ self-config | ✅ managed |
| **Compliance** | | |
| Article 73 export (JSON) | ✅ | ✅ |
| Article 73 提出ワークフロー（当局送信） | ❌ | ✅ |
| 監査官ビュー (read-only audit role) | ❌ | ✅ |
| 10年自動保管保証 + 削除証明 | ❌ | ✅ |
| **Operations** | | |
| シングルテナント | ✅ | ✅ |
| マルチテナント / 組織管理 | ❌ | ✅ |
| RBAC | ❌ | ✅ |
| SSO (SAML, OIDC) | ❌ | ✅ |
| SLA / 専用サポート | ❌ | ✅ |

### 4.2 `@magi/fria-forge` × MAGI Audit

| 機能 | OSS | MAGI Audit |
|---|:---:|:---:|
| FRIAテンプレート全種 | ✅ | ✅ |
| システム自動スキャン | ✅ | ✅ |
| 基本権の自動マッピング | ✅ | ✅ |
| Markdown / PDF 出力 | ✅ | ✅ |
| マルチステークホルダー協調機能 | ❌ | ✅ |
| 法務レビュー承認ワークフロー | ❌ | ✅ |
| 複数バージョン管理 + diff（UI） | ⚠️ git任せ | ✅ |
| 提出履歴管理 | ❌ | ✅ |
| 法務専門家ネットワーク | ❌ | ✅ |
| 監督機関への直接提出 | ❌ | ✅ |

### 4.3 `@magi/annex-iv` × MAGI Audit

| 機能 | OSS | MAGI Audit |
|---|:---:|:---:|
| コードベーススキャン | ✅ | ✅ |
| 9セクション自動生成 | ✅ | ✅ |
| Markdown / PDF / docx 出力 | ✅ | ✅ |
| 複数システムの統合管理 | ❌ | ✅ |
| 規制官向け提出パッケージング | ❌ | ✅ |
| 認証局連携 (CE marking workflow) | ❌ | ✅ |
| バージョン管理＆承認フロー | ❌ | ✅ |

### 4.4 `@magi/post-market` × MAGI Audit

| 機能 | OSS | MAGI Audit |
|---|:---:|:---:|
| 月次/週次自動レポート | ✅ | ✅ |
| 差別バイアス監視 | ✅ | ✅ |
| Article 73 自動トリガー | ✅ | ✅ |
| 規制官への直接送信 | ❌ | ✅ |
| 業界平均との比較（ベンチマーク） | ❌ | ✅ |
| マルチシステムダッシュボード | ❌ | ✅ |

---

## 5. ライセンスの選定

### 5.1 OSS Family: **MIT**（4パッケージすべて）

```
@magi/core         MIT
@magi/storage      MIT
@magi/regulatory   MIT
@magi/incident     MIT
@magi/fria-forge   MIT
@magi/annex-iv     MIT
@magi/post-market  MIT
```

**永久にMIT**。BSLや商用ライセンスへの転換は将来的にもしない。

理由：
- コミュニティの信頼を最大化
- 企業採用の障壁を最低化
- Langfuse（MIT）と同じ業界標準
- MAGIプロダクトファミリーが商用化を担うので、OSSをBSL化する必要がない

### 5.2 MAGI Audit: **Proprietary（商用契約）**

MAGIプロダクトファミリーの1製品として商用契約。SaaS or Self-hosted Enterprise の両方を提供。

### 5.3 MAGIファミリー全体のライセンス整合

| 製品 | ライセンス | 提供形態 |
|---|---|---|
| MAGI for Devs | Proprietary | Free + Pro + Team (¥2,980 / ¥4,980) |
| MAGI for Workforce | Proprietary | Tiered SaaS |
| **MAGI Audit** | **Proprietary** | **Tiered SaaS + Self-hosted Enterprise** |
| MAGI Council | Proprietary | Tiered SaaS |
| MAGI for Persona | Proprietary | Tiered SaaS |
| MAGI Shield | Proprietary | Tiered SaaS |
| MAGI Marketplace | Proprietary | 手数料モデル |
| **MAGI OSS Family (4 packages)** | **MIT** | **完全無料** |

---

## 6. 命名規則

```
@magi/<package>              ← MIT, OSS (誰でも自由)
MAGI Audit                   ← Proprietary, MAGIファミリーの1製品
magi-audit.com (or similar)  ← 公式サイト
```

### 重要なネーミング上の区別

❌ **避けるべき**:
- `@magi/incident-enterprise` — 「OSSの上位版」と誤解される
- `@magi/audit-cloud` — MAGI Audit製品との混同
- `MAGI Incident Cloud` — OSSの単機能を商用化したと誤解

✅ **使うべき**:
- `@magi/incident` (OSS)
- `MAGI Audit` (商用製品、複数のOSSデータを統合)

---

## 7. 価格構造（MAGI Audit）

MAGIプロダクトファミリーのpricing戦略と整合させる。

### 7.1 ティア設計

| ティア | 月額 | 対象 | 含まれるもの |
|---|---|---|---|
| **Free** | ¥0 | 個人・PoC | 1システム、1ユーザー、30日保管、コミュニティサポート |
| **Pro** | ¥9,800 | 中小企業 | 5システム、5ユーザー、1年保管、Email サポート |
| **Team** | ¥39,800 | 成長企業 | 20システム、20ユーザー、5年保管、Slack サポート、SSO |
| **Enterprise** | お問い合わせ | 大企業・規制対応必須 | 無制限、SAML SSO、10年保管、専用CSM、SLA 99.9%、Self-host可能 |

### 7.2 OSSとMAGI Auditの関係

- **OSS無料 + MAGI Audit Free** = 個人開発者は完全無料で始められる
- **OSS + Self-host (Postgres等)** = 永久無料（Article 12対応含む、規制官提出は手動）
- **MAGI Audit有料** = 「複数人で運用したい」「規制官提出を自動化したい」「10年保管を保証したい」

### 7.3 MAGIファミリー全体での価格体系の位置づけ

```
個人 ────► MAGI for Devs Free + @magi/* OSS
   │
中小 ────► MAGI for Devs Pro (¥2,980) + MAGI Audit Pro (¥9,800)
   │
成長 ────► MAGI for Devs Team (¥4,980) + MAGI Audit Team (¥39,800)
   │
大企業 ──► MAGIファミリー Enterprise契約 (バンドル割引)
```

---

## 8. 危険な境界線（注意点）

### ❌ してはいけないこと

1. **OSSにバックドアやテレメトリを仕込む** → コミュニティ崩壊
2. **OSS版の機能を後からMAGI Audit専用にする** → bait-and-switch、信頼喪失
3. **OSS版で「MAGI Auditで利用可能」のメッセージを多用する** → 嫌われる
4. **MITからの将来的なライセンス変更** → Elasticの教訓、フォーク発生
5. **OSSとMAGI Auditで同じ機能を重複実装する** → メンテナンス地獄

### ✅ するべきこと

1. **最初から線引きを公開する** → このドキュメントを GitHub Wiki に
2. **OSSだけで本番運用と規制対応ができる完成度を保証** → これが信頼の源
3. **MAGI Auditは「OSSデータを集約・人間ワークフロー化する」と位置づける** → 上下関係ではなく補完関係
4. **コミュニティ要望は OSS 側に取り込む** → 商用化を急がない
5. **MAGIファミリーとの整合性を常に意識** → Audit単体ではなく全体最適

---

## 9. 移行パス: OSS → MAGI Audit

### 9.1 データ互換性

OSSのデータ構造 = MAGI Auditのデータ構造。マイグレーション1コマンド：

```bash
# OSSからMAGI Auditへインポート
npx @magi/incident migrate --to magi-audit \
  --from postgres://localhost/magi_local \
  --account ryuichi@unicornworks.jp

# MAGI Auditからエクスポート（ロックインなし）
magi-audit export --format magi-oss --output ./backup/
```

### 9.2 段階的アップグレード

```
1. OSS のみ（無料、Self-host）
   ↓ チームが大きくなる
2. OSS + MAGI Audit Free（個人ダッシュボード接続）
   ↓ 規制対応が必要に
3. MAGI Audit Pro / Team
   ↓ エンタープライズ要件
4. MAGIファミリー Enterprise契約（複数製品バンドル）
```

### 9.3 ダウングレードも保証

「MAGI Auditをやめても、OSSで継続できる」を契約書に明記。Vendor lock-inの不安を消す。

```
MAGI Audit データエクスポート権利:
- いつでもユーザー自身のPostgres / S3 にエクスポート可能
- データはOSS互換フォーマット（JSON, JSONL）
- エクスポート後もOSSで継続運用可能
```

---

## 10. ドキュメント上の表現

### 10.1 OSS README に書くこと

```markdown
## License

`@magi/incident` is **MIT licensed**. You can use it freely for any purpose,
including commercial production use, including for EU AI Act compliance.

We commit to keeping this MIT license forever. Core OSS will never be
relicensed to BSL or any other license.

## Need team workflows or regulatory submission?

For organizations needing multi-user workflows, regulator submission flows,
SSO, RBAC, and 10-year retention guarantees, see [MAGI Audit](https://magi-audit.example.com),
part of the [MAGI Product Family](https://magi.example.com).

MAGI Audit complements (not replaces) the OSS — your data stays compatible
either way.
```

### 10.2 FAQ で予防的に書くこと

> **Q: Will you ever change the license of `@magi/incident`?**
> A: No. The MIT license is a permanent commitment. We've seen what happens
> when projects break this trust (Elastic, MongoDB, etc.).
>
> **Q: Can I run `@magi/incident` in production for my company?**
> A: Yes, completely free, including for commercial use, including
> for full EU AI Act compliance (Articles 12, 27, 72, 73).
>
> **Q: What's the difference between OSS and MAGI Audit?**
> A: OSS = libraries you embed in your code (Runtime).
> MAGI Audit = SaaS platform for teams and regulators (Workflow).
> They use the same data format. You can switch between them anytime.
>
> **Q: Is MAGI Audit just OSS with a UI?**
> A: No. MAGI Audit is a Workflow + Compliance platform with multi-tenant
> support, RBAC, SSO, regulator submission flows, 10-year retention,
> SOC 2 certification, and integration with the wider MAGI Product Family.

### 10.3 MAGI Audit ランディングページに書くこと

> **MAGI Audit** is the team workflow and compliance platform for organizations
> running AI agents under the EU AI Act.
>
> Built on top of the [MAGI OSS Family](https://magi.example.com) (MIT-licensed),
> MAGI Audit adds:
> - 👥 Multi-user workflows (RBAC, SSO, approval chains)
> - 📋 Regulator submission flows (Article 73, Annex IV, FRIA)
> - 🔒 10-year tamper-evident retention with SOC 2 Type II
> - 🌐 Multi-system, multi-tenant management
> - 🤝 Integration with the wider MAGI Product Family
>
> Your data is always portable. Use OSS for development, switch to MAGI Audit
> when you need team workflows, switch back anytime.

---

## 11. 商用化のタイミング

### Phase 0 (Month 0-3): OSS のみ
- 4パッケージすべて MIT で公開
- コミュニティ獲得に集中
- MAGI Audit はまだ開発しない（情報のみ「Coming soon」）

### Phase 1 (Month 3-6): MAGI Audit Closed Beta
- 招待制Beta、最初は無料
- 早期ユーザー10社程度
- フィードバックループを回す

### Phase 2 (Month 6-12): MAGI Audit Open Beta
- 公開Beta、Free/Pro プラン開始
- まだEnterpriseは個別契約

### Phase 3 (Month 12+): MAGI Audit GA + MAGIファミリー連携
- 全プラン GA
- MAGI for Devs / Workforce との連携機能
- バンドル割引

---

## 12. 法務確認事項

実装前に弁護士に確認すべき項目：

- [ ] EU 顧客に対する SaaS 契約での GDPR / EU AI Act の責任分界
- [ ] OSS版でArticle 73の自動報告機能を提供することの法的責任
- [ ] 「FRIA テンプレート」を提供することが法律相談業務に該当しないか
- [ ] MAGIプロダクトファミリー全体での契約構造（マスター契約 + Audit個別契約）
- [ ] MAGI Audit Self-hosted Enterprise版の利用許諾条件

---

## 13. 旧設計からの主な変更点

| 項目 | 旧設計 (v0.1) | 新設計 (v0.2) |
|---|---|---|
| 商用OSSパッケージ (`*-enterprise`) | あり (BSL 1.1) | **なし** |
| 商用機能の提供場所 | OSS-enterprise + Cloud | **MAGI Audit のみ** |
| OSSパッケージ数 | 4 + 4 enterprise = 8 | **4 (純MIT)** |
| ライセンスの種類 | MIT + BSL + Proprietary | **MIT + Proprietary のみ** |
| MAGIファミリーとの整合 | 不完全 | **完全に統合** |
| 商用版のブランド名 | "MAGI Audit Cloud" (独立) | **"MAGI Audit" (ファミリーの1製品)** |
| 開発工数 | OSS 4 + Enterprise 4 | **OSS 4 + MAGI Audit 1** |

**結果**: より少ない実装、より明確なメッセージ、より強いブランディング。

---

## 14. 結論

**シンプルな2層構造**:
```
┌─────────────────────────────────────┐
│  MAGI Product Family (Proprietary)  │
│   ├ MAGI Audit ★ (この4 OSSの商用化担当) │
│   └ 他6製品 (for Devs, Workforce, etc) │
├─────────────────────────────────────┤
│  @magi/* (MIT, 完全機能)             │
│   └ 4 packages, 永久にMIT            │
└─────────────────────────────────────┘
```

**シンプルなメッセージ**:
> "Use the OSS for your code. Use MAGI Audit when your team
> grows or regulators come knocking. Switch between them
> anytime — your data is always portable."

**MAGIファミリーの中での MAGI Audit の位置**:
> "MAGI Audit は、MAGI OSSデータを集約し、組織で運用し、規制官に提出するための、
> MAGIファミリーのCompliance Platformです。"
