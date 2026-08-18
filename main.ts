import {
  SHADES,
  initialState,
  patchColor,
  setZoneShade,
  toggleReveal,
  zoneBackground,
  type ContrastState,
  type Zone,
} from "./context";
import {
  QUIZ_BACKGROUND,
  chooseGuess,
  initialQuizState,
  quizPatchColor,
  type QuizSide,
  type QuizState,
} from "./guess";
import {
  dragPatchColor,
  initialDragState,
  setPosition,
  sideFromPosition,
  type DragState,
} from "./drag";
import { pickActiveSection, type SectionVisibility } from "./background";
import { nextIntroAccent, type IntroAccent } from "./intro";
import {
  angleFromPointer,
  baseColor,
  FRONT_ANGLE,
  highlightColor,
  highlightOffset,
  initialLightState,
  setAngle,
  setPreset,
  shadowColor,
  shadowOffset,
  type LightPreset,
  type LightState,
} from "./light";
import {
  chooseAppleGuess,
  guessSwatchesForGlow,
  initialFindAppleState,
  isCorrectGuess,
  setGlow,
  type FindAppleState,
  type Glow,
} from "./find-apple";
import {
  CHANNEL_LABEL,
  COLOR_GUESS_SWATCHES,
  PIXEL_PRESETS,
  SUBPIXEL_BLUE,
  SUBPIXEL_RED,
  activeChannels,
  cellSizeRem,
  chooseColorGuess,
  hexToChannels,
  initialColorGuessState,
  initialZoomState,
  isColorGuessCorrect,
  isRevealed,
  setZoom,
  subpixelColor,
  type ColorGuessState,
  type PixelPreset,
  type ZoomState,
} from "./pixels";
import {
  complementarySwatch,
  complementRgb,
  initialWheelState,
  setHue,
  surroundBackground,
  surroundRgb,
  wheelPatchColor,
  type WheelState,
} from "./wheel";

const SHADE_NAMES: Record<number, string> = {
  10: "Near black",
  25: "Dark grey",
  40: "Mid-dark grey",
  60: "Mid-light grey",
  75: "Light grey",
  90: "Near white",
};

const ZONES: Zone[] = ["a", "b"];

let state: ContrastState = initialState();

const stage = document.querySelector<HTMLElement>('[data-testid="contrast-stage"]');
const revealButton = document.querySelector<HTMLButtonElement>('[data-testid="reveal-toggle"]');

function zoneEl(zone: Zone) {
  return document.querySelector<HTMLElement>(`.contrast-zone[data-zone="${zone}"]`);
}
function patchEl(zone: Zone) {
  return document.querySelector<HTMLElement>(`[data-testid="patch-${zone}"]`);
}
function readoutEl(zone: Zone) {
  return document.querySelector<HTMLElement>(`[data-testid="readout-${zone}"]`);
}
function swatchContainer(zone: Zone) {
  return document.querySelector<HTMLElement>(`.swatches[data-zone="${zone}"]`);
}

function buildSwatches(zone: Zone) {
  const container = swatchContainer(zone);
  if (!container) return;
  for (const shade of SHADES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.backgroundColor = `hsl(0, 0%, ${shade}%)`;
    button.setAttribute("aria-label", SHADE_NAMES[shade] ?? `Grey ${shade}%`);
    button.dataset.shade = String(shade);
    button.addEventListener("click", () => {
      state = setZoneShade(state, zone, shade);
      render();
    });
    container.append(button);
  }
}

function render() {
  for (const zone of ZONES) {
    zoneEl(zone)?.style.setProperty("background-color", zoneBackground(state, zone));

    const patch = patchEl(zone);
    if (patch) patch.style.backgroundColor = patchColor();

    const readout = readoutEl(zone);
    if (readout) {
      readout.textContent = patchColor();
      readout.setAttribute("aria-hidden", String(!state.revealed));
    }

    const activeShade = zone === "a" ? state.zoneA : state.zoneB;
    for (const button of swatchContainer(zone)?.querySelectorAll<HTMLButtonElement>(".swatch") ??
      []) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.shade) === activeShade));
    }
  }

  stage?.classList.toggle("revealed", state.revealed);
  if (revealButton) {
    revealButton.setAttribute("aria-pressed", String(state.revealed));
    revealButton.textContent = state.revealed ? "Change it back" : "Same square?";
  }
}

buildSwatches("a");
buildSwatches("b");
revealButton?.addEventListener("click", () => {
  state = toggleReveal(state);
  render();
});
render();

