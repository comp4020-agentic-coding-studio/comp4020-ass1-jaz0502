import { describe, expect, it } from "vitest";
import {
  angleFromPointer,
  baseColor,
  highlightColor,
  highlightOffset,
  initialLightState,
  setAngle,
  setPreset,
  shadowColor,
  shadowOffset,
  type LightPreset,
} from "../light";

const PRESETS: LightPreset[] = ["neutral", "warm", "cool"];
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// The core claim the LIGHT beat makes: the object's own colour never moves,
// even though the light around it clearly does. Different mechanism from
// CONTEXT's simultaneous contrast, same rigour: a value that provably stays
// put underneath a rendering that visibly doesn't.
describe("LIGHT: the material colour never changes, only the light does", () => {
  it("keeps the base colour fixed across every preset and angle", () => {
    let state = initialLightState();
    for (const preset of PRESETS) {
      state = setPreset(state, preset);
      for (const angle of ANGLES) {
        state = setAngle(state, angle);
        expect(baseColor()).toBe("#d1352b");
      }
    }
  });

  it("changes the highlight colour when the light preset changes", () => {
    const state = initialLightState();
    const neutral = highlightColor(setPreset(state, "neutral"));
    const warm = highlightColor(setPreset(state, "warm"));
    const cool = highlightColor(setPreset(state, "cool"));
    expect(new Set([neutral, warm, cool]).size).toBe(3);
  });

  it("moves the highlight to the opposite side as the light swings 180 degrees", () => {
    const state = initialLightState();
    const near = highlightOffset(setAngle(state, 0));
    const far = highlightOffset(setAngle(state, 180));
    expect(Math.sign(near.x)).not.toBe(Math.sign(far.x));
  });

  it("casts the shadow roughly opposite the highlight", () => {
    const state = initialLightState();
    const highlight = highlightOffset(setAngle(state, 0));
    const shadow = shadowOffset(setAngle(state, 0));
    expect(Math.sign(shadow.x)).not.toBe(Math.sign(highlight.x));
  });

  it("tints the shadow toward the light's complementary hue, and never the same as the highlight", () => {
    for (const preset of PRESETS) {
      const state = setPreset(initialLightState(), preset);
      expect(shadowColor(state)).not.toBe(highlightColor(state));
    }
    const warmShadow = shadowColor(setPreset(initialLightState(), "warm"));
    const coolShadow = shadowColor(setPreset(initialLightState(), "cool"));
    expect(warmShadow).not.toBe(coolShadow);
  });

  it("normalizes angles outside 0-360 the same way the drag handle would produce them", () => {
    const state = initialLightState();
    expect(setAngle(state, 370).angle).toBe(10);
    expect(setAngle(state, -10).angle).toBe(350);
  });
});

describe("LIGHT: dragging the handle maps pointer position to an angle", () => {
  it("reads pointer offsets as the expected compass angle", () => {
    expect(angleFromPointer(1, 0)).toBe(0);
    expect(angleFromPointer(0, 1)).toBe(90);
    expect(angleFromPointer(-1, 0)).toBe(180);
    expect(angleFromPointer(0, -1)).toBe(270);
  });
});
