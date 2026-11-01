"use client"

import { useState } from "react"
import { Button } from "./button"
import { Player } from "@/store/party-store"

type SpinnerProps = {
  width?: number
  height?: number
  items: string[]
  onChooseSheikh: (p?: Player) => void
}

const COLORS = [
  "var(--primary)",
  "#ef4444",
  "#42ec6e",
  "var(--danger-brand)",
  "#eab308",
  "var(--steam)",
  "var(--card)",
]

const Spinner = ({
  width = 300,
  height = 300,
  items,
  onChooseSheikh,
}: SpinnerProps) => {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  if (items.length === 0) return null

  const segmentAngle = 360 / items.length

  const gradients = items
    .map((_, index) => {
      const start = index * segmentAngle
      const end = start + segmentAngle
      const color = COLORS[index % COLORS.length]

      return `${color} ${start}deg ${end}deg`
    })
    .join(", ")

  const labels = items.map((item, index) => {
    const angle = index * segmentAngle + segmentAngle / 2
    const radians = (angle * Math.PI) / 180
    const radius = 35

    return {
      item,
      x: 50 + radius * Math.sin(radians),
      y: 50 - radius * Math.cos(radians),
    }
  })

  const spin = () => {
    if (isSpinning) return

    const randomIndex = Math.floor(Math.random() * items.length)
    const targetAngle = randomIndex * segmentAngle + segmentAngle / 2

    const targetRotation = (360 - targetAngle) % 360

    setWinner(items[randomIndex])
    setSelectedItem(null)
    setIsSpinning(true)

    setRotation((current) => {
      const extraRotation = (targetRotation - (current % 360) + 360) % 360

      return current + 5 * 360 + extraRotation
    })
  }

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (
      event.propertyName !== "transform" ||
      event.target !== event.currentTarget
    ) {
      return
    }

    setSelectedItem(winner)
    setIsSpinning(false)
    if (!winner) return
    // TODO
    // const player =

    // // onChooseSheikh(winner)
  }

  return (
    <div className={`flex flex-col gap-8`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width, height }}
      >
        {/* Fixed Pointer */}
        <div
          className="absolute top-0 left-1/2 z-30 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "24px solid var(--foreground)",
          }}
        />

        {/* Rotating Wheel */}
        <div
          className="relative h-full w-full rounded-full border-4 border-border shadow-xl"
          style={{
            background: `conic-gradient(${gradients})`,
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? "transform 5s cubic-bezier(0.15, 0, 0.15, 1)"
              : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* Labels */}
          {labels.map(({ item, x, y }, index) => (
            <span
              key={`${item}-${index}`}
              className="absolute text-center text-sm font-semibold"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                maxWidth: "25%",
              }}
            >
              <span
                className="block"
                style={{
                  transform: `rotate(${-rotation}deg)`,
                  overflowWrap: "anywhere",
                }}
              >
                {item}
              </span>
            </span>
          ))}
        </div>

        {/* Fixed Center Hub */}
        <div className="absolute top-1/2 left-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-border bg-background shadow-lg">
          <button
            type="button"
            onClick={spin}
            disabled={isSpinning}
            className="h-full w-full rounded-full p-2 text-xs font-bold transition hover:bg-accent disabled:cursor-not-allowed"
          >
            {isSpinning ? "" : (selectedItem ?? "SPIN")}
          </button>
        </div>
      </div>
      <Button onClick={spin}>لف العجلة</Button>
    </div>
  )
}

export default Spinner