const QUIZ_SIDES: QuizSide[] = ["left", "right"];

let quizState: QuizState = initialQuizState();

const quizZones: Record<QuizSide, HTMLButtonElement | null> = {
  left: document.querySelector('[data-testid="quiz-left"]'),
  right: document.querySelector('[data-testid="quiz-right"]'),
};
const quizResult = document.querySelector<HTMLElement>('[data-testid="quiz-result"]');

function renderQuiz() {
  for (const side of QUIZ_SIDES) {
    const zone = quizZones[side];
    if (!zone) continue;
    zone.style.backgroundColor = QUIZ_BACKGROUND[side];
    zone.setAttribute("aria-pressed", String(quizState.guess === side));
    const patch = zone.querySelector<HTMLElement>(".quiz-patch");
    if (patch) patch.style.backgroundColor = quizPatchColor(side);
  }

  if (quizResult) {
    quizResult.textContent = quizState.guess
      ? `You picked the ${quizState.guess} square. Both are exactly ${quizPatchColor(quizState.guess)} — only the background changed.`
      : "";
  }
}

for (const side of QUIZ_SIDES) {
  quizZones[side]?.addEventListener("click", () => {
    quizState = chooseGuess(quizState, side);
    renderQuiz();
  });
}
renderQuiz();

let dragState: DragState = initialDragState();

const dragSlider = document.querySelector<HTMLInputElement>('[data-testid="drag-slider"]');
const dragResult = document.querySelector<HTMLElement>('[data-testid="drag-result"]');

function renderDrag() {
  if (dragSlider) dragSlider.value = String(dragState.position);
  if (dragResult) {
    const side = sideFromPosition(dragState.position);
    dragResult.textContent =
      side === "middle" ? "" : `Now over the ${side === "left" ? "dark" : "light"} half — still exactly ${dragPatchColor()}.`;
  }
}

dragSlider?.addEventListener("input", () => {
  dragState = setPosition(dragState, Number(dragSlider.value));
  renderDrag();
});
renderDrag();

let wheelState: WheelState = initialWheelState();

const wheelDial = document.querySelector<HTMLElement>('[data-testid="wheel-dial"]');
const wheelHandle = document.querySelector<HTMLElement>('[data-testid="wheel-handle"]');
const wheelStage = document.querySelector<HTMLElement>('[data-testid="wheel-stage"]');
const wheelPatch = document.querySelector<HTMLElement>('[data-testid="wheel-patch"]');
const wheelSurroundSwatch = document.querySelector<HTMLElement>('[data-testid="wheel-surround-swatch"]');
const wheelSurroundValue = document.querySelector<HTMLElement>('[data-testid="wheel-surround-value"]');
const wheelComplementSwatch = document.querySelector<HTMLElement>('[data-testid="wheel-complement-swatch"]');
const wheelComplementValue = document.querySelector<HTMLElement>('[data-testid="wheel-complement-value"]');

function renderWheel() {
  const surround = surroundBackground(wheelState);
  wheelStage?.style.setProperty("background-color", surround);
  if (wheelPatch) wheelPatch.style.backgroundColor = wheelPatchColor();

  const rad = (wheelState.hue * Math.PI) / 180;
  const dialRadius = (wheelDial?.getBoundingClientRect().width ?? 0) / 2;
  if (wheelHandle) {
    wheelHandle.style.transform = `translate(-50%, -50%) translate(${Math.cos(rad) * dialRadius}px, ${Math.sin(rad) * dialRadius}px)`;
    wheelHandle.style.backgroundColor = surround;
    wheelHandle.setAttribute("aria-valuenow", String(Math.round(wheelState.hue)));
  }

  if (wheelSurroundSwatch) wheelSurroundSwatch.style.backgroundColor = surround;
  if (wheelSurroundValue) wheelSurroundValue.textContent = surroundRgb(wheelState);
  if (wheelComplementSwatch) wheelComplementSwatch.style.backgroundColor = complementarySwatch(wheelState);
  if (wheelComplementValue) wheelComplementValue.textContent = complementRgb(wheelState);
}

let draggingWheel = false;

function angleFromWheelEvent(event: PointerEvent): number | null {
  const rect = wheelDial?.getBoundingClientRect();
  if (!rect) return null;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return angleFromPointer(event.clientX - centerX, event.clientY - centerY);
}

wheelHandle?.addEventListener("pointerdown", (event) => {
  draggingWheel = true;
  wheelHandle.setPointerCapture(event.pointerId);
});

