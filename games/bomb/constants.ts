import { BombGameCategories } from "./types"

export const minSeconds = 30
export const maxSeconds = 60

export const countDownTimer = 5

export const bombCategoryKeys = [
  "GENERAL",
  "SPORT",
  "FOOD",
  "MOVIES_AND_SERIES",
  "COUNTRIES_AND_CITIES",
  "SONGS",
  "NATURE",
  "HISTORY",
  "TECH",
] as const satisfies readonly (keyof BombGameCategories)[]
