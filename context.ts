// The CONTEXT beat's state logic, kept separate from DOM wiring so the core
// claim -- changing what surrounds the patch never changes the patch itself
// -- is a plain function you can test without a browser.

export type Zone = "a" | "b";

export const PATCH_COLOR = "#808080";
const NEUTRAL_BG = "#e7e4df";

export const HUES = [0, 60, 120, 180, 240, 300] as const;

export interface ContrastState {
  zoneA: number;
  zoneB: number;
  revealed: boolean;
}

// Red and green sit on one of the eye's two opponent channels, which is why
// this pair, not an arbitrary one, gives the strongest induction by default.
export function initialState(): ContrastState {
  return { zoneA: 0, zoneB: 120, revealed: false };
}

export function setZoneHue(state: ContrastState, zone: Zone, hue: number): ContrastState {
  return zone === "a" ? { ...state, zoneA: hue } : { ...state, zoneB: hue };
}

export function toggleReveal(state: ContrastState): ContrastState {
  return { ...state, revealed: !state.revealed };
}

// More saturated and slightly darker than a "safe" pastel: induction scales
// with how strongly the surround itself reads as coloured.
export function hueToBackground(hue: number): string {
  return `hsl(${hue}, 82%, 40%)`;
}

// The patch colour never derives from state -- that's the whole point.
export function patchColor(): string {
  return PATCH_COLOR;
}

export function zoneBackground(state: ContrastState, zone: Zone): string {
  if (state.revealed) return NEUTRAL_BG;
  return hueToBackground(zone === "a" ? state.zoneA : state.zoneB);
}
