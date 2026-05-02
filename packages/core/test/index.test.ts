import { describe, expect, it } from "vitest";
import { MAGI_VERSION } from "../src/index.js";

describe("@magi/core", () => {
  it("exports the package version", () => {
    expect(MAGI_VERSION).toBe("0.1.0");
  });
});
