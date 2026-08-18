import { describe, expect, it } from "vitest";
import { TRUE_COLOR } from "../light";
import {
  chooseAppleGuess,
  guessSwatchesForGlow,
  initialFindAppleState,
  isCorrectGuess,
  setGlow,
} from "../find-apple";

// LIGHT's second round: the same claim, put to the test instead of just
// shown. The visitor commits to a guess before the reveal, so the swatch
// set needs exactly one right answer and the state needs to track it.

describe("FIND-APPLE: the swatch set has exactly one right answer", () => {
  it("includes the apple's true colour among a small, fixed set of candidates, for every glow", () => {
    for (const glow of ["candlelight", "led"] as const) {
      const swatches = guessSwatchesForGlow(glow);
      const matches = swatches.filter((color) => color === TRUE_COLOR);
      expect(matches.length).toBe(1);
      expect(swatches.length).toBeGreaterThanOrEqual(4);
      expect(swatches.length).toBeLessThanOrEqual(6);
    }
  });

  it("puts the true colour at a different position per glow, not always the first swatch", () => {
    expect(guessSwatchesForGlow("candlelight").indexOf(TRUE_COLOR)).toBe(3);
    expect(guessSwatchesForGlow("led").indexOf(TRUE_COLOR)).toBe(1);
  });
});

describe("FIND-APPLE: state tracks the chosen light and the visitor's guess", () => {
  it("starts under candlelight with no guess made", () => {
    const state = initialFindAppleState();
    expect(state.glow).toBe("candlelight");
    expect(state.guess).toBeNull();
  });

  it("records a guess", () => {
    const state = chooseAppleGuess(initialFindAppleState(), "#8a2350");
    expect(state.guess).toBe("#8a2350");
  });

  it("clears the guess when the light changes -- a new light re-poses the question", () => {
    const guessed = chooseAppleGuess(initialFindAppleState(), "#8a2350");
    const relit = setGlow(guessed, "led");
    expect(relit.glow).toBe("led");
    expect(relit.guess).toBeNull();
  });
});

describe("FIND-APPLE: only the true colour counts as correct", () => {
  it("is correct only when the guess matches the apple's true colour", () => {
    const wrong = chooseAppleGuess(initialFindAppleState(), "#8a2350");
    expect(isCorrectGuess(wrong)).toBe(false);

    const right = chooseAppleGuess(initialFindAppleState(), TRUE_COLOR);
    expect(isCorrectGuess(right)).toBe(true);
  });

  it("is not correct before any guess is made", () => {
    expect(isCorrectGuess(initialFindAppleState())).toBe(false);
  });
});
