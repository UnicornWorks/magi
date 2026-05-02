# `@magi/*` モノレポ設計書

> **Version**: 0.1
> **Owner**: りゅういち (UnicornWorks)
> **Status**: Architecture Proposal
> **Last updated**: 2026-05-01

---

## 1. なぜモノレポか

### 1.1 相互依存の現実

4つのパッケージは独立して使えるが、**型定義と検知ロジックを共有**する必要がある。

```
fria-forge ─┐
            ├──> @magi/core (共通型: SystemId, RiskLevel, AnnexIIIPoint)
incident ───┤
            ├──> @magi/storage (Supabase / Postgres adapter)
annex-iv ───┤
            │
post-market ┴──> @magi/regulatory (EU AI Act constants, templates)
```

別レポにすると、共通変更のたびに4回のPRが必要になる。モノレポなら1PRで済む。

### 1.2 ブランディング

「MAGI Family」として一貫した世界観を作る。`@magi/incident` を使った人が `@magi/annex-iv` を自然に発見する。

### 1.3 OSSとしての発見性

GitHubで1つの強いリポジトリ（star数集約）の方が、4つの弱いリポジトリより発見されやすい。HashiCorp、Vercelもこの戦略。

---

## 2. リポジトリ構成

```
magi/
├── package.json                    # ルート、workspace定義
├── pnpm-workspace.yaml
├── turbo.json                      # Turborepo設定
├── tsconfig.base.json
├── biome.json                      # Linter/Formatter (ESLint+Prettier代替)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # 各パッケージのbuild + test
│   │   ├── release.yml             # Changesetsベースのリリース
│   │   └── canary.yml              # mainからのCanaryリリース
│   └── ISSUE_TEMPLATE/
├── .changeset/                     # Changesets (バージョン管理)
├── README.md                       # ファミリー全体の紹介
├── CONTRIBUTING.md
├── LICENSE                         # MIT (デフォルト)
│
├── packages/
│   ├── core/                       # @magi/core
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── types.ts            # SystemId, RiskLevel等の共通型
│   │   │   ├── eu-ai-act.ts        # Annex III, Article ID定数
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   ├── storage/                    # @magi/storage
│   │   ├── src/
│   │   │   ├── adapters/
│   │   │   │   ├── memory.ts
│   │   │   │   ├── jsonl.ts
│   │   │   │   ├── supabase.ts
│   │   │   │   └── postgres.ts
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   ├── incident/                   # @magi/incident (Project 1)
│   │   ├── src/
│   │   │   ├── detectors/
│   │   │   ├── responders/
│   │   │   ├── postmortem/
│   │   │   ├── adapters/           # langchain, vercel-ai, mastra
│   │   │   └── index.ts
│   │   ├── examples/
│   │   │   ├── nerv/               # NERVドッグフーディング例
│   │   │   ├── basic/
│   │   │   └── eu-ai-act/
│   │   └── README.md
│   │
│   ├── fria-forge/                 # @magi/fria-forge (Project 2)
│   │   ├── src/
│   │   │   ├── templates/
│   │   │   │   ├── dihr-ecnl.ts   # Danish Institute標準
│   │   │   │   ├── aliger.ts       # ALIGNER標準
│   │   │   │   └── commission.ts   # EU公式テンプレート
│   │   │   ├── analyzer/
│   │   │   │   ├── system-scan.ts  # コードベース解析
│   │   │   │   └── rights-detect.ts # 関連基本権の自動抽出
│   │   │   ├── exporter/
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   ├── annex-iv/                   # @magi/annex-iv (Project 3)
│   │   ├── src/
│   │   │   ├── scanner/            # git history, AGENTS.md, code
│   │   │   ├── sections/           # Annex IV 全9セクション
│   │   │   ├── exporters/          # md, pdf, docx, json
│   │   │   └── index.ts
│   │   ├── cli/
│   │   │   └── annex-iv.ts         # `npx annex-iv build`
│   │   └── README.md
│   │
│   ├── post-market/                # @magi/post-market (Project 4)
│   │   ├── src/
│   │   │   ├── monitors/
│   │   │   ├── reporters/          # 月次レポート生成
│   │   │   ├── article-73/         # 深刻インシデント自動報告
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   └── regulatory/                 # @magi/regulatory (内部用)
│       ├── src/
│       │   ├── eu-ai-act/
│       │   │   ├── annex-iii.ts    # 高リスクAI分類リスト
│       │   │   ├── articles.ts     # 全条文ID
│       │   │   └── deadlines.ts
│       │   ├── iso-42001/
│       │   └── owasp-llm-top-10/
│       └── README.md
│
├── apps/
│   ├── docs/                       # docusaurus.io スタイルドキュメント
│   │   └── nextra/
│   └── playground/                 # ブラウザで試せるデモ
│       └── next-app/
│
└── examples/                       # 統合例（NERVを起点に）
    ├── nerv-full-stack/            # 4パッケージ全部使う例
    ├── fcm-compliance/             # FCMをEU AI Act対応する例
    └── starter-template/
```

