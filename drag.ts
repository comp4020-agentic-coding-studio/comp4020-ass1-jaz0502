// Round three: the same claim, now under the visitor's own hand. Dragging the
// patch across the boundary only ever changes its position -- the colour
// value never moves, which is the whole point of letting them do it.

export const DRAG_PATCH_COLOR = "#6157ac";
export const DRAG_BACKGROUND = {
  left: "#4334bb",
  right: "#c7c2ef",
} as const;

export interface DragState {
  position: number;
}

export function initialDragState(): DragState {
  return { position: 50 };
}

export function clampPosition(position: number): number {
  return Math.min(100, Math.max(0, position));
}

export function setPosition(state: DragState, position: number): DragState {
  return { ...state, position: clampPosition(position) };
}

export function dragPatchColor(): string {
  return DRAG_PATCH_COLOR;
}

export type DragSide = "left" | "right" | "middle";

export function sideFromPosition(position: number): DragSide {
  if (position < 50) return "left";
  if (position > 50) return "right";
  return "middle";
}