wheelHandle?.addEventListener("pointermove", (event) => {
  if (!draggingWheel) return;
  const angle = angleFromWheelEvent(event);
  if (angle === null) return;
  wheelState = setHue(wheelState, angle);
  renderWheel();
});

wheelHandle?.addEventListener("pointerup", () => {
  draggingWheel = false;
});

wheelHandle?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    wheelState = setHue(wheelState, wheelState.hue - 5);
    renderWheel();
    event.preventDefault();
  } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    wheelState = setHue(wheelState, wheelState.hue + 5);
    renderWheel();
    event.preventDefault();
  }
});

renderWheel();

const LIGHT_PRESETS: LightPreset[] = ["sunlight", "candlelight", "led"];
const LIGHT_PRESET_LABELS: Record<LightPreset, string> = {
  sunlight: "Sunlight",
  candlelight: "Candlelight",
  led: "LED",
};

let lightState: LightState = initialLightState();

const lightRing = document.querySelector<HTMLElement>('[data-testid="light-ring"]');
const lightHandle = document.querySelector<HTMLElement>('[data-testid="light-handle"]');
const appleEl = document.querySelector<HTMLElement>('[data-testid="apple"]');
const appleShadowEl = document.querySelector<HTMLElement>('[data-testid="apple-shadow"]');
const lightPresetsContainer = document.querySelector<HTMLElement>('[data-testid="light-presets"]');
const lightBaseSwatch = document.querySelector<HTMLElement>('[data-testid="light-base-swatch"]');
const lightBaseReadout = document.querySelector<HTMLElement>('[data-testid="light-base-readout"]');
const lightLiveSwatch = document.querySelector<HTMLElement>('[data-testid="light-live-swatch"]');
const lightLiveReadout = document.querySelector<HTMLElement>('[data-testid="light-live-readout"]');

function buildLightPresets() {
  if (!lightPresetsContainer) return;
  for (const preset of LIGHT_PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "light-preset";
    button.dataset.preset = preset;
    button.textContent = LIGHT_PRESET_LABELS[preset];
    button.addEventListener("click", () => {
      lightState = setPreset(lightState, preset);
      renderLight();
    });
    lightPresetsContainer.append(button);
  }
}

function renderLight() {
  const highlight = highlightColor(lightState);
  const shadow = shadowColor(lightState);
  const hOffset = highlightOffset(lightState);
  const sOffset = shadowOffset(lightState);

  appleEl?.style.setProperty("--highlight-color", highlight);
  appleEl?.style.setProperty("--highlight-x", `${hOffset.x}%`);
  appleEl?.style.setProperty("--highlight-y", `${hOffset.y}%`);

  appleShadowEl?.style.setProperty("--shadow-color", shadow);
  if (appleShadowEl) {
    appleShadowEl.style.transform = `translateX(-50%) translateX(${sOffset.x}%) scaleX(${sOffset.scale})`;
  }

  const rad = (lightState.angle * Math.PI) / 180;
  const ringRadius = (lightRing?.getBoundingClientRect().width ?? 0) / 2;
  if (lightHandle) {
    lightHandle.style.transform = `translate(-50%, -50%) translate(${Math.cos(rad) * ringRadius}px, ${Math.sin(rad) * ringRadius}px)`;
    lightHandle.setAttribute("aria-valuenow", String(Math.round(lightState.angle)));
  }

  if (lightBaseSwatch) lightBaseSwatch.style.backgroundColor = baseColor();
  if (lightBaseReadout) lightBaseReadout.textContent = baseColor();
  if (lightLiveSwatch) lightLiveSwatch.style.backgroundColor = highlight;
  if (lightLiveReadout) lightLiveReadout.textContent = highlight;

  for (const button of lightPresetsContainer?.querySelectorAll<HTMLButtonElement>(".light-preset") ??
    []) {
    button.setAttribute("aria-pressed", String(button.dataset.preset === lightState.preset));
  }
}

let draggingLight = false;

function angleFromEvent(event: PointerEvent): number | null {
  const rect = lightRing?.getBoundingClientRect();
  if (!rect) return null;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return angleFromPointer(event.clientX - centerX, event.clientY - centerY);
}

lightHandle?.addEventListener("pointerdown", (event) => {
  draggingLight = true;
  lightHandle.setPointerCapture(event.pointerId);
});

lightHandle?.addEventListener("pointermove", (event) => {
  if (!draggingLight) return;
  const angle = angleFromEvent(event);
  if (angle === null) return;
  lightState = setAngle(lightState, angle);
  renderLight();
});

