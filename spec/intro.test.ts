import { describe, expect, it } from "vitest";
import { nextIntroAccent } from "../intro";

describe("INTRO: clicking a thesis word cycles its accent colour", () => {
  it("starts at red from no accent", () => {
    expect(nextIntroAccent(null)).toBe("red");
  });

  it("advances through the palette in order", () => {
    expect(nextIntroAccent("red")).toBe("yellow");
  });

  it("wraps back to no accent after the last colour", () => {
    expect(nextIntroAccent("yellow")).toBeNull();
  });
});
