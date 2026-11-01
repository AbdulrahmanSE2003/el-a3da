"use client"

import { useSearchParams } from "next/navigation"
import Players from "@/features/players/Players"

export default function PlayersPageClient() {
  const searchParams = useSearchParams()

  const redirect = searchParams.get("redirect") || "/"

  return (
    <div className={``}>
      <Players redirect={redirect} />
    </div>
  )
}