lightHandle?.addEventListener("pointerup", () => {
  draggingLight = false;
});

lightHandle?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    lightState = setAngle(lightState, lightState.angle - 5);
    renderLight();
    event.preventDefault();
  } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    lightState = setAngle(lightState, lightState.angle + 5);
    renderLight();
    event.preventDefault();
  }
});

buildLightPresets();
renderLight();

const GLOW_PRESETS: Glow[] = ["candlelight", "led"];
const GLOW_LABELS: Record<Glow, string> = { candlelight: "Candlelight", led: "LED" };
// "LED" doesn't lowercase into a sentence the way "candlelight" does.
const GLOW_SENTENCE_CASE: Record<Glow, string> = { candlelight: "candlelight", led: "LED" };

let findState: FindAppleState = initialFindAppleState();

const findGlowContainer = document.querySelector<HTMLElement>('[data-testid="find-glow"]');
const findAppleEl = document.querySelector<HTMLElement>('[data-testid="find-apple"]');
const findAppleShadowEl = document.querySelector<HTMLElement>('[data-testid="find-apple-shadow"]');
const findSwatchesContainer = document.querySelector<HTMLElement>('[data-testid="find-swatches"]');
const findResult = document.querySelector<HTMLElement>('[data-testid="find-result"]');

// Fixed at FRONT_ANGLE (light.ts's strongest, most front-on position) so the
// tint reads as clearly as the preset allows -- this round has no drag
// control of its own, only the glow choice.
function findLightState(glow: Glow): LightState {
  return setAngle(setPreset(initialLightState(), glow), FRONT_ANGLE);
}

function buildGlowPresets() {
  if (!findGlowContainer) return;
  for (const glow of GLOW_PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "light-preset";
    button.dataset.glow = glow;
    button.textContent = GLOW_LABELS[glow];
    button.addEventListener("click", () => {
      findState = setGlow(findState, glow);
      buildGuessSwatches();
      renderFindApple();
    });
    findGlowContainer.append(button);
  }
}

// Rebuilt on every glow change -- the correct swatch sits at a different
// position per glow, so the set itself changes, not just which one is right.
function buildGuessSwatches() {
  if (!findSwatchesContainer) return;
  findSwatchesContainer.innerHTML = "";
  for (const color of guessSwatchesForGlow(findState.glow)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.backgroundColor = color;
    button.setAttribute("aria-label", `Guess ${color}`);
    button.dataset.color = color;
    button.addEventListener("click", () => {
      findState = chooseAppleGuess(findState, color);
      renderFindApple();
    });
    findSwatchesContainer.append(button);
  }
}

function renderFindApple() {
  const state = findLightState(findState.glow);
  const highlight = highlightColor(state);
  const shadow = shadowColor(state);
  const hOffset = highlightOffset(state);
  const sOffset = shadowOffset(state);

  findAppleEl?.style.setProperty("--highlight-color", highlight);
  findAppleEl?.style.setProperty("--highlight-x", `${hOffset.x}%`);
  findAppleEl?.style.setProperty("--highlight-y", `${hOffset.y}%`);
  findAppleShadowEl?.style.setProperty("--shadow-color", shadow);
  if (findAppleShadowEl) {
    findAppleShadowEl.style.transform = `translateX(-50%) translateX(${sOffset.x}%) scaleX(${sOffset.scale})`;
  }

  for (const button of findGlowContainer?.querySelectorAll<HTMLButtonElement>(".light-preset") ?? []) {
    button.setAttribute("aria-pressed", String(button.dataset.glow === findState.glow));
  }
  for (const button of findSwatchesContainer?.querySelectorAll<HTMLButtonElement>(".swatch") ?? []) {
    button.setAttribute("aria-pressed", String(button.dataset.color === findState.guess));
  }

  if (!findResult) {
    // no-op
  } else if (!findState.guess) {
    findResult.textContent = "";
  } else if (isCorrectGuess(findState)) {
    findResult.textContent = `Right — the apple is always ${baseColor()}. There isn't one colour reaching your eyes: it's light reflected off the apple, changed by the ${GLOW_SENTENCE_CASE[findState.glow]}, and interpreted by your visual system.`;
  } else {
    findResult.textContent = `The apple is always ${baseColor()}, not ${findState.guess}. Your eyes were looking at the light, not the apple — the ${GLOW_SENTENCE_CASE[findState.glow]} changed, never the apple.`;
  }
}

buildGlowPresets();
buildGuessSwatches();
renderFindApple();

