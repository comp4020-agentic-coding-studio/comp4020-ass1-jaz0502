import { describe, expect, it } from "vitest";
import { PATCH_COLOR } from "../context";
import {
  complementaryHue,
  complementarySwatch,
  complementRgb,
  setHue,
  surroundBackground,
  surroundRgb,
  wheelPatchColor,
} from "../wheel";

// CONTEXT's round one hard-codes one opponent pair (red surround, green
// surround). This round generalises that: the patch is pulled toward
// whatever hue is opposite the surround, for any surround hue at all.

describe("WHEEL: the patch is always pulled toward the surround's complement", () => {
  it("computes the opposite point on the wheel", () => {
    expect(complementaryHue(0)).toBe(180);
    expect(complementaryHue(300)).toBe(120);
  });

  it("wraps hues past 360 back into range", () => {
    expect(complementaryHue(200)).toBe(20);
  });

  it("normalizes hues outside 0-360 when set", () => {
    expect(setHue({ hue: 0 }, -30).hue).toBe(330);
    expect(setHue({ hue: 0 }, 400).hue).toBe(40);
  });
});

describe("WHEEL: the patch itself never changes", () => {
  it("is the exact same fixed grey CONTEXT's round one proved was fixed", () => {
    expect(wheelPatchColor()).toBe(PATCH_COLOR);
  });
});

describe("WHEEL: the surround and complement reuse CONTEXT's own colour recipe", () => {
  it("produces the same hsl format context.ts uses for its zones", () => {
    expect(surroundBackground({ hue: 0 })).toBe("hsl(0, 82%, 40%)");
    expect(complementarySwatch({ hue: 0 })).toBe("hsl(180, 82%, 40%)");
  });
});

describe("WHEEL: the readouts show concrete rgb channel values", () => {
  it("converts the surround and complement hues to rgb using the same fixed saturation/lightness", () => {
    expect(surroundRgb({ hue: 0 })).toBe("rgb(186, 18, 18)");
    expect(complementRgb({ hue: 0 })).toBe("rgb(18, 186, 186)");
    expect(surroundRgb({ hue: 270 })).toBe("rgb(102, 18, 186)");
    expect(complementRgb({ hue: 270 })).toBe("rgb(102, 186, 18)");
  });
});
