import { buildFriaDocument, renderFriaMarkdown } from "@magi/fria-forge";

const document = buildFriaDocument({
  input: {
    systemName: "Eligibility Copilot",
    provider: "Example AI Ltd.",
    deployer: "Example City",
    intendedPurpose:
      "Support case workers assessing social benefit eligibility.",
    sector: "public benefits",
    useCase:
      "Ranking applications for access to essential public services and benefits.",
    affectedGroups: [{ name: "Residents applying for housing support" }],
    deploymentContext: "Municipal benefits office",
    dataCategories: ["identity", "income", "household composition"],
    oversightMeasures: [
      "Case worker reviews every recommendation before action.",
    ],
    mitigations: [{ name: "Appeals process", status: "planned" }],
  },
});

console.log(renderFriaMarkdown(document));
