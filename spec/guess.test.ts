import { describe, expect, it } from "vitest";
import { chooseGuess, initialQuizState, quizPatchColor } from "../guess";

// Round two of CONTEXT: same claim, framed as a prediction the visitor makes
// and gets "wrong". The test holds the one thing that must stay true no
// matter which side the visitor picks.

describe("GUESS: the two patches stay identical whichever side is picked", () => {
  it("returns the same patch colour for both sides", () => {
    expect(quizPatchColor("left")).toBe(quizPatchColor("right"));
  });

  it("records the visitor's guess as state", () => {
    let state = initialQuizState();
    expect(state.guess).toBeNull();

    state = chooseGuess(state, "left");
    expect(state.guess).toBe("left");

    state = chooseGuess(state, "right");
    expect(state.guess).toBe("right");
  });
});
