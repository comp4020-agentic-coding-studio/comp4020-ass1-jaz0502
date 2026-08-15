import {
  HUES,
  initialState,
  patchColor,
  setZoneHue,
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
import {
  angleFromPointer,
  baseColor,
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

const HUE_NAMES: Record<number, string> = {
  0: "Red",
  60: "Yellow",
  120: "Green",
  180: "Cyan",
  240: "Blue",
  300: "Magenta",
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
  for (const hue of HUES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.backgroundColor = `hsl(${hue}, 82%, 40%)`;
    button.setAttribute("aria-label", HUE_NAMES[hue] ?? `Hue ${hue}`);
    button.dataset.hue = String(hue);
    button.addEventListener("click", () => {
      state = setZoneHue(state, zone, hue);
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

    const activeHue = zone === "a" ? state.zoneA : state.zoneB;
    for (const button of swatchContainer(zone)?.querySelectorAll<HTMLButtonElement>(".swatch") ??
      []) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.hue) === activeHue));
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
    const half = side === "left" ? "dark" : "light";
    dragResult.textContent = `Now over the ${half} half — still exactly ${dragPatchColor()}.`;
  }
}

dragSlider?.addEventListener("input", () => {
  dragState = setPosition(dragState, Number(dragSlider.value));
  renderDrag();
});
renderDrag();

const LIGHT_PRESETS: LightPreset[] = ["neutral", "warm", "cool"];
const LIGHT_PRESET_LABELS: Record<LightPreset, string> = {
  neutral: "Neutral",
  warm: "Warm",
  cool: "Cool",
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
