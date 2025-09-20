import { describe, expect, it } from "bun:test";

import { isAsianEthnicity } from "./ethnicity";

describe("isAsianEthnicity", () => {
  it("returns false for undefined, null, or empty input", () => {
    expect(isAsianEthnicity(undefined)).toBe(false);
    expect(isAsianEthnicity(null)).toBe(false);
    expect(isAsianEthnicity("")).toBe(false);
    expect(isAsianEthnicity("   ")).toBe(false);
  });

  it("identifies exact ethnicity matches regardless of casing", () => {
    expect(isAsianEthnicity("Asian")).toBe(true);
    expect(isAsianEthnicity("CHINESE")).toBe(true);
    expect(isAsianEthnicity("japanese")).toBe(true);
    expect(isAsianEthnicity(" Vietnamese ")).toBe(true);
  });

  it("identifies substring ethnicity matches", () => {
    expect(isAsianEthnicity("East Asian")).toBe(true);
    expect(isAsianEthnicity("south asian descent")).toBe(true);
    expect(isAsianEthnicity("Southeast Asian heritage")).toBe(true);
  });

  it("returns false for non-Asian ethnicities", () => {
    expect(isAsianEthnicity("Caucasian")).toBe(false);
    expect(isAsianEthnicity("African American")).toBe(false);
    expect(isAsianEthnicity("Hispanic")).toBe(false);
  });
});
