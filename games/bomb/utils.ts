import { bombQuestions } from "@/contents/bomb"
import { bombCategoryKeys, maxSeconds, minSeconds } from "./constants"
import { BombGameCategories } from "./types"

export const generateBombTimer = () => {
  const randomSeconds =
    Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds
  
  return randomSeconds
}

export const getRandomCategory = () => {
  return bombCategoryKeys[Math.floor(Math.random() * bombCategoryKeys.length)]
}

export function getRandomQuestion(category: keyof BombGameCategories) {
  const questions =
    category === "RANDOM"
      ? bombQuestions
      : bombQuestions.filter((question) => question.category === category)

  if (questions.length === 0) {
    return null
  }

  return questions[Math.floor(Math.random() * questions.length)]
}
