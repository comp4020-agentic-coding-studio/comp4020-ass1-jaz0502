// The CONTEXT beat's state logic, kept separate from DOM wiring so the core
// claim -- changing what surrounds the patch never changes the patch itself
// -- is a plain function you can test without a browser.

export type Zone = "a" | "b";

export const PATCH_COLOR = "#808080";
const NEUTRAL_BG = "#e7e4df";

// Lightness percentages, not hues -- the induction here is brightness
// contrast, not colour contrast, so the surrounds are pure greys.
export const SHADES = [10, 25, 40, 60, 75, 90] as const;

export interface ContrastState {
  zoneA: number;
  zoneB: number;
  revealed: boolean;
}

// A dark surround and a light surround give the strongest brightness
// contrast by default -- the same grey patch reads lighter against the dark
// zone and darker against the light one.
export function initialState(): ContrastState {
  return { zoneA: 10, zoneB: 90, revealed: false };
}

export function setZoneShade(state: ContrastState, zone: Zone, shade: number): ContrastState {
  return zone === "a" ? { ...state, zoneA: shade } : { ...state, zoneB: shade };
}

export function toggleReveal(state: ContrastState): ContrastState {
  return { ...state, revealed: !state.revealed };
}

export function shadeToBackground(shade: number): string {
  return `hsl(0, 0%, ${shade}%)`;
}

// Kept for the wheel round further down CONTEXT, which stays hue-based --
// only the swatch buttons above it switched to grey shades.
export function hueToBackground(hue: number): string {
  return `hsl(${hue}, 82%, 40%)`;
}

// The patch colour never derives from state -- that's the whole point.
export function patchColor(): string {
  return PATCH_COLOR;
}

export function zoneBackground(state: ContrastState, zone: Zone): string {
  if (state.revealed) return NEUTRAL_BG;
  return shadeToBackground(zone === "a" ? state.zoneA : state.zoneB);
}
