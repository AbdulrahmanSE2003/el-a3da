"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { usePartyStore } from "@/store/party-store"
import { createContentDeck } from "@/lib/create-content-deck"
import { useContentSet } from "@/lib/content/use-content-set"

export type SheikhPhase = "idle" | "revealed" | "questions"

export function useSheikh() {
  const router = useRouter()
  const players = usePartyStore((state) => state.players)

  // محتوى الجلسة: بنحلّه مرة واحدة ونفضل عليه طول الجلسة. أي مزامنة في
  // الخلفية بتحصل بعد كده مش بتلمسه.
  const { snapshot, ready } = useContentSet("sheikh")

  const [deck] = useState(() => createContentDeck([...snapshot.questions]))
  const activatedRef = useRef(snapshot.version)

  const [phase, setPhase] = useState<SheikhPhase>("idle")
  const [sheikhId, setSheikhId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(() => deck.next())

  // لو كاش المحلي إدّانا نسخة مختلفة عن البندل، بنبدّل الم deck مرة واحدة
  // بس قبل ما الجلسة تبدأ فعليًا.
  useEffect(() => {
    if (!ready) return
    if (activatedRef.current === snapshot.version) return

    activatedRef.current = snapshot.version
    deck.reset([...snapshot.questions])
    setCurrentQuestion(deck.next())
  }, [ready, snapshot, deck])

  useEffect(() => {
    if (players.length === 0) {
      router.replace("/players?redirect=/sheikh")
    }
  }, [players.length, router])

  const sheikh = players.find((player) => player.id === sheikhId)

  const chooseSheikh = () => {
    if (players.length === 0) return
    const randomIndex = Math.floor(Math.random() * players.length)
    setSheikhId(players[randomIndex].id)
    setPhase("revealed")
  }

  const startQuestions = () => {
    setCurrentQuestion(deck.next())
    setPhase("questions")
  }

  const nextQuestion = () => {
    setCurrentQuestion(deck.next())
  }

  const reset = () => {
    setSheikhId(null)
    deck.reset()
    setCurrentQuestion(deck.next())
    setPhase("idle")
  }

  return {
    players,
    sheikh,
    phase,
    currentQuestion,
    chooseSheikh,
    startQuestions,
    nextQuestion,
    reset,
  }
}