---

## 3. ツールチェーン

### 3.1 パッケージマネージャー: **pnpm**

理由：
- ワークスペース機能が最も成熟
- Disk効率（symlinkベース）
- npm互換だがビルド速度が3倍速い

### 3.2 ビルドオーケストレーター: **Turborepo**

理由：
- インクリメンタルビルド（変更されたパッケージのみビルド）
- リモートキャッシュ（CIで威力発揮）
- Vercelエコシステムなので無料

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
      "inputs": ["src/**", "test/**"]
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 3.3 リリース: **Changesets**

理由：
- 各パッケージを独立にバージョニング
- PR時に `.changeset/*.md` を書くだけ
- 自動でCHANGELOGが生成される
- GitHub Actionsとの統合が簡単

ワークフロー:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 3.4 Linter/Formatter: **Biome**

ESLint + Prettierを置き換え。理由：
- Rust製で20倍速い
- 設定が簡単（biome.json 1ファイル）
- 2026年現在、急速に普及中

### 3.5 Test: **Vitest**

Jest互換、Vite基盤、ESM ネイティブ。

### 3.6 Type-check: **TypeScript 5.6+** (strict mode)

---

## 4. パッケージ間の依存関係

```
@magi/core           (依存なし、純粋型定義)
   ↑
   ├── @magi/storage     (core)
   ├── @magi/regulatory  (core)
   │
   ├── @magi/incident    (core, storage)
   ├── @magi/annex-iv    (core, regulatory)
   ├── @magi/fria-forge  (core, regulatory)
   └── @magi/post-market (core, storage, regulatory, incident)
```

**重要原則**: パッケージ間は **peer dependencies** で繋ぐ。バージョンの整合性は Changesets が担保する。

---

## 5. npm 公開戦略

### 5.1 スコープ確保

最初にやること：
```bash
npm org create magi  # @magiスコープを取得
```

代替案（@magiが取られていた場合）:
- `@magihq/*`
- `@unicornworks/magi-*`
- `@nerv-magi/*`

### 5.2 公開順序

```
Day 0: @magi/core, @magi/storage を v0.0.1 で予約publish
Day 1: @magi/incident v0.1.0 を本格publish (主役)
Day 7: @magi/annex-iv v0.1.0
Day 14: @magi/fria-forge v0.1.0
Day 30: @magi/post-market v0.1.0
```

### 5.3 タグ戦略

- `latest` — 安定版
- `next` — 次のメジャー版のRC
- `canary` — main直後のスナップショット

---

## 6. ドキュメンテーション戦略

### 6.1 統一サイト: `magi.dev`（or `magi-oss.dev`）

Nextra / Docusaurus / Mintlifyのいずれか。**Mintlify推奨**：
- デザインが洗練されている
- OSS無料プランあり
- Vercel系のエコシステムと親和

構成：
```
magi.dev/
├── /             # ランディング、4パッケージの紹介
├── /docs         # 共通ガイド
│   ├── /quick-start
│   ├── /eu-ai-act-overview
│   └── /architecture
├── /incident     # @magi/incident docs
├── /fria-forge   # @magi/fria-forge docs
├── /annex-iv     # @magi/annex-iv docs
├── /post-market  # @magi/post-market docs
└── /blog         # 開発ブログ
```

### 6.2 README階層

- ルート README: 「MAGIファミリーとは」+ 4パッケージの1行紹介
- 各パッケージ README: 単独で `npm i` できるレベルの情報
- examples/ の各READMEで個別ユースケース

---

## 7. CI/CD

### 7.1 PR時

```yaml
- pnpm install
- pnpm turbo build --filter='[origin/main]'   # 変更パッケージのみ
- pnpm turbo test --filter='[origin/main]'
- pnpm turbo lint
- pnpm turbo type-check
```

### 7.2 main マージ時

```yaml
- 上記すべて + Changesetsによるリリース
- Mintlifyのドキュメント自動デプロイ
```

### 7.3 Canary（オプション）

毎日 main から `0.0.0-canary-{date}-{sha}` でリリース。早期テスター用。

---

## 8. コミュニティ運営

### 8.1 GitHub設定

- **Issue Templates**: bug, feature, regulatory-question (EU AI Act関連)
- **Discussions** 有効化（Q&A、ideas）
- **Labels**:
  - `package: incident`, `package: fria-forge` 等
  - `area: detector`, `area: storage`, `area: regulatory`
  - `good first issue`, `help wanted`
  - `regulatory: eu-ai-act`, `regulatory: iso-42001`

### 8.2 コミュニケーションチャネル

