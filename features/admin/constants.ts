import type { ContentSetId } from "./lib/types"

/**
 * ألوان المجموعات المعروفة. المجموعات الجديدة بتاخد لونًا محايدًا لحد ما
 * يتضاف لونها هنا؛ الغياب مش خطأ ومش بيكسر الداشبورد.
 */
export const SET_COLORS: Record<string, string> = {
  casino: "var(--color-copper)",
  bomb: "#E85D04",
  topics: "var(--color-ink)",
  challenges: "var(--color-danger-brand)",
  sheikh: "var(--color-ink-glow)",
  zad: "var(--color-steam)",
  punishments: "#6B5A3E",
}

export function getSetColor(id: ContentSetId): string {
  return SET_COLORS[id] ?? "var(--color-ink-soft)"
}
