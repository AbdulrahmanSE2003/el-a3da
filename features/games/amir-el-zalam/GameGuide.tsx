// components/modals/game-guide-modal.tsx
"use client"

import { AppDialog } from "@/components/ui/AppDialog"
import GenericGuide from "@/components/ui/GenericGuide"
import { AmirElzalamGuide } from "@/lib/Guides"
import { BookOpen, Info } from "lucide-react"

export function GameGuideModal() {
  return (
    <GenericGuide
      title="أمير الظلام"
      subtitle="لعبة خداع، شك، وتحليل... وكل واحد عنده دور مخبيّه."
    >
      <AmirElzalamGuide />
    </GenericGuide>
  )
}
