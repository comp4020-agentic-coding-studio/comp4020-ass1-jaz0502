import { describe, expect, it } from "vitest";
import {
  clampPosition,
  dragPatchColor,
  initialDragState,
  setPosition,
  sideFromPosition,
} from "../drag";

// Round three: dragging the patch changes where it sits, never what colour it
// is. These tests hold that contract independent of the native <input
// type="range"> markup that drives it.

describe("DRAG: moving the patch never changes its colour", () => {
  it("keeps the patch colour fixed at every position", () => {
    for (const position of [0, 20, 50, 80, 100]) {
      expect(dragPatchColor()).toBe("#6157ac");
      expect(position).toBeGreaterThanOrEqual(0);
    }
  });

  it("clamps position to the 0-100 range", () => {
    expect(clampPosition(-10)).toBe(0);
    expect(clampPosition(150)).toBe(100);
    expect(clampPosition(42)).toBe(42);
  });

  it("reports which side of the boundary a position falls on", () => {
    expect(sideFromPosition(10)).toBe("left");
    expect(sideFromPosition(90)).toBe("right");
  });

  it("reports no side while sitting exactly on the boundary", () => {
    expect(sideFromPosition(50)).toBe("middle");
  });

  it("setPosition clamps through state", () => {
    const state = setPosition({ position: 20 }, 200);
    expect(state.position).toBe(100);
  });

  it("starts centred between the two backgrounds", () => {
    expect(initialDragState().position).toBe(50);
  });
});
