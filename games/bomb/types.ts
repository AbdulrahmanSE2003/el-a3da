export type BombGamePhase = "setup" | "playing" | "explosion"

export type BombGameCategories = {
  GENERAL: "عام"
  SPORT: "رياضة"
  FOOD: "أكل"
  RANDOM: "عشوائي"
  MOVIES_AND_SERIES: "أفلام ومسلسلات"
  COUNTRIES_AND_CITIES: "بلاد ومدن"
  SONGS: "أغاني"
  NATURE: "طبيعة"
  HISTORY: "تاريخ"
  TECH: "تكنولوجيا"
}

export type BombGameState = {
  phase: BombGamePhase
  category: ActualBombCategory
  timer: number
  question: BombQuestion
}
export type BombCategoryKey = keyof BombGameCategories

export type ActualBombCategory = Exclude<BombCategoryKey, "RANDOM">

export type BombQuestion = {
  id: string
  category: ActualBombCategory
  text: string
}
