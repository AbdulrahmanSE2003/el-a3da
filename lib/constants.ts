import {
  CircleQuestionMark,
  Gamepad2,
  MessageCircle,
  PlantPot,
  Zap,
} from "lucide-react"
import { ActivityCardItem } from "@/components/layout/ActivityCard"
import { ChangelogUpdate } from "@/features/marketing/changelog/ChangelogEntry"

export const activities: ActivityCardItem[] = [
  {
    number: "01",
    stamp: "TOPICS",
    title: "مواضيع وحوارات",
    description: "سؤال يرمي الخيط... وسيب الباقي على الشلة❕",
    href: "/topics",
    icon: MessageCircle,
  },
  {
    number: "02",
    stamp: "CHALLENGE",
    title: "تحديات",
    description: "الدور على مين النهاردة؟ ⚡",
    href: "/challenges",
    icon: Zap,
  },
  {
    number: "03",
    stamp: "QUESTIONS",
    title: "شيخ الحارة",
    description: "أسرار واعترافات.. جاهز للسين وجيم؟ 🕵️‍♂️",
    href: "/sheikh",
    icon: CircleQuestionMark,
  },
  {
    number: "04",
    stamp: "ZAD",
    title: "زاد القعدة",
    description: "مش لازم كل الوقت لعب ، خلينا نستفاد بشوية من وقتنا ✨",
    href: "/zad",
    icon: PlantPot,
    className: "col-span-2 border-2 border-copper/40 shadow-copper/40",
  },
  {
    number: "05",
    stamp: "GAMES",
    title: "ألعاب",
    description: "من هنا اللعب والضحك الجد بيبدأ! 🎮",
    href: "/games",
    icon: Gamepad2,
    className: "col-span-2",
  },
]

export const updates: ChangelogUpdate[] = [
  {
    version: "2.2.0",
    date: "01 نوفمبر 2026",
    label: "feat",
    title: "نظام أصوات جديد 🔊",
    description:
      "أصوات تفاعلية جديدة: قلب الكروت، الفوز في اللعبة، ودوران العجلة. مع زرار كتم من الإعدادات..",
  },
  {
    version: "2.1.0",
    date: "23 أكتوبر 2026",
    label: "game",
    title: "لعبة القنبلة وصلت 💣",
    description:
      "لعبة جديدة تختار فيها الفئة، تمرر الموبايل، وتسيب المؤقت يجري... لحد ما القنبلة تنفجر! مع مؤقت عشوائي، أصوات حماسية، وزرار كتم لو الجو هادي.",
  },
  {
    version: "2.0.0",
    date: "2026",
    label: "feat",
    title: "القعدة بشكل جديد 🎨",
    description:
      "اختار شكل القعدة على مزاجك: قهوة سكيتو، ماتشا، موهيتو بلوبيري، عنّاب ساقع، وسموزي برقوق.",
  },
  {
    version: "1.4.1",
    date: "أكتوبر 2025",
    label: "chore",
    title: "تحسينات في الاستقرار",
    description:
      "إصلاحات صغيرة بتخلي التنقل بين الصفحات أسرع وأثبت، وتجربة الاستخدام أسرع على الموبايل.",
  },
  {
    version: "1.4.0",
    date: "25 سبتمبر 2025",
    label: "game",
    title: "كازينو الألعاب",
    description:
      "أسئلة وتحديات جماعية — الحكم بيسأل واللاعبين يتنافسوا على النقاط.",
  },
  {
    version: "1.3.0",
    date: "20 سبتمبر 2025",
    label: "feat",
    title: "الألعاب ونظام اللاعبين",
    description:
      "إضافة ألعاب القعدة مع نظام إدارة اللاعبين — أمير الظلام، شيخ الحارة.",
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
    description: "أول إصدار — مواضيع وتحديات للقعدة تضيع الملل.",
  },
]

export const labelColor: Record<string, string> = {
  feat: "text-violet-500 border-violet-500/30 bg-violet-500/5",
  fix: "text-danger-brand border-danger-brand/30 bg-danger-brand/5",
  chore: "text-amber-500 border-amber-500/20 bg-amber-500/5",
  game: "text-teal-500 border-teal-500/30 bg-teal-500/5",
}
