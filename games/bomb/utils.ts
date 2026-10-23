import type { ContentQuestion } from "@/lib/content/types"
import {
  bombCategoryKeys,
  isBombCategory,
  maxSeconds,
  minSeconds,
} from "./constants"
import type {
  ActualBombCategory,
  BombGameCategories,
  BombQuestion,
} from "./types"

export const generateBombTimer = () => {
  const randomSeconds =
    Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds

  return randomSeconds
}

/**
 * بتحوّل محتوى القنبلة المتزامن (Neon/الكاش) لشكل محرك اللعبة.
 * أي فئة مش معروفة في محرك القنبلة بتتخطى بدل ما تسبب خطأ وقت اللعب.
 */
export function toBombQuestions(
  questions: readonly ContentQuestion[]
): BombQuestion[] {
  return questions.flatMap((question) => {
    if (!question.category || !isBombCategory(question.category)) return []
    return [
      {
        id: question.id,
        category: question.category,
        text: question.text,
      },
    ]
  })
}

/**
 * عشوائي بين الفئات اللي عندها أسئلة فعلًا؛ لو مفيش أسئلة خالص بنرجع
 * فئة عادية والمحرك بيوقف المحاولة على أي حال.
 */
export const getRandomCategory = (
  questions: readonly BombQuestion[]
): ActualBombCategory => {
  const available = bombCategoryKeys.filter((key) =>
    questions.some((question) => question.category === key)
  )
  const pool = available.length > 0 ? available : bombCategoryKeys

  return pool[Math.floor(Math.random() * pool.length)]
}

export function getRandomQuestion(
  category: keyof BombGameCategories,
  questions: readonly BombQuestion[]
) {
  const pool =
    category === "RANDOM"
      ? questions
      : questions.filter((question) => question.category === category)

  if (pool.length === 0) return null

  return pool[Math.floor(Math.random() * pool.length)]
}
