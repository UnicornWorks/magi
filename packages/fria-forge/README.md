# @magi/fria-forge

Generate draft Fundamental Rights Impact Assessment (FRIA) Markdown for high-risk AI systems under the EU AI Act.

> The generated output is a draft tooling artifact. It is not legal advice and is not a compliance guarantee.

## Quick Start

```bash
pnpm --filter @magi/fria-forge build
magi-fria-forge build --input fria-input.json --output fria.draft.md
```

```json
{
  "systemName": "Eligibility Copilot",
  "provider": "Example AI Ltd.",
  "deployer": "Example City",
  "intendedPurpose": "Support case workers assessing social benefit eligibility.",
  "sector": "public benefits",
  "useCase": "Ranking applications for access to essential public services and benefits.",
  "affectedGroups": [{ "name": "Residents applying for housing support" }],
  "deploymentContext": "Municipal benefits office",
  "dataCategories": ["identity", "income", "household composition"],
  "oversightMeasures": ["Case worker reviews every recommendation before action"],
  "mitigations": [{ "name": "Appeals process", "status": "planned" }]
}
```

## CLI

```bash
magi-fria-forge init --system-name "Hiring Assistant" --sector employment --use-case "Screen job applications"
magi-fria-forge build --input fria-input.json --template dihr-ecnl --output fria.draft.md
magi-fria-forge build --input fria-input.json --pdf --pdf-output fria.pdf
```

`--pdf` requires `pandoc`. Markdown generation remains the primary local quality gate.

Templates:

- `dihr-ecnl`: 5-phase FRIA guide structure.
- `aligner`: threat scenario structure.
- `commission`: Article 27 minimum questionnaire aligned draft. This is not an official AI Office template.

## API

```ts
import {
  buildFriaDocument,
  renderFriaMarkdown,
  writeFriaMarkdown,
} from "@magi/fria-forge";

const document = buildFriaDocument({
  input: {
    systemName: "Eligibility Copilot",
    sector: "public benefits",
    useCase: "Ranking applications for essential public benefits",
  },
});

await writeFriaMarkdown(document, "fria.draft.md");
console.log(renderFriaMarkdown(document));
```

Local implementation scope excludes legal review, regulator submission, npm publish, hosted review workflows, RBAC, SSO, and MAGI Audit commercial workflow features.
