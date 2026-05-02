# MAGI OSS Family — Executive Summary

> **戦略文書セット (4部作)**
> **Owner**: りゅういち (UnicornWorks)
> **Date**: 2026-05-01
> **Status**: Strategy Locked, Implementation Ready

---

## 全体像

EU AI Act 2026年8月発効を控え、AIエージェント運用の「SRE × Compliance」交差点に、
**4つの統合OSSパッケージ + MAGIプロダクトファミリーの1製品（MAGI Audit）** を投入する戦略。

```
┌──────────────────────────────────────────────────┐
│       MAGI Product Family (Proprietary)          │
│  ┌──────────┬──────────┬──────────┬─────────┐ │
│  │ MAGI for │ MAGI for │ MAGI     │ MAGI    │ │
│  │ Devs     │ Workforce│ Audit ★  │ Council │ │
│  ├──────────┼──────────┼──────────┼─────────┤ │
│  │ MAGI for │ MAGI     │ MAGI     │         │ │
│  │ Persona  │ Shield   │Marketplace│         │ │
│  └──────────┴──────────┴──────────┴─────────┘ │
│           ↑ MAGI Audit が OSS データを集約         │
├──────────────────────────────────────────────────┤
│  @magi/*  (MIT, 4 packages, 永久にMIT)            │
│  ├ @magi/incident   (Project 1, 主役、Day 1)      │
│  ├ @magi/annex-iv   (Project 2, Week 2)          │
│  ├ @magi/fria-forge (Project 3, Week 3)          │
│  └ @magi/post-market(Project 4, Week 4)          │
└──────────────────────────────────────────────────┘
            ↑ NERV (15体のAnima) で毎日ドッグフーディング
```

**重要な戦略原則**:
- OSS = **完全機能、永久にMIT**（Runtime層）
- 商用化は**MAGI Audit**（MAGIプロダクトファミリーの1製品、Workflow + Compliance Platform）が担う
- BSL等の中間ライセンスは使わない → ライセンスはMITとProprietaryの2種類のみ

---

## 4文書の全体マップ

このセットは以下の4文書で構成される：

| # | 文書 | 内容 | 利用シーン |
|---|---|---|---|
| 1 | **`01_magi-incident_PRD.md`** | 主役パッケージのProduct Requirements | 実装時に随時参照 |
| 2 | **`02_monorepo_design.md`** | 4パッケージ統合のリポジトリ設計 | 環境構築時 |
| 3 | **`03_license_boundary.md`** | OSS / 商用版のライセンス境界線 | 契約・OSS公開時 |
| 4 | **`04_competitive_matrix.md`** | 競合との差別化マトリクス | PR・営業・README執筆時 |

---

## 戦略の3つの核

### 核1: 「AIエージェント特化のSRE × Compliance」という空白地帯

調査の結果、以下の競合は存在するが、4軸全てを満たすOSSは**ゼロ**：

- AIエージェント特化（≠ 一般システム監視）
- SRE × Compliance 統合（≠ 単機能OSS）
- EU AI Act 全条文対応（≠ Article 12のみ）
- 実戦投入済み（≠ デモ実装）

→ MAGI OSSは交点に位置する**世界初の統合パッケージ**。

### 核2: NERVが最強のドッグフーディング環境

15体のAnimaが毎日稼働 = **他のOSS開発者には絶対に持てない優位性**。

「実戦投入済み」というナラティブは：
- 商用契約獲得時の強力な根拠
- コミュニティから信頼される鍵
- 次世代AIエージェント開発者へのアピール

### 核3: MAGIプロダクトファミリーとの統合による持続可能なビジネス

```
OSS (MIT、永久) + MAGI Audit (Proprietary、MAGIファミリーの1製品)
```

- **シンプルな2層**: BSL等の中間ライセンスは使わず、MIT と Proprietary のみ
- **ブランド統合**: 商用機能は独立したCloud製品ではなく、**MAGI Auditとしてファミリーに組み込まれる**
- **コミュニティ信頼の最大化**: 「OSSは永久に完全機能、商用はワークフロー価値のみ」
- **MAGIファミリー全体での価値提供**: MAGI for Devs、MAGI Audit、MAGI Shield 等を統合的に販売可能

---

## 実装ロードマップ（90日計画）

### Week 1: Foundation
- [ ] `@magi` npm スコープ取得
- [ ] `magi.dev` ドメイン取得
- [ ] モノレポ初期化（pnpm + Turborepo + Biome + Vitest）
- [ ] CI/CD（GitHub Actions + Changesets）
- [ ] **`@magi/incident` v0.1.0 publish** — NERVのCASPER相当機能
- [ ] 日本語ブログ記事（Zenn）「NERVのCASPERをOSS化した話」

### Week 2: 第2パッケージ
- [ ] `@magi/core`, `@magi/storage`, `@magi/regulatory` を整備
- [ ] **`@magi/annex-iv` v0.1.0 publish** — AGENTS.md → Annex IV変換
- [ ] 英語ブログ記事「Generate EU AI Act Annex IV from AGENTS.md」
- [ ] 第1回 Hacker News submit

### Week 3: 第3パッケージ
- [ ] **`@magi/fria-forge` v0.1.0 publish** — FRIAテンプレート生成
- [ ] FCMの実例を使ったケーススタディ記事
- [ ] dev.to / Reddit にクロスポスト

### Week 4: 第4パッケージ
- [ ] **`@magi/post-market` v0.1.0 publish** — Article 72対応
- [ ] 4パッケージ統合のチュートリアル動画/記事
- [ ] Mintlifyドキュメントサイト公開

