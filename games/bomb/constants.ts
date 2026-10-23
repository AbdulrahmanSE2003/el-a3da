import { ActualBombCategory } from "./types"

export const minSeconds = 45
export const maxSeconds = 85

export const countDownTimer = 5

export const bombCategories = {
  SPORT: { name: "رياضة", emoji: "⚽" },
  FOOD: { name: "أكل", emoji: "🍔" },
  MOVIES_AND_SERIES: { name: "أفلام ومسلسلات", emoji: "🎬" },
  COUNTRIES_AND_CITIES: { name: "بلاد ومدن", emoji: "🌍" },
  SONGS: { name: "أغاني", emoji: "🎵" },
  NATURE: { name: "طبيعة", emoji: "🌿" },
  HISTORY: { name: "تاريخ", emoji: "📜" },
  TECH: { name: "تكنولوجيا", emoji: "💻" },
  GENERAL: { name: "معلومات عامة", emoji: "💡" },
} as const satisfies Record<ActualBombCategory, { name: string; emoji: string }>

export const bombCategoryKeys = Object.keys(
  bombCategories
) as ActualBombCategory[]
