export { classifyAnnexIII } from "./classifier/annex-iii.js";
export { exportFriaPdf } from "./exporters/pdf.js";
export { renderFriaMarkdown, writeFriaMarkdown } from "./exporters/markdown.js";
export { loadFriaInput } from "./io/load-input.js";
export { buildFriaDocument } from "./templates/build-document.js";
export { FUNDAMENTAL_RIGHTS } from "./rights/data.js";
export { mapFundamentalRights } from "./rights/map.js";
export type {
  AffectedGroup,
  AnnexIIICategoryId,
  AnnexIIICategoryMatch,
  AnnexIIIClassification,
  FriaBuildOptions,
  FriaDocument,
  FriaInput,
  FriaPdfExportOptions,
  FriaPdfExportResult,
  FriaSection,
  FriaTemplate,
  FundamentalRight,
  MitigationMeasure,
} from "./types.js";
