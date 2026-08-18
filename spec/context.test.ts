import { describe, expect, it } from "vitest";
import { SHADES, initialState, patchColor, setZoneShade, toggleReveal, zoneBackground } from "../context";

// The core interaction the spec asks for: the visitor changes what surrounds
// the patch and sees the page respond. These tests hold the contract, not
// the markup, so they survive a change of DOM structure or styling.

describe("CONTEXT: the patch never changes, only its surroundings do", () => {
  it("keeps the patch colour fixed no matter which shade the visitor picks", () => {
    let state = initialState();
    for (const shade of SHADES) {
      state = setZoneShade(state, "a", shade);
      state = setZoneShade(state, "b", shade);
      expect(patchColor()).toBe("#808080");
    }
  });

  it("gives the two zones different backgrounds by default", () => {
    const state = initialState();
    expect(zoneBackground(state, "a")).not.toBe(zoneBackground(state, "b"));
  });

  it("is the visitor's core interaction: revealing removes the difference in context", () => {
    let state = initialState();
    state = setZoneShade(state, "a", 10);
    state = setZoneShade(state, "b", 90);
    expect(zoneBackground(state, "a")).not.toBe(zoneBackground(state, "b"));

    state = toggleReveal(state);
    expect(zoneBackground(state, "a")).toBe(zoneBackground(state, "b"));
  });

  it("toggling reveal again brings each zone's own colour back", () => {
    let state = initialState();
    state = setZoneShade(state, "a", 25);
    const beforeA = zoneBackground(state, "a");

    state = toggleReveal(state);
    state = toggleReveal(state);
    expect(zoneBackground(state, "a")).toBe(beforeA);
  });
});
