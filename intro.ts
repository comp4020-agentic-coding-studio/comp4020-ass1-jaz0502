// The thesis paragraph's words are click-to-cycle: the word itself never
// changes, only an accent colour laid over it, echoing the page's own claim
// that colour is a comparison against context rather than a fixed property.
// Blue is left out of the cycle -- the intro's own background runs into blue,
// so a blue word would vanish against it.

const PALETTE = ["red", "yellow"] as const;

export type IntroAccent = (typeof PALETTE)[number] | null;

export function nextIntroAccent(current: IntroAccent): IntroAccent {
  if (current === null) return PALETTE[0];
  const index = PALETTE.indexOf(current);
  return index === PALETTE.length - 1 ? null : PALETTE[index + 1];
}
