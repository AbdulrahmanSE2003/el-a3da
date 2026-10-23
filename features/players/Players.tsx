"use client"

import { useState } from "react"
import { Plus, Trash2, Users } from "lucide-react"

import { usePartyStore } from "@/store/party-store"
import EmptyQa3da from "@/features/players/EmptyQa3da"
import PlayersActions from "@/features/players/PlayersActions"
import PlayersList from "./PlayersList"

const Players = ({ redirect }: { redirect: string }) => {
  const { players, addPlayer, removePlayer, clearPlayers } = usePartyStore()

  const [name, setName] = useState("")

  const handleSubmit = () => {
    const trimmedName = name.trim()

    if (!trimmedName) return
    addPlayer(trimmedName)

    setName("")
  }
  return (
    <div>
      <section className="mt-7 rounded-md border-2 border-ink bg-paper-warm p-4 shadow-[4px_4px_0_var(--color-ink)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold tracking-widest text-copper">
            زود لعيب جديد
          </span>

          <Users className="size-4 text-ink-soft/50" />
        </div>

        <div className="flex gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit()
            }}
            placeholder="اكتب اسم اللعيب هنا.."
            className="min-w-0 flex-1 rounded-md border-2 border-ink bg-paper px-3 py-3 text-sm font-bold outline-none placeholder:text-ink-soft/40 focus:border-copper"
            autoComplete="off"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex size-12 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-copper text-paper shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-ink)] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </section>

      {/* Players */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-ink-soft/50">
            الشلة اللي في الجيم ({players.length} لعيبة) ⚡{" "}
          </span>
        </div>

        {players.length === 0 ? (
          <EmptyQa3da />
        ) : (
          <PlayersList players={players} removePlayer={removePlayer} />
        )}
      </section>

      {/* Actions */}
      {players.length > 0 && (
        <PlayersActions clearPlayers={clearPlayers} href={redirect} />
      )}
    </div>
  )
}

export default Players
