import { describe, expect, it } from "vitest";
import {
  PIXEL_PRESETS,
  PURPLE_COLOR,
  COLOR_GUESS_SWATCHES,
  activeChannels,
  cellSizeRem,
  chooseColorGuess,
  clampZoom,
  hexToChannels,
  initialColorGuessState,
  isColorGuessCorrect,
  isRevealed,
  subpixelColor,
} from "../pixels";

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

// The "what colour do you see?" prompt made active: a small fixed swatch set
// (not a free picker) that deliberately includes the square's own ingredient
// subpixel colours as distractors, so guessing "red" or "blue" is wrong
// about perception even though those are literally what's back there.
describe("PIXELS: the colour guess has exactly one right answer", () => {
  it("includes the purple square's true colour among a small, fixed set of candidates", () => {
    const matches = COLOR_GUESS_SWATCHES.filter((color) => color === PURPLE_COLOR);
    expect(matches.length).toBe(1);
    expect(COLOR_GUESS_SWATCHES.length).toBeGreaterThanOrEqual(4);
    expect(COLOR_GUESS_SWATCHES.length).toBeLessThanOrEqual(6);
  });

  it("starts with no guess made", () => {
    expect(initialColorGuessState().guess).toBeNull();
  });

  it("records a guess", () => {
    const state = chooseColorGuess(COLOR_GUESS_SWATCHES[1]);
    expect(state.guess).toBe(COLOR_GUESS_SWATCHES[1]);
  });

  it("is correct only when the guess matches the square's true colour", () => {
    expect(isColorGuessCorrect(chooseColorGuess("#8b0000"))).toBe(false);
    expect(isColorGuessCorrect(chooseColorGuess(PURPLE_COLOR))).toBe(true);
    expect(isColorGuessCorrect(initialColorGuessState())).toBe(false);
  });
});

// The "choose the pixels yourself" round: generalizing the single hardcoded
// purple demo to a small pre-selected range, the same move wheel.ts made for
// CONTEXT and find-apple.ts made for LIGHT. Every preset must still resolve
// to exactly two lit channels -- the same fusion trick, different colours.
describe("PIXELS: choosing your own pixel colours generalizes the single purple demo", () => {
  it("splits a known hex into exactly its nonzero channels", () => {
    expect(activeChannels(hexToChannels(PURPLE_COLOR))).toEqual(["r", "b"]);
    expect(activeChannels({ r: 0, g: 128, b: 0 })).toEqual(["g"]);
  });

  it("gives every preset exactly two active channels", () => {
    for (const preset of PIXEL_PRESETS) {
      expect(activeChannels(hexToChannels(preset.color)).length).toBe(2);
    }
  });

  it("keeps every preset colour distinct", () => {
    const colors = new Set(PIXEL_PRESETS.map((preset) => preset.color));
    expect(colors.size).toBe(PIXEL_PRESETS.length);
  });

  it("includes the original purple demo as one of the presets", () => {
    expect(PIXEL_PRESETS.some((preset) => preset.color === PURPLE_COLOR)).toBe(true);
  });
});
