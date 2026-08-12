// Which top-level section the fixed background layer should match, kept as a
// plain function so the "most visible wins" rule is testable without a real
// IntersectionObserver.

export interface SectionVisibility {
  id: string;
  ratio: number;
}

export function pickActiveSection(entries: SectionVisibility[]): string | null {
  let best: SectionVisibility | null = null;
  for (const entry of entries) {
    if (entry.ratio <= 0) continue;
    if (!best || entry.ratio > best.ratio) best = entry;
  }
  return best ? best.id : null;
}
