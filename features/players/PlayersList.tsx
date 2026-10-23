import { Player } from "@/store/party-store"
import { Trash2 } from "lucide-react"

const PlayersList = ({
  players,
  removePlayer,
}: {
  players: Player[]
  removePlayer: (id: string) => void
}) => {
  return (
    <div className="flex flex-col gap-2">
      {players.map((player, index) => (
        <div
          key={player.id}
          className="group flex items-center gap-3 rounded-md border-2 border-ink bg-paper-warm px-4 py-3"
        >
          <span className="font-mono text-[10px] font-bold text-copper">
            {(index + 1).toString().padStart(2, "0")}
          </span>

          <span className="min-w-0 flex-1 truncate text-sm font-black">
            {player.name}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => removePlayer(player.id)}
              className="hover:text-danger flex size-8 items-center justify-center text-ink-soft/50 transition-colors"
              aria-label={`حذف ${player.name}`}
            >
              <Trash2 className="size-4.5 stroke-danger-brand" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlayersList
