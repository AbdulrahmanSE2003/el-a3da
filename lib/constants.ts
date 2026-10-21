import Link from "next/link"
import {
  CircleQuestionMark,
  Gamepad2,
  MessageCircle,
  PlantPot,
  Zap,
} from "lucide-react"
import { ActivityCardItem } from "@/components/layout/ActivityCard"

export const activities: ActivityCardItem[] = [
  {
    number: "01",
    stamp: "TOPICS",
    title: "مواضيع وحوارات",
    description: "سؤال يفتح الكلام... والباقي على القعدة.",
    href: "/topics",
    icon: MessageCircle,
  },
  {
    number: "02",
    stamp: "CHALLENGE",
    title: "تحديات",
    description: "الدور على مين؟",
    href: "/challenges",
    icon: Zap,
  },
  {
    number: "03",
    stamp: "QUESTIONS",
    title: "شيخ الحارة",
    description: "جاهز للإستجواب؟",
    href: "/sheikh",
    icon: CircleQuestionMark,
  },
  {
    number: "04",
    stamp: "ZAD",
    title: "زاد القعدة",
    description: "خواطر إيمانية، أذكار، ونقاط تُصلِح القلوب وتجمعنا على خير.",
    href: "/zad",
    icon: PlantPot,
    className: "col-span-2 border-2 border-copper/40 shadow-copper/40",
  },
  {
    number: "05",
    stamp: "GAMES",
    title: "ألعاب",
    description: "هنا القعدة هتبدأ بجد.",
    href: "/games",
    icon: Gamepad2,
    className: "col-span-2",
  },
]

export const updates = [
  {
    version: "1.4.0",
    date: "25 سبتمبر 2025",
    label: "feat",
    title: "كازينو الألعاب",
    description:
      "أسئلة وتحديات جماعية — الهوست بيسأل واللاعبين يتنافسوا على النقاط.",
  },
  {
    version: "1.3.0",
    date: "20 سبتمبر 2025",
    label: "feat",
    title: "الألعاب ونظام اللاعبين",
    description:
      "إضافة ألعاب القعدة مع نظام إدارة اللاعبين والنقاط — أمير الظلام، شيخ الحارة، وبكاسة.",
  },
  {
    version: "1.2.0",
    date: "17 سبتمبر 2025",
    label: "feat",
    title: "أدلة الاستخدام",
    description: "أدلة تفصيلية لكل وضع لعب عشان محدش يتوه.",
  },
  {
    version: "1.1.0",
    date: "13 سبتمبر 2025",
    label: "feat",
    title: "نظام المحتوى العشوائي",
    description: "تدوير عشوائي للمواضيع والتحديات في كل قعدة.",
  },
  {
    version: "1.0.0",
    date: "10 سبتمبر 2025",
    label: "feat",
    title: "البداية",
    description: "أول إصدار — مواضيع وتحديات للقعدة من غير تسجيل.",
  },
]

export const labelColor: Record<string, string> = {
  feat: "text-copper border-copper/30 bg-copper/5",
  fix: "text-danger-brand border-danger-brand/30 bg-danger-brand/5",
  chore: "text-ink-soft border-ink/20 bg-ink/5",
}
