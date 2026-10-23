import type { ContentQuestion } from "@/lib/content/types"
import type { ContentDeck } from "@/lib/create-content-deck"
import type { Player } from "@/store/party-store"
import type { CasinoGame, CasinoGamePlayer } from "./types"

const DEFAULT_WINNING_SCORE = 10

/**
 * الفورة بتتظبط مرة واحدة عند بداية الجلسة:
 * - قيمة غير منتهية (NaN/Infinity) → الافتراضي 10.
 * - أي قيمة منتهية → عدد صحيح لا يقل عن 1.
 */
const normalizeWinningScore = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_WINNING_SCORE

  return Math.max(1, Math.floor(value))
}

export const createGame = (
  players: Player[],
  winningScore: number,
  deck: ContentDeck<ContentQuestion>
): CasinoGame => {
  return {
    phase: "game",
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      score: 0,
    })),
    winningScore: normalizeWinningScore(winningScore),
    currentQuestion: deck.next(),
    winner: null,
  }
}

export const nextQuestion = (
  game: CasinoGame,
  deck: ContentDeck<ContentQuestion>
): CasinoGame => {
  return {
    ...game,
    currentQuestion: deck.next(),
  }
}

export const changePlayerScore = (
  player: CasinoGamePlayer,
  action: "increase" | "decrease",
  game: CasinoGame
): CasinoGame | null => {
  const targetPlayer = game.players.find((p) => p.id === player.id)

  if (!targetPlayer) return null

  const newPlayers = game.players.map((p) =>
    p.id === player.id
      ? {
          ...p,
          score: p.score + (action === "increase" ? 1 : -1),
        }
      : p
  )

  const updatedPlayer = newPlayers.find((p) => p.id === player.id)!

  return {
    ...game,
    players: newPlayers,
    winner: updatedPlayer.score >= game.winningScore ? updatedPlayer : null,
    phase: updatedPlayer.score >= game.winningScore ? "finished" : "game",
  }
}

/**
 * قعدة جديدة بنفس الشلّة وبنفس ترتيبها وبنفس الفورة المظبوطة.
 * الـ deck نفسه بيكمّل من حيث ما وقف، زي سلوك اللعبة الحالي.
 */
export const restartGame = (
  game: CasinoGame,
  deck: ContentDeck<ContentQuestion>
): CasinoGame => {
  return {
    currentQuestion: deck.next(),
    phase: "game",
    players: game.players.map((player) => ({
      ...player,
      score: 0,
    })),
    winner: null,
    winningScore: game.winningScore,
  }
}
