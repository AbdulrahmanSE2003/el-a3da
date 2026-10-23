import type { ContentQuestion } from "@/lib/content/types"
import type {
  ActualBombCategory,
  BombGameCategories,
  BombGameState,
  BombQuestion,
} from "./types"
import {
  generateBombTimer,
  getRandomCategory,
  getRandomQuestion,
  toBombQuestions,
} from "./utils"

export const createBombGame = (
  question: BombQuestion,
  category: ActualBombCategory
): BombGameState => {
  return {
    timer: generateBombTimer(),
    phase: "playing",
    category,
    question,
  }
}

/**
 * بتختار سؤالًا من snapshot المحتوى اللي الجلسة بدأت بيه. المحتوى نفسه
 * immutable، فمزامنة الخلفية مش بتغيّر الدوران الحالي.
 */
export const setCategory = (
  selectedCategory: keyof BombGameCategories,
  content: readonly ContentQuestion[]
) => {
  const questions = toBombQuestions(content)
  if (questions.length === 0) return null

  const category: ActualBombCategory =
    selectedCategory === "RANDOM"
      ? getRandomCategory(questions)
      : selectedCategory

  const question = getRandomQuestion(category, questions)
  if (!question) return null

  return createBombGame(question, category)
}
