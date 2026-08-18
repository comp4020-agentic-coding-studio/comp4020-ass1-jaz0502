// LIGHT's second round: the same claim, made active. The apple sits under
// one of the beat's own exaggerated presets and the visitor commits to a
// guess about its "real" colour before the reveal shows it was baseColor()
// all along -- the light changed, never the apple.

import { TRUE_COLOR } from "./light";

export type Glow = "candlelight" | "led"; // sunlight barely tints -- no illusion to test

// A small fixed set of candidates, not a free colour picker: under a
// strongly tinted light "what colour is it really" has one right answer,
// and a free picker would have no clean right/wrong to reveal.
const DISTRACTORS = ["#c76a2a", "#8a2350", "#e0724f", "#7a1f1a", "#b23a70"] as const;

// The true colour sits at a different position per glow -- always the
// first swatch would let a visitor guess right out of habit rather than by
// actually judging the colour.
export const GUESS_SWATCHES_BY_GLOW: Record<Glow, readonly string[]> = {
  candlelight: [DISTRACTORS[0], DISTRACTORS[1], DISTRACTORS[2], TRUE_COLOR, DISTRACTORS[3], DISTRACTORS[4]],
  led: [DISTRACTORS[0], TRUE_COLOR, DISTRACTORS[1], DISTRACTORS[2], DISTRACTORS[3], DISTRACTORS[4]],
};

export function guessSwatchesForGlow(glow: Glow): readonly string[] {
  return GUESS_SWATCHES_BY_GLOW[glow];
}

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