let zoomState: ZoomState = initialZoomState();

const pixelsStage = document.querySelector<HTMLElement>('[data-testid="pixels-stage"]');
const pixelsSquare = document.querySelector<HTMLElement>('[data-testid="pixels-square"]');
const pixelsZoomSlider = document.querySelector<HTMLInputElement>('[data-testid="pixels-zoom"]');
const pixelsCallout = document.querySelector<HTMLElement>('[data-testid="pixels-callout"]');
const pixelsReadouts = document.querySelector<HTMLElement>('[data-testid="pixels-readouts"]');
const pixelsRedSwatch = document.querySelector<HTMLElement>('[data-testid="pixels-readout-red-swatch"]');
const pixelsRedValue = document.querySelector<HTMLElement>('[data-testid="pixels-readout-red-value"]');
const pixelsBlueSwatch = document.querySelector<HTMLElement>('[data-testid="pixels-readout-blue-swatch"]');
const pixelsBlueValue = document.querySelector<HTMLElement>('[data-testid="pixels-readout-blue-value"]');

function renderPixels() {
  pixelsSquare?.style.setProperty("--cell-size", `${cellSizeRem(zoomState.zoom)}rem`);

  const revealed = isRevealed(zoomState.zoom);
  pixelsStage?.classList.toggle("pixels-revealed", revealed);
  pixelsCallout?.setAttribute("aria-hidden", String(!revealed));
  pixelsReadouts?.setAttribute("aria-hidden", String(!revealed));
}

pixelsSquare?.style.setProperty("--subpixel-red", SUBPIXEL_RED);
pixelsSquare?.style.setProperty("--subpixel-blue", SUBPIXEL_BLUE);

if (pixelsRedSwatch) pixelsRedSwatch.style.backgroundColor = SUBPIXEL_RED;
if (pixelsRedValue) pixelsRedValue.textContent = SUBPIXEL_RED;
if (pixelsBlueSwatch) pixelsBlueSwatch.style.backgroundColor = SUBPIXEL_BLUE;
if (pixelsBlueValue) pixelsBlueValue.textContent = SUBPIXEL_BLUE;

pixelsZoomSlider?.addEventListener("input", () => {
  zoomState = setZoom(zoomState, Number(pixelsZoomSlider.value));
  renderPixels();
});

renderPixels();

let colorGuessState: ColorGuessState = initialColorGuessState();

const pixelsGuessSwatchesContainer = document.querySelector<HTMLElement>(
  '[data-testid="pixels-guess-swatches"]',
);
const pixelsGuessResult = document.querySelector<HTMLElement>('[data-testid="pixels-guess-result"]');

function buildPixelsGuessSwatches() {
  if (!pixelsGuessSwatchesContainer) return;
  for (const color of COLOR_GUESS_SWATCHES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.backgroundColor = color;
    button.setAttribute("aria-label", `Guess ${color}`);
    button.dataset.color = color;
    button.addEventListener("click", () => {
      colorGuessState = chooseColorGuess(color);
      renderPixelsGuess();
    });
    pixelsGuessSwatchesContainer.append(button);
  }
}

function renderPixelsGuess() {
  for (const button of pixelsGuessSwatchesContainer?.querySelectorAll<HTMLButtonElement>(".swatch") ?? []) {
    button.setAttribute("aria-pressed", String(button.dataset.color === colorGuessState.guess));
  }

  if (!pixelsGuessResult) return;
  if (!colorGuessState.guess) {
    pixelsGuessResult.textContent = "";
  } else if (isColorGuessCorrect(colorGuessState)) {
    pixelsGuessResult.textContent = "Yes — that's what you perceive. Keep zooming to see what's actually there.";
  } else {
    pixelsGuessResult.textContent = `Not quite — what you're perceiving is purple, not ${colorGuessState.guess}.`;
  }
}

buildPixelsGuessSwatches();
renderPixelsGuess();

let presetZoomState: ZoomState = initialZoomState();
let selectedPreset: PixelPreset = PIXEL_PRESETS[0];

