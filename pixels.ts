// The PIXELS beat's state logic, kept separate from DOM wiring like the
// other beats. The claim here: colour is combined from neighbours all the
// way down. What reads as a flat purple square is actually a dense
// checkerboard of dark red and dark blue subpixels, already fused by the eye
// at normal viewing scale -- zooming in doesn't add colour, it just enlarges
// the existing subpixels until they're too big to fuse any more. Unlike
// orange (a real spectral wavelength), purple/magenta is non-spectral -- no
// single wavelength of light is purple, so this claim holds regardless of
// display technology, not just of this screen's subpixel layout.

export const PURPLE_COLOR = "#8b008b"; // R=139 G=0 B=139 (darkred + darkblue)

export interface Channels {
  r: number;
  g: number;
  b: number;
}

export function hexToChannels(hex: string): Channels {
  const value = Number.parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

// Isolates one channel at its own brightness -- what that subpixel alone
// would look like if you could see it on its own.
export function subpixelColor(channels: Channels, channel: "r" | "g" | "b"): string {
  const r = channel === "r" ? channels.r : 0;
  const g = channel === "g" ? channels.g : 0;
  const b = channel === "b" ? channels.b : 0;
  return `rgb(${r}, ${g}, ${b})`;
}

const PURPLE_CHANNELS = hexToChannels(PURPLE_COLOR);

// The exact dark red and dark blue the purple square is made of -- not an
// arbitrary pure red/blue, but this colour's own channel values.
export const SUBPIXEL_RED = subpixelColor(PURPLE_CHANNELS, "r");
export const SUBPIXEL_BLUE = subpixelColor(PURPLE_CHANNELS, "b");

export interface ColorGuessState {
  guess: string | null;
}

export function initialColorGuessState(): ColorGuessState {
  return { guess: null };
}

export function chooseColorGuess(guess: string): ColorGuessState {
  return { guess };
}

export function isColorGuessCorrect(state: ColorGuessState): boolean {
  return state.guess === PURPLE_COLOR;
}

// Includes the square's own two ingredient subpixel colours as distractors --
// guessing "red" or "blue" is wrong about what's perceived (it reads as
// purple), and guessing purple is right about perception but wrong about
// what's actually there once you zoom in.
export const COLOR_GUESS_SWATCHES = [
  PURPLE_COLOR,
  "#8b0000",
  "#00008b",
  "#808080",
  "#ff00ff",
] as const;

export type ChannelKey = "r" | "g" | "b";

export const CHANNEL_LABEL: Record<ChannelKey, string> = { r: "Red", g: "Green", b: "Blue" };

// Which channels are actually lit -- every preset below uses exactly two,
// the same shape as the purple demo's dark-red + dark-blue split.
export function activeChannels(channels: Channels): ChannelKey[] {
  return (["r", "g", "b"] as const).filter((c) => channels[c] > 0);
}

export interface PixelPreset {
  key: string;
  label: string;
  color: string;
}

// A pre-selected range, not a free colour picker -- purple isn't special,
// generalizing it just swaps which two channels are doing the fusing.
export const PIXEL_PRESETS: PixelPreset[] = [
  { key: "purple", label: "Purple", color: PURPLE_COLOR }, // red + blue
  { key: "yellow", label: "Yellow", color: "#8b8b00" }, // red + green
  { key: "cyan", label: "Cyan", color: "#008b8b" }, // green + blue
];

export interface ZoomState {
  zoom: number; // 0-100: 0 is zoomed out (flat), 100 is zoomed in (subpixels)
}

export function initialZoomState(): ZoomState {
  return { zoom: 0 };
}

export function clampZoom(zoom: number): number {
  return Math.min(100, Math.max(0, zoom));
}

export function setZoom(state: ZoomState, zoom: number): ZoomState {
  return { ...state, zoom: clampZoom(zoom) };
}

// The red/blue checkerboard is never hidden -- "zoomed all the way out" is
// already the same fine, dense pixel pattern the old design only revealed at
// full zoom. That density is what reads as a single fused purple at a
// glance. Zooming in doesn't fade colour in; it makes each subpixel bigger,
// like a literal magnifying glass on the screen, until the red and dark blue
// squares are unmistakable.
const MIN_CELL_REM = 0.4;
const MAX_CELL_REM = 3.2;

export function cellSizeRem(zoom: number): number {
  const t = clampZoom(zoom) / 100;
  return MIN_CELL_REM + t * (MAX_CELL_REM - MIN_CELL_REM);
}

const REVEAL_THRESHOLD = 60;

// The "where did the purple go?" callout appears once the squares are
// enlarged enough that no one could still call it purple, the same
// threshold-reveal pattern CONTEXT uses.
export function isRevealed(zoom: number): boolean {
  return clampZoom(zoom) >= REVEAL_THRESHOLD;
}