### Month 2: Community Building
- [ ] Discord開設
- [ ] 早期テスター10名募集
- [ ] 機能改善（フィードバックループ）
- [ ] 各パッケージ v0.2 リリース

### Month 3: MAGI Audit Beta開始
- [ ] **MAGI Audit クローズドβ開始**（5社程度、無料）
- [ ] MAGIプロダクトファミリー Pre-seedピッチ資料の更新（OSS実績を組み込む）
- [ ] MAGI Audit ↔ OSS のデータ連携機能リリース

---

## 主要KPI

### 30日後

| 指標 | 目標 |
|---|---|
| GitHub Stars (合計) | 50+ |
| npm週間DL (合計) | 200+ |
| 公開記事 | 4本以上 |
| HackerNews掲載 | 1回以上 |

### 90日後

| 指標 | 目標 |
|---|---|
| GitHub Stars (合計) | 300+ |
| npm週間DL (合計) | 1,000+ |
| 外部Contributor | 3名以上 |
| Discord メンバー | 100+ |
| MAGI Audit Beta sign-up | 20+ |

### 6ヶ月後

| 指標 | 目標 |
|---|---|
| GitHub Stars (合計) | 1,500+ |
| npm週間DL (合計) | 5,000+ |
| 商用契約問い合わせ | 10件+ |
| 採用企業ロゴ (公開可能) | 5社+ |

---

## 即座にすべき意思決定

### 今週中

1. **`@magi` npm スコープが取れるか確認**
   - 取れない場合: `@magihq`, `@unicornworks`, `@nerv-magi` のいずれか
2. **ドメイン候補の確認・取得**
   - `magi.dev`, `magi-oss.dev`, `magi-audit.com`
3. **MAGI Auditブランドとの整合**
   - すでにMAGI Audit商用版の開発計画があるなら、整合性を取る

### 来週まで

4. **法務確認**: MAGI Audit商用契約の構造、FRIAテンプレート提供の法的責任範囲、MAGIプロダクトファミリー全体のマスター契約構造
5. **`@magi/incident` v0.1.0 のスコープ最終確定**: 検知器2つ + Responder3つ + Storage2つ で行くか
6. **ローンチブログのドラフト**: 「NERVのCASPERをOSS化した話」

### 月内

7. **Discord か Slack か**: 早期コミュニティのチャネル
8. **ドキュメントツール選定**: Mintlify or Nextra or Docusaurus
9. **ロゴデザイン**: Eva風 / 三賢人風 / ミニマル

---

## リスクと対応サマリ

| リスク | 確率 | 影響 | 対応 |
|---|---|---|---|
| EU AI Act延期 (2027年に) | 中 | 中 | コア機能はSRE中心、規制対応は付加価値 |
| Microsoftが類似OSSをリリース | 中 | 大 | 日本市場・中小企業特化で生き残る |
| Langfuseがコンプライアンス追加 | 低 | 中 | 自動修復・FRIA・Annex IVで差別化 |
| systimaがスコープ拡大 | 低 | 中 | モノレポ統合と実戦実績 |
| 個人開発の限界 (バーンアウト) | **高** | **大** | **早期コミュニティ化、contributor募集** |

**最大のリスクは技術ではなく、Solo Devの持続可能性**。
→ 早期にDiscord開設、外部コントリビューター獲得を最優先。

---

## 投資効率の観点

### 投資（時間）

- 4パッケージ × v0.1 = 4週間 (各週末2日 × 4 = 約64時間)
- ドキュメント・ブログ = 1週間
- コミュニティ運営 = 月10時間継続

合計: **初期投資 約100時間**、月間運営 約40時間

### リターン（想定）

- **ブランド価値**: 「日本人で初めてEU AI Act対応OSSを作った開発者」
- **MAGI Audit商用化の信頼基盤**: OSSで証明 → 商用版が売りやすい
- **採用の引力**: 将来Co-founder候補が集まる
- **ピッチでの強み**: VC向けに「OSSで○○stars達成」と言える
- **直接収益**: MAGI Audit有料プラン開始（6ヶ月後〜）+ MAGIファミリーバンドル販売

ROIは「商用化前の信頼構築 → 商用化後の収益増幅」型。
即金にはならないが、**MAGI Audit商用化の成功確率を大幅に引き上げる**。

---

## 最終的な推奨

**Go**: 4プロジェクトすべて、提示した計画通り進める。

**理由**:
1. 空白地帯であることが調査で確認できた
2. NERVという他にない実戦環境がある
3. 規制圧力（EU AI Act）が確実に来る
4. Open Coreモデルで持続可能性が担保できる
5. MAGI Auditの商用化への完璧な助走になる

**最初の1歩**:
- `@magi/incident` v0.1.0 の実装に着手
- NERVのCASPERコードをTypeScript化するところから

---

## 文書セット使用ガイド

| 状況 | 参照すべき文書 |
|---|---|
| `@magi/incident` を実装する | `01_magi-incident_PRD.md` |
| モノレポ環境を構築する | `02_monorepo_design.md` |
| OSSと商用版の境界に迷う | `03_license_boundary.md` |
| READMEや営業資料を書く | `04_competitive_matrix.md` |
| 全体戦略を確認する | この文書 |

---

**最後に**: この4文書セットは「決定版」ではなく「v0.1」です。
実装と市場フィードバックを通じて、随時更新してください。
特に `04_competitive_matrix.md` は競合の動きに応じて月1回の更新を推奨します。
