"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import Qa3daCard from "@/components/ui/Qa3daCard"
import { createContentDeck } from "@/lib/create-content-deck"
import { useContentSet } from "@/lib/content/use-content-set"

const ChallengesSection = () => {
  // محتوى الجلسة ثابت: بنحلّ النسخة مرة واحدة والـ deck بيفضل عليها.
  const { snapshot, ready } = useContentSet("challenges")

  const [deck] = useState(() => createContentDeck([...snapshot.questions]))
  const activatedRef = useRef(snapshot.version)

  const [currentChallenge, setCurrentChallenge] = useState(() => deck.next())

  useEffect(() => {
    if (!ready) return
    if (activatedRef.current === snapshot.version) return

    activatedRef.current = snapshot.version
    deck.reset([...snapshot.questions])
    setCurrentChallenge(deck.next())
  }, [ready, snapshot, deck])

  const handleNext = () => {
    setCurrentChallenge(deck.next())
  }

  return (
    <section className="relative z-10 my-auto flex w-full max-w-md flex-col items-center pt-2">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-2xl font-bold text-ink-glow">أسئلة وتحديات</h2>
        <p className="text-sm font-medium text-ink-soft/80">
          &quot;جاهز تعمل حاجة محدش متوقعها؟&quot;
        </p>
      </div>

      {/* Dynamic Card Component */}
      <Qa3daCard
        id={currentChallenge.id}
        text={currentChallenge.text}
        category={currentChallenge.category}
        badgeLabel="CHALLENGE"
      />

      {/* Action Button */}
      <Button onClick={handleNext} className="group mt-8 w-full" size="lg">
        <span>تحدي تاني</span>
        <RefreshCw className="transition-transform duration-500 ease-out group-active:rotate-180" />
      </Button>
    </section>
  )
}

export default ChallengesSection
