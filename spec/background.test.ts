import { describe, expect, it } from "vitest";
import { pickActiveSection } from "../background";

describe("BACKGROUND: picking which section drives the fixed background", () => {
  it("picks the section with the highest visibility ratio", () => {
    expect(
      pickActiveSection([
        { id: "hero", ratio: 0.2 },
        { id: "context", ratio: 0.8 },
      ]),
    ).toBe("context");
  });

  it("ignores sections with zero or negative ratio", () => {
    expect(pickActiveSection([{ id: "hero", ratio: 0 }])).toBeNull();
  });

  it("returns null when nothing is visible", () => {
    expect(pickActiveSection([])).toBeNull();
  });

  it("breaks ties by keeping the first entry seen", () => {
    expect(
      pickActiveSection([
        { id: "hero", ratio: 0.5 },
        { id: "context", ratio: 0.5 },
      ]),
    ).toBe("hero");
  });
});
