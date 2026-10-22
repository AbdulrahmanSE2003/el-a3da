export { cn } from "cn"

import { labelColor } from "@/lib/constants"

export type ChangelogLabelKey = keyof typeof labelColor

export const LABEL_ARABIC_MAP: Record<string, string> = {
  feat: "ميزة",
  fix: "إصلاح",
  chore: "تحسينات",
  refactor: "هيكلة",
  docs: "توثيق",
  style: "المظهر",
  perf: "الأداء",
  test: "اختبارات",
}

export function getArabicLabel(label: ChangelogLabelKey): string {
  return LABEL_ARABIC_MAP[label] ?? label
}