const presetPixelsStage = document.querySelector<HTMLElement>('[data-testid="preset-pixels-stage"]');
const presetPixelsSquare = document.querySelector<HTMLElement>('[data-testid="preset-pixels-square"]');
const presetPixelsPresetsContainer = document.querySelector<HTMLElement>(
  '[data-testid="preset-pixels-presets"]',
);
const presetPixelsZoomSlider = document.querySelector<HTMLInputElement>('[data-testid="preset-pixels-zoom"]');
const presetPixelsCallout = document.querySelector<HTMLElement>('[data-testid="preset-pixels-callout"]');
const presetPixelsReadouts = document.querySelector<HTMLElement>('[data-testid="preset-pixels-readouts"]');
const presetPixelsSwatchA = document.querySelector<HTMLElement>('[data-testid="preset-pixels-readout-a-swatch"]');
const presetPixelsLabelA = document.querySelector<HTMLElement>('[data-testid="preset-pixels-readout-a-label"]');
const presetPixelsValueA = document.querySelector<HTMLElement>('[data-testid="preset-pixels-readout-a-value"]');
const presetPixelsSwatchB = document.querySelector<HTMLElement>('[data-testid="preset-pixels-readout-b-swatch"]');
const presetPixelsLabelB = document.querySelector<HTMLElement>('[data-testid="preset-pixels-readout-b-label"]');
const presetPixelsValueB = document.querySelector<HTMLElement>('[data-testid="preset-pixels-readout-b-value"]');

function buildPixelPresets() {
  if (!presetPixelsPresetsContainer) return;
  for (const preset of PIXEL_PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "light-preset";
    button.dataset.presetKey = preset.key;
    button.textContent = preset.label;
    button.addEventListener("click", () => {
      selectedPreset = preset;
      renderPixelPreset();
    });
    presetPixelsPresetsContainer.append(button);
  }
}

function renderPixelPreset() {
  const channels = hexToChannels(selectedPreset.color);
  const [a, b] = activeChannels(channels);
  const colorA = subpixelColor(channels, a);
  const colorB = subpixelColor(channels, b);

  presetPixelsSquare?.style.setProperty("--subpixel-red", colorA);
  presetPixelsSquare?.style.setProperty("--subpixel-blue", colorB);
  presetPixelsSquare?.style.setProperty("--cell-size", `${cellSizeRem(presetZoomState.zoom)}rem`);

  if (presetPixelsSwatchA) presetPixelsSwatchA.style.backgroundColor = colorA;
  if (presetPixelsLabelA) presetPixelsLabelA.textContent = CHANNEL_LABEL[a];
  if (presetPixelsValueA) presetPixelsValueA.textContent = colorA;
  if (presetPixelsSwatchB) presetPixelsSwatchB.style.backgroundColor = colorB;
  if (presetPixelsLabelB) presetPixelsLabelB.textContent = CHANNEL_LABEL[b];
  if (presetPixelsValueB) presetPixelsValueB.textContent = colorB;

  const revealed = isRevealed(presetZoomState.zoom);
  presetPixelsStage?.classList.toggle("pixels-revealed", revealed);
  presetPixelsCallout?.setAttribute("aria-hidden", String(!revealed));
  presetPixelsReadouts?.setAttribute("aria-hidden", String(!revealed));

  for (const button of presetPixelsPresetsContainer?.querySelectorAll<HTMLButtonElement>(".light-preset") ?? []) {
    button.setAttribute("aria-pressed", String(button.dataset.presetKey === selectedPreset.key));
  }
}

presetPixelsZoomSlider?.addEventListener("input", () => {
  presetZoomState = setZoom(presetZoomState, Number(presetPixelsZoomSlider.value));
  renderPixelPreset();
});

buildPixelPresets();
renderPixelPreset();

const bgSections = document.querySelectorAll<HTMLElement>("[data-bg-id]");
const bgLayers = document.querySelectorAll<HTMLElement>(".bg-layer");
const sectionRatios = new Map<string, number>();

function renderBackground() {
  const entries: SectionVisibility[] = [...sectionRatios].map(([id, ratio]) => ({ id, ratio }));
  const active = pickActiveSection(entries);
  for (const layer of bgLayers) {
    layer.classList.toggle("is-active", layer.dataset.bg === active);
  }
}

const bgObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const id = entry.target.getAttribute("data-bg-id");
      if (id) sectionRatios.set(id, entry.intersectionRatio);
    }
    renderBackground();
  },
  { threshold: [0, 0.25, 0.5, 0.75, 1] },
);

for (const section of bgSections) bgObserver.observe(section);

const clickableWords = document.querySelectorAll<HTMLButtonElement>(".word");
for (const word of clickableWords) {
  let accent: IntroAccent = null;
  word.addEventListener("click", () => {
    accent = nextIntroAccent(accent);
    word.classList.remove("is-red", "is-yellow");
    if (accent) word.classList.add(`is-${accent}`);
  });
}
