// A deeper layer on CONTEXT's core claim, not a new topic: red/green in round
// one and the shadow tint in LIGHT are both one fixed instance of a general
// rule -- the eye pulls a neutral patch toward whatever hue is opposite its
// surround on the colour wheel. This module makes that rule explicit and
// lets the surround rotate through the full 360deg instead of stopping at
// the one pair round one happened to pick.

import { PATCH_COLOR, hueToBackground } from "./context";

export interface WheelState {
  hue: number; // degrees, 0-360: the surround colour rotating around the wheel
}

export function initialWheelState(): WheelState {
  return { hue: 0 };
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

export function setHue(state: WheelState, hue: number): WheelState {
  return { ...state, hue: normalizeHue(hue) };
}

// The opponent-process claim as one function: whatever hue surrounds the
// patch, the eye pulls the patch toward this hue's opposite -- the same
// reason round one's red surround read green by default, and the same
// reason LIGHT's shadow skews toward its light's complement.
export function complementaryHue(hue: number): number {
  return normalizeHue(hue + 180);
}

// The patch never derives from state here either -- same fixed grey as
// round one, just under a surround that keeps moving.
export function wheelPatchColor(): string {
  return PATCH_COLOR;
}

export function surroundBackground(state: WheelState): string {
  return hueToBackground(state.hue);
}

export function complementarySwatch(state: WheelState): string {
  return hueToBackground(complementaryHue(state.hue));
}

// hueToBackground's fixed saturation/lightness, converted to rgb() for the
// readouts -- "predicted complement" means something concrete once it's the
// actual channel values, not just a second hue in the abstract.
const SATURATION = 0.82;
const LIGHTNESS = 0.4;

function hueToRgb(hue: number): string {
  const c = (1 - Math.abs(2 * LIGHTNESS - 1)) * SATURATION;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = LIGHTNESS - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hue < 60) {
    rp = c;
    gp = x;
  } else if (hue < 120) {
    rp = x;
    gp = c;
  } else if (hue < 180) {
    gp = c;
    bp = x;
  } else if (hue < 240) {
    gp = x;
    bp = c;
  } else if (hue < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  const r = Math.round((rp + m) * 255);
  const g = Math.round((gp + m) * 255);
  const b = Math.round((bp + m) * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export function surroundRgb(state: WheelState): string {
  return hueToRgb(state.hue);
}

export function complementRgb(state: WheelState): string {
  return hueToRgb(complementaryHue(state.hue));
}