- **Discord** か **Slack**（招待制）: 早期は Discord 推奨（公開、無料）
- **GitHub Discussions**: 質問の検索性のため
- **Twitter/X (@magi_oss)**: アップデート発信

### 8.3 Contributor License Agreement (CLA)

OSSパッケージはすべてMITなので、**DCO (Developer Certificate of Origin)** で十分。CLAは要求しない（コントリビューションの摩擦を最小化）。

---

## 9. ライセンス境界

### 9.1 純MIT + MAGI Audit モデル

```
packages/                                  ← すべて MIT、永久に
├── core/                  MIT
├── storage/               MIT
├── regulatory/            MIT
├── incident/              MIT
├── fria-forge/            MIT
├── annex-iv/              MIT
└── post-market/           MIT
```

**重要**: このモノレポには商用コード (BSL/Proprietary) を含めない。
商用機能はすべて **別レポの MAGI Audit (MAGIプロダクトファミリーの1製品)** が担う。

### 9.2 なぜBSLパッケージを廃止したか

詳細は `03_license_boundary.md` を参照。要約：

- BSLパッケージを作ると、OSSとMAGI Auditの両方で機能重複が発生
- MAGIプロダクトファミリー（7製品）の中でAuditだけ「OSS+Enterprise+Cloud」の3層になり非対称
- ユーザーが「自分のユースケースはどのライセンスか」を判断するコストが高い
- コミュニティに「誘い水」と見抜かれるリスク

**新方針**: OSS は 100% MIT で完全機能。商用化は MAGI Audit (別レポ、Proprietary) が担当。

### 9.3 商用機能はどこに

```
github.com/unicornworks/magi              ← このモノレポ (MIT)
github.com/unicornworks/magi-audit        ← MAGI Audit (Proprietary、別レポ)
```

MAGI Audit は MAGI OSS のデータを集約・可視化・規制官提出する Workflow Platform として、別リポジトリで開発。OSSとは独立したリリースサイクル。

---

## 10. ローンチ計画

### 10.1 Soft Launch (Day 1-7)

- npm publish（タグ: `next`）
- 個人ブログでのアナウンス（Zenn）
- 日本語TwitterでNERVファンに告知

### 10.2 Public Launch (Day 30)

- `latest` タグへ昇格
- Hacker News submit (タイミング: 火-木の朝)
- dev.to / Reddit r/MachineLearning へクロスポスト
- ProductHunt (オプション)

### 10.3 Conference / Talk

- AI Engineer Summit Tokyo (もしあれば)
- 個人ポッドキャスト出演
- LinkedIn英語投稿

---

## 11. 初期コミット例

```
.
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── biome.json
├── README.md
├── LICENSE
├── .changeset/
│   └── config.json
├── .github/
│   └── workflows/ci.yml
└── packages/
    ├── core/
    │   ├── package.json     # name: @magi/core
    │   ├── src/index.ts     # export type SystemId = ...
    │   └── tsconfig.json
    ├── storage/
    │   ├── package.json     # name: @magi/storage
    │   ├── src/index.ts
    │   └── tsconfig.json
    └── incident/
        ├── package.json     # name: @magi/incident
        ├── src/index.ts
        └── tsconfig.json
```

`package.json` (root):

```json
{
  "name": "magi",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "test": "turbo test",
    "lint": "biome check .",
    "format": "biome format --write .",
    "release": "changeset publish"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@changesets/cli": "^2.28.0",
    "turbo": "^2.5.0",
    "typescript": "^5.6.0",
    "vitest": "^2.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

---

## 12. 意思決定ログ

| 決定事項 | 選択肢 | 採用 | 理由 |
|---|---|---|---|
| パッケージマネージャー | npm / yarn / pnpm | pnpm | speed + workspaces |
| ビルダー | Nx / Turborepo / Lerna | Turborepo | Vercel整合 + cache |
| Linter | ESLint+Prettier / Biome | Biome | speed + simplicity |
| Test | Jest / Vitest | Vitest | ESM, speed |
| バージョニング | semantic-release / Changesets | Changesets | monorepo対応 |
| Docs | Docusaurus / Nextra / Mintlify | Mintlify | デザイン + OSS無料 |
| Comms | Discord / Slack | Discord | OSS慣習 |
| ライセンス | MIT / Apache / BSL / Open Core | **MIT (永久) + MAGI Audit (Proprietary、別レポ)** | シンプル、MAGIファミリーと整合 |

---

## 13. 残課題

- [ ] `@magi` スコープが取得可能か npm で確認
- [ ] ドメイン `magi.dev` または `magi-oss.dev` の取得
- [ ] ロゴデザイン（Eva風 or 三賢人風 or ミニマル）
- [ ] 初期コミット用テンプレートの作成
- [ ] Mintlify or Docusaurusの選定確定
