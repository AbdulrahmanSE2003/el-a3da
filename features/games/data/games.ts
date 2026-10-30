import { Bomb, Dices, Ghost, Glasses, LucideIcon } from "lucide-react"
import { GameTheme } from "../lib/gameTheme"

export interface GameItem {
  id: string
  title: string
  description: string
  status: "متاحة" | "لسه عالرمالة⏳"
  icon: LucideIcon
  href?: string
  theme: GameTheme
  isRecommended?: boolean
  isNew?: boolean
}

export const GAMES_LIST: GameItem[] = [
  {
    id: "casino",
    title: "كافيه الألعاب",
    description: "تحدي معلومات وعصر دماغ.. مين فيكم هيقفل اللعبة؟ 💡",
    status: "متاحة",
    icon: Dices,
    isRecommended: true,
    href: "/games/casino",
    theme: "nordic",
  },
  {
    id: "bomb",
    title: "قنبلة",
    description:
      "جاوب بسرعة وسلّم الموبايل للي بعدك قبل ما القنبلة تفرقع في وشك! 💣🔥",
    status: "متاحة",
    icon: Bomb,
    href: "/games/bomb",
    theme: "sunset",
    isNew: true,
  },
  {
    id: "amir-el-zalam",
    title: "أمير الظلام",
    description: "مين الذكي اللي هيقفش المافيا قبل ما يدوّخوا القعدة؟ 🕵️‍♂️",
    status: "متاحة",
    icon: Ghost,
    href: "/games/amir-el-zalam",
    theme: "dark",
  },
  {
    id: "bekasa",
    title: "بكاسة",
    description: "لعبة جديدة بتستوي ونازلة تظبط الكلام قريب! 🎯",
    status: "لسه عالرمالة⏳",
    icon: Glasses,
    theme: "copper",
  },
]
