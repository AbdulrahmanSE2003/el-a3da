"use client"

import { cn } from "cn"
import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import walking from "@/public/characters/abo_omar_walk.gif"
import flex from "@/public/characters/abo_omar_flex.gif"
import joke from "@/public/characters/abo_omar_joke.gif"
import lead from "@/public/characters/abo_omar_lead.gif"
import rest from "@/public/characters/abo_omar_rest.gif"

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface AbuOmarProps {
  duration?: number
}

type Pose = "leading" | "flexing" | "joking" | "resting"

type AbuOmarState =
  | { type: "walking" }
  | { type: "pose"; pose: Pose; message: string }
  | { type: "exiting"; message: string }
  | { type: "waiting" }

// -----------------------------------------------------------------------------
// Dialogue
// -----------------------------------------------------------------------------

const exitingMessages = [
  "طب استأذن أنا 🤙",
  "أيوووا مين بينده؟",
  "يلا سلام ✌️",
  "يلا باي 👋",
  "أوروفوار من غير سلام 🤙",
  "يا أم السعد، اعدلي أم الحصان",
  "طب أروح ألحق العصر أنا بقى",
  "أي حد يسأل عليا، أنا عند نقطة الصفر",
  "كانت قعدة حلوة والله، بس ورايا مشوار",
]

const messagesByPose: Record<Pose, string[]> = {
  resting: [
    "هييييييح يا ولي النعم",
    "إيه يا شباب الكلام على إيه بقى؟ لعبوني معاكم",
    "إيه الدنيا، شاي برضو يا عالم يا بخيلة",
    "آه يا عضمك يا رضا",
    "على رأي المثل، فخامتي عالكل تصب في الليستة Baby I'm top",
    "وسعوا كده للباشا",
    "أنا محتاج أريح حبة، لو مش هيضايق سعادتكم يعني",
  ],

  joking: [
    "بيقولك مرة حبة شباب زي الورد مبيطلبوش غير شاي بس، تشربوا إيه بقى يا غوالي",
    "عارف نكتة تؤ وأخوه تؤتؤ، مسيرك تعرفها",
    "عارف نكتة وادي النطرون؟ طب حلو أحسنلك متعرفهاش",
    "أنا عندي نكتة بس مش أي حد هيفهمها",
    "آهاا فينك يا أم عمر",
    "ولو ناسياني ميضرش، أنا حالي ميسرش عدو ولا حبيب",
    "هو إحنا هنفضل ساكتين كده؟ صوتوا ولا اعملوا حاجة",
    "مصر ترارارا مصر ترارارا",
  ],

  flexing: [
    "بصوا بس على الفخامة",
    "واحد واحد يا جماعة، مش كلكم مرة واحدة",
    "إدي جامد، عشان جامد مخدش",
    "هو أنتم شايفني متكبر يا جدعان؟ طب البسوا نضارة",
    "مين قدي؟ محدش؟ تمام",
    "الهيبة مش محتاجة كلام",
    "خدوا بالكم من الوقفة دي",
    "يا أرض اتهدي، ما عليكي قدي",
    "أوبا، تعرف تعمل كده؟",
    "أوعااا وشكواحد",
    "يا شيخ الحارة تقدر تسوي كذا؟",
    "أوديكي فين يا صحة",
    "أوديكي فين يا جمودية",
  ],

  leading: [
    "ركزوا معايا يا شباب، مركزين؟ طيب سلام",
    "اسمعوا يا ابني النصيحة دي من كبير القعدة، أبويا زمان قالي يا أبو عمر يا ابني...",
    "طب بصوا، أنا عندي اقتراح، بس هخليه لنفسي",
    "محدش يتحرك غير لما أقول",
    "الحساب يا رجالة عشان بنقفل",
    "أنا هقول كلمة واحدة بس، أبو عمر التوب",
  ],
}

// -----------------------------------------------------------------------------
// Character assets
// -----------------------------------------------------------------------------

const stateImages = {
  walking,
  leading: lead,
  flexing: flex,
  joking: joke,
  resting: rest,
}

const poses: Pose[] = ["leading", "flexing", "joking", "resting"]

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function AbuOmar({ duration = 7000 }: AbuOmarProps) {
  const [state, setState] = useState<AbuOmarState>({
    type: "walking",
  })

  const poseQueue = useRef<Pose[]>([])

  // Get the next pose without repeating until all poses have appeared.
  const getNextPose = (): Pose => {
    if (poseQueue.current.length === 0) {
      poseQueue.current = shuffle(poses)
    }

    return poseQueue.current.pop()!
  }

  // Select the pose and its dialogue atomically.
  const startRandomPose = () => {
    const nextPose = getNextPose()

    setState({
      type: "pose",
      pose: nextPose,
      message: randomItem(messagesByPose[nextPose]),
    })
  }

  // Keep the selected pose visible for the configured duration.
  useEffect(() => {
    if (state.type !== "pose") return

    const timeout = window.setTimeout(() => {
      setState({
        type: "exiting",
        message: randomItem(exitingMessages),
      })
    }, duration)

    return () => window.clearTimeout(timeout)
  }, [state, duration])

  // Wait 5–12 seconds before entering again.
  useEffect(() => {
    if (state.type !== "waiting") return

    const delay = Math.floor(Math.random() * 7000) + 5000

    const timeout = window.setTimeout(() => {
      setState({ type: "walking" })
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [state.type])

  // Handle entrance and exit movement completion only.
  const handleAnimationComplete = () => {
    if (state.type === "walking") {
      startRandomPose()
      return
    }

    if (state.type === "exiting") {
      setState({ type: "waiting" })
    }
  }

  // Derive the image and dialogue from the same state.
  const currentImage = state.type === "pose" ? stateImages[state.pose] : walking

  const currentMessage =
    state.type === "pose" || state.type === "exiting" ? state.message : ""

  const isExiting = state.type === "exiting"
  const isWaiting = state.type === "waiting"

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      initial={{ x: "-150%" }}
      animate={{
        x: isExiting || isWaiting ? "-150%" : 0,
      }}
      transition={{
        duration: 6,
        ease: "linear",
      }}
      onAnimationComplete={handleAnimationComplete}
      className={cn(
        "pointer-events-none fixed bottom-12 left-4 z-50 flex h-32 w-36 flex-col items-center"
      )}
    >
      {/* Dialogue bubble */}
      {currentMessage && !isWaiting && (
        <motion.div
          key={currentMessage}
          initial={{ opacity: 0, scale: 0.6, y: 12, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: -2 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 18,
          }}
          className="absolute bottom-[calc(100%-8px)] left-1/2 z-10 w-max max-w-64 -translate-x-1/2"
        >
          <div className="relative max-w-[20ch] rounded-2xl border-[2.5px] border-copper bg-background p-2.5 text-center text-sm leading-relaxed font-black text-copper shadow-[3px_4px_0px_#33271f]">
            {currentMessage}

            <span className="absolute -bottom-2.25 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-r-[2.5px] border-b-[2.5px] border-copper bg-background" />
          </div>
        </motion.div>
      )}

      {/* Character */}
      <Image
        src={currentImage}
        width={144}
        height={100}
        alt="Abu Omar"
        unoptimized
        className={cn(
          "h-full w-full object-contain object-bottom",
          isExiting && "scale-x-[-1]"
        )}
      />
    </motion.div>
  )
}
