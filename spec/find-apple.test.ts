import { describe, expect, it } from "vitest";
import { TRUE_COLOR } from "../light";
import {
  chooseAppleGuess,
  GUESS_SWATCHES,
  initialFindAppleState,
  isCorrectGuess,
  setGlow,
} from "../find-apple";

// LIGHT's second round: the same claim, put to the test instead of just
// shown. The visitor commits to a guess before the reveal, so the swatch
// set needs exactly one right answer and the state needs to track it.

describe("FIND-APPLE: the swatch set has exactly one right answer", () => {
  it("includes the apple's true colour among a small, fixed set of candidates", () => {
    const matches = GUESS_SWATCHES.filter((color) => color === TRUE_COLOR);
    expect(matches.length).toBe(1);
    expect(GUESS_SWATCHES.length).toBeGreaterThanOrEqual(4);
    expect(GUESS_SWATCHES.length).toBeLessThanOrEqual(6);
  });
});

describe("FIND-APPLE: state tracks the chosen light and the visitor's guess", () => {
  it("starts under candlelight with no guess made", () => {
    const state = initialFindAppleState();
    expect(state.glow).toBe("candlelight");
    expect(state.guess).toBeNull();
  });

  it("records a guess", () => {
    const state = chooseAppleGuess(initialFindAppleState(), GUESS_SWATCHES[1]);
    expect(state.guess).toBe(GUESS_SWATCHES[1]);
  });

  it("clears the guess when the light changes -- a new light re-poses the question", () => {
    const guessed = chooseAppleGuess(initialFindAppleState(), GUESS_SWATCHES[1]);
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
