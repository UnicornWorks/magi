import type { AnnexIvSectionId } from "../types.js";

export const TODO_MARKER = "<!-- TODO: Manual input required -->";

export const ANNEX_IV_SECTION_DEFINITIONS: Array<{
  id: AnnexIvSectionId;
  title: string;
  articleRefs: string[];
}> = [
  {
    id: "1-general-description",
    title: "1. General Description of the AI System",
    articleRefs: ["Article 11", "Annex IV(1)"],
  },
  {
    id: "2-elements-and-development",
    title: "2. Elements of the AI System and Development Process",
    articleRefs: ["Annex IV(2)", "Article 10", "Article 13", "Article 14"],
  },
  {
    id: "3-monitoring-functioning-control",
    title: "3. Monitoring, Functioning, and Control",
    articleRefs: ["Annex IV(3)", "Article 14", "Article 15"],
  },
  {
    id: "4-performance-metrics",
    title: "4. Appropriateness of Performance Metrics",
    articleRefs: ["Annex IV(4)", "Article 15"],
  },
  {
    id: "5-risk-management",
    title: "5. Risk Management System",
    articleRefs: ["Annex IV(5)", "Article 9"],
  },
  {
    id: "6-lifecycle-changes",
    title: "6. Relevant Lifecycle Changes",
    articleRefs: ["Annex IV(6)", "Article 11"],
  },
  {
    id: "7-standards",
    title: "7. Harmonised Standards and Technical Specifications",
    articleRefs: ["Annex IV(7)", "Article 40", "Article 41"],
  },
  {
    id: "8-eu-declaration",
    title: "8. EU Declaration of Conformity",
    articleRefs: ["Annex IV(8)", "Article 47"],
  },
  {
    id: "9-post-market-monitoring",
    title: "9. Post-Market Monitoring System",
    articleRefs: ["Annex IV(9)", "Article 72"],
  },
];
