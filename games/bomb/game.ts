import { ActualBombCategory, BombGameCategories, BombGameState } from "./types"
import {
  generateBombTimer,
  getRandomCategory,
  getRandomQuestion,
} from "./utils"
import { BombQuestion } from "./types"

export const createBombGame = (
  question: BombQuestion,
  category: ActualBombCategory
): BombGameState => {
  return {
    timer: generateBombTimer(),
    phase: "playing",
    category: category,
    question: question,
  }
}

export const setCategory = (selectedCategory: keyof BombGameCategories) => {
  const category: ActualBombCategory =
    selectedCategory === "RANDOM" ? getRandomCategory() : selectedCategory

  const question = getRandomQuestion(category)

  if (!question) return null

  createBombGame(question, category)
}
