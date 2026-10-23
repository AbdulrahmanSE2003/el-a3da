import type { ContentQuestion } from "@/lib/content/types"

export type CasinoGameState = "setup" | "game" | "finished"

export interface CasinoGamePlayer {
  id: string
  name: string
  score: number
}

export interface CasinoGame {
  phase: CasinoGameState
  players: CasinoGamePlayer[]
  winner: CasinoGamePlayer | null
  currentQuestion: ContentQuestion | null
  winningScore: number
}
