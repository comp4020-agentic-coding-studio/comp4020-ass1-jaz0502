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
