import { describe, expect, it } from "vitest";
import { PURPLE_COLOR, cellSizeRem, clampZoom, hexToChannels, isRevealed, subpixelColor } from "../pixels";

// The core claim the PIXELS beat makes: a colour that reads as a single hue
// is really dark red and dark blue subpixels the eye fuses together --
// closing the loop on CONTEXT and LIGHT's "neighbours change what you
// perceive" idea by showing it's true of the screen itself, right down to
// zero green light. Purple is non-spectral (no wavelength of light is
// purple), so unlike orange this claim holds regardless of display
// technology. Zooming out is already the fine subpixel pattern -- zooming in
// only enlarges the same checkerboard, it never fades colour in.

describe("PIXELS: the purple square has no green subpixel at all", () => {
  it("splits into a red and a blue channel with zero green", () => {
    const channels = hexToChannels(PURPLE_COLOR);
    expect(channels.g).toBe(0);
    expect(channels.r).toBeGreaterThan(0);
    expect(channels.b).toBeGreaterThan(0);
  });
});

describe("PIXELS: decomposing a hex into its subpixels", () => {
  it("reads known channel values from a hex colour", () => {
    expect(hexToChannels("#808080")).toEqual({ r: 128, g: 128, b: 128 });
    expect(hexToChannels("#8b008b")).toEqual({ r: 139, g: 0, b: 139 });
  });

  it("isolates a single channel and zeroes the others", () => {
    const channels = hexToChannels("#8b008b");
    expect(subpixelColor(channels, "r")).toBe("rgb(139, 0, 0)");
    expect(subpixelColor(channels, "b")).toBe("rgb(0, 0, 139)");
    expect(subpixelColor(channels, "g")).toBe("rgb(0, 0, 0)");
  });
});

describe("PIXELS: the zoom slider enlarges the same subpixels rather than fading colour in", () => {
  it("clamps zoom to the 0-100 range", () => {
    expect(clampZoom(-20)).toBe(0);
    expect(clampZoom(150)).toBe(100);
  });

  it("already shows the fine chequerboard cell size at zoom 0, not a flat colour", () => {
    expect(cellSizeRem(0)).toBeGreaterThan(0);
  });

  it("grows the cell size as zoom increases", () => {
    const zooms = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    for (let i = 1; i < zooms.length; i++) {
      expect(cellSizeRem(zooms[i])).toBeGreaterThan(cellSizeRem(zooms[i - 1]));
    }
  });

  it("is at its largest, most obviously-two-colour size at zoom 100", () => {
    expect(cellSizeRem(100)).toBeGreaterThan(cellSizeRem(0) * 5);
  });
});

describe("PIXELS: the reveal callout only appears once the zoom is essentially complete", () => {
  it("is not revealed at zoom 0 or midway through", () => {
    expect(isRevealed(0)).toBe(false);
    expect(isRevealed(50)).toBe(false);
  });

  it("is revealed at zoom 100", () => {
    expect(isRevealed(100)).toBe(true);
  });
});
