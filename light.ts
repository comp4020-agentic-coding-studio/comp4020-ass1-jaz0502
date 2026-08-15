// The LIGHT beat's state logic, kept separate from DOM wiring like context.ts
// and drag.ts. The claim here is different from CONTEXT's: the rendered
// pixel genuinely does change under different light, but the object's own
// material colour -- its albedo -- never does. baseColor() is that fixed
// value; everything else in this module derives from the light instead.

export type LightPreset = "neutral" | "warm" | "cool";

export const TRUE_COLOR = "#d1352b"; // matches --red in styles.css

export interface LightState {
  angle: number; // degrees, 0-360: position of the light around the object
  preset: LightPreset;
}

export function initialLightState(): LightState {
  return { angle: 300, preset: "neutral" };
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function setAngle(state: LightState, angle: number): LightState {
  return { ...state, angle: normalizeAngle(angle) };
}

export function setPreset(state: LightState, preset: LightPreset): LightState {
  return { ...state, preset };
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function toHex(rgb: Rgb): string {
  const channel = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

// The colour the light itself contributes to the highlight, and how strongly
// -- neutral (white) light barely tints the surface; warm/cool light tints
// it hard, which is what makes the "same object" claim worth making at all.
const PRESET_TINT: Record<LightPreset, Rgb & { amount: number }> = {
  neutral: { r: 255, g: 255, b: 255, amount: 0.15 },
  warm: { r: 255, g: 176, b: 80, amount: 0.45 },
  cool: { r: 120, g: 170, b: 255, amount: 0.45 },
};

// Ambient/bounce light in a shadow skews toward the *complementary* hue of
// the light colour -- the same complementary-colour idea CONTEXT introduced,
// now showing up in a shadow instead of a flat background.
const SHADOW_TINT: Record<LightPreset, Rgb> = {
  neutral: { r: 60, g: 60, b: 70 },
  warm: { r: 90, g: 130, b: 200 },
  cool: { r: 200, g: 140, b: 80 },
};

const SHADOW_DARK: Rgb = { r: 25, g: 18, b: 20 };

// The light is most "front-on" (strongest highlight) at this angle; it fades
// as the light swings around behind the object.
const FRONT_ANGLE = 270;

function facingFactor(angle: number): number {
  const rad = ((angle - FRONT_ANGLE) * Math.PI) / 180;
  return 0.35 + 0.65 * ((1 + Math.cos(rad)) / 2);
}

// The object's own colour -- fixed, whatever the light is doing.
export function baseColor(): string {
  return TRUE_COLOR;
}

export function highlightColor(state: LightState): string {
  const tint = PRESET_TINT[state.preset];
  const amount = tint.amount * facingFactor(state.angle);
  return toHex(mixRgb(hexToRgb(TRUE_COLOR), tint, amount));
}

export function shadowColor(state: LightState): string {
  const darkened = mixRgb(hexToRgb(TRUE_COLOR), SHADOW_DARK, 0.7);
  return toHex(mixRgb(darkened, SHADOW_TINT[state.preset], 0.35));
}

export interface Offset {
  x: number;
  y: number;
}

// Where the specular highlight sits on the sphere, as a % offset from centre.
export function highlightOffset(state: LightState): Offset {
  const rad = (state.angle * Math.PI) / 180;
  return { x: Math.cos(rad) * 22, y: Math.sin(rad) * 22 };
}

export interface ShadowOffset {
  x: number;
  scale: number;
}

// The cast shadow falls opposite the light, and stretches out when the light
// is low/to the side (grazing) rather than directly overhead.
export function shadowOffset(state: LightState): ShadowOffset {
  const rad = (state.angle * Math.PI) / 180;
  const x = -Math.cos(rad) * 30;
  const scale = 0.6 + 0.4 * Math.abs(Math.cos(rad));
  return { x, scale };
}

// Pure geometry so the pointer-drag math is testable without a browser.
// dx/dy are the pointer's offset from the ring's centre.
export function angleFromPointer(dx: number, dy: number): number {
  return normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
}
