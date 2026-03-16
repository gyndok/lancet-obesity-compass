import { describe, expect, it } from "bun:test";
import { isAsianEthnicity } from "./ethnicity";

describe("isAsianEthnicity", () => {
  it("returns true for direct matches", () => {
    expect(isAsianEthnicity("Asian")).toBe(true);
    expect(isAsianEthnicity("chinese")).toBe(true);
    expect(isAsianEthnicity("Japanese")).toBe(true);
    expect(isAsianEthnicity("KOREAN")).toBe(true);
    expect(isAsianEthnicity("indian")).toBe(true);
    expect(isAsianEthnicity("Vietnamese")).toBe(true);
    expect(isAsianEthnicity("thai")).toBe(true);
    expect(isAsianEthnicity("Filipino")).toBe(true);
  });

  it("returns true for recognized multi-word descriptions", () => {
    expect(isAsianEthnicity("South Asian")).toBe(true);
    expect(isAsianEthnicity("East Asian descent")).toBe(true);
    expect(isAsianEthnicity("southeast asian heritage")).toBe(true);
  });

  it("trims whitespace before evaluation", () => {
    expect(isAsianEthnicity("  asian  ")).toBe(true);
  });

  it("returns false for other ethnicities", () => {
    expect(isAsianEthnicity("Caucasian")).toBe(false);
    expect(isAsianEthnicity("African American")).toBe(false);
    expect(isAsianEthnicity("Hispanic/Latino")).toBe(false);
  });

  it("returns false when ethnicity is empty or undefined", () => {
    expect(isAsianEthnicity("")).toBe(false);
    expect(isAsianEthnicity(undefined)).toBe(false);
    expect(isAsianEthnicity(null)).toBe(false);
  });
});
