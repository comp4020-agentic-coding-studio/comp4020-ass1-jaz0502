// LIGHT's second round: the same claim, made active. The apple sits under
// one of the beat's own exaggerated presets and the visitor commits to a
// guess about its "real" colour before the reveal shows it was baseColor()
// all along -- the light changed, never the apple.

import { TRUE_COLOR } from "./light";

export type Glow = "candlelight" | "led"; // sunlight barely tints -- no illusion to test

// A small fixed set of candidates, not a free colour picker: under a
// strongly tinted light "what colour is it really" has one right answer,
// and a free picker would have no clean right/wrong to reveal.
export const GUESS_SWATCHES = [
  TRUE_COLOR, // mixed in among the distractors
  "#c76a2a",
  "#8a2350",
  "#e0724f",
  "#7a1f1a",
  "#b23a70",
] as const;

export interface FindAppleState {
  glow: Glow;
  guess: string | null;
}

export function initialFindAppleState(): FindAppleState {
  return { glow: "candlelight", guess: null };
}

// Switching the light re-poses the question, so the old guess is cleared.
export function setGlow(state: FindAppleState, glow: Glow): FindAppleState {
  return { glow, guess: null };
}

export function chooseAppleGuess(state: FindAppleState, guess: string): FindAppleState {
  return { ...state, guess };
}

export function isCorrectGuess(state: FindAppleState): boolean {
  return state.guess === TRUE_COLOR;
}
