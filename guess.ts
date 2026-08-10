// Round two of the CONTEXT beat: same claim, lightness instead of hue. Two
// squares, one identical colour, and a prediction the visitor gets to make
// (and get "wrong") before the reveal tells them why.

export type QuizSide = "left" | "right";

export const QUIZ_PATCH_COLOR = "#6157ac";
export const QUIZ_BACKGROUND: Record<QuizSide, string> = {
  left: "#4334bb",
  right: "#c7c2ef",
};

export interface QuizState {
  guess: QuizSide | null;
}

export function initialQuizState(): QuizState {
  return { guess: null };
}

export function chooseGuess(state: QuizState, side: QuizSide): QuizState {
  return { ...state, guess: side };
}

// The patch is identical on both sides regardless of the guess -- that's
// the whole point of the round.
export function quizPatchColor(_side: QuizSide): string {
  return QUIZ_PATCH_COLOR;
}
