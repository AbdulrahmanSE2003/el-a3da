import Link from "next/link"
import { ArrowUpLeft, Lock, Sparkles } from "lucide-react"
import { GameItem } from "../data/games"
import { gameThemes } from "../lib/gameTheme"

interface GameCardProps {
  game: GameItem
}

export function GameCard({ game }: GameCardProps) {
  const t = gameThemes[game.theme]
  const Icon = game.icon
  const isAvailable = game.status === "متاحة"

  const CardContent = (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-md border-2 p-5 transition-all duration-200 ${t.card} ${
        isAvailable
          ? `cursor-pointer hover:-translate-x-1 hover:-translate-y-1 ${t.hoverShadow}`
          : "cursor-not-allowed opacity-80"
      } ${
        game.isRecommended
          ? "ring-2 ring-copper/80 ring-offset-2 ring-offset-paper"
          : ""
      }`}
    >
      {/* Recommended Badge */}
      {game.isRecommended && (
        <div className="absolute top-0 right-0 z-20 flex items-center gap-1 rounded-bl-lg bg-copper px-3 py-1 text-[10px] font-black text-paper shadow-sm">
          <Sparkles className="size-3 fill-current" />
          <span>ترشيح القعدة</span>
        </div>
      )}

      {/* Large Background Icon */}
      <div className="pointer-events-none absolute -top-5 -left-5 opacity-25 transition-transform duration-300 group-hover:scale-110">
        <Icon className={`size-40 ${t.iconBg}`} strokeWidth={1} />
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="h-6 pt-1">
          {!isAvailable && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${t.badge}`}
            >
              {game.status}
            </span>
          )}
        </div>

        {/* Icon Container */}
        <div
          className={`flex size-11 items-center justify-center border-2 p-2 shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-transform group-hover:rotate-6 ${t.iconBox}`}
        >
          <Icon className="size-6" strokeWidth={2} />
        </div>
      </div>

      {/* Body Section */}
      <div className="relative z-10 mt-8">
        <h3
          className={`text-2xl font-black tracking-tight transition-colors ${t.title}`}
        >
          {game.title}
        </h3>

        <p
          className={`mt-2 text-xs leading-relaxed font-semibold ${t.description}`}
        >
          {game.description}
        </p>

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-end">
          <div
            className={`flex size-9 items-center justify-center rounded-none border transition-all ${
              isAvailable
                ? `${t.actionBtn} group-hover:-translate-x-0.5 group-hover:-translate-y-0.5`
                : "border-zinc-800 bg-zinc-900 text-zinc-600"
            }`}
          >
            {isAvailable ? (
              <ArrowUpLeft className="size-4 stroke-[2.5]" />
            ) : (
              <Lock className="size-3.5" />
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (isAvailable && game.href) {
    return <Link href={game.href}>{CardContent}</Link>
  }

  return CardContent
}
