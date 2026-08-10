import { describe, expect, it } from "vitest";
import { HUES, initialState, patchColor, setZoneHue, toggleReveal, zoneBackground } from "../context";

// The core interaction the spec asks for: the visitor changes what surrounds
// the patch and sees the page respond. These tests hold the contract, not
// the markup, so they survive a change of DOM structure or styling.

describe("CONTEXT: the patch never changes, only its surroundings do", () => {
  it("keeps the patch colour fixed no matter which hue the visitor picks", () => {
    let state = initialState();
    for (const hue of HUES) {
      state = setZoneHue(state, "a", hue);
      state = setZoneHue(state, "b", hue);
      expect(patchColor()).toBe("#808080");
    }
  });

  it("gives the two zones different backgrounds by default", () => {
    const state = initialState();
    expect(zoneBackground(state, "a")).not.toBe(zoneBackground(state, "b"));
  });

  it("is the visitor's core interaction: revealing removes the difference in context", () => {
    let state = initialState();
    state = setZoneHue(state, "a", 0);
    state = setZoneHue(state, "b", 240);
    expect(zoneBackground(state, "a")).not.toBe(zoneBackground(state, "b"));

    state = toggleReveal(state);
    expect(zoneBackground(state, "a")).toBe(zoneBackground(state, "b"));
  });

  it("toggling reveal again brings each zone's own colour back", () => {
    let state = initialState();
    state = setZoneHue(state, "a", 60);
    const beforeA = zoneBackground(state, "a");

    state = toggleReveal(state);
    state = toggleReveal(state);
    expect(zoneBackground(state, "a")).toBe(beforeA);
  });
});
