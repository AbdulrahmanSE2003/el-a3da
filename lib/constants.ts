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

export const updates = [
  {
    version: "2.1.0",
    date: "23 أكتوبر 2026",
    label: "feat",
    title: "لعبة القنبلة وصلت 💣",
    description:
      "لعبة جديدة تختار فيها الفئة، تمرر الموبايل، وتسيب المؤقت يجري... لحد ما القنبلة تنفجر! مع مؤقت عشوائي، أصوات حماسية، وزرار كتم لو الجو هادي. وكمان أي تحديثات في الأسئلة بتوصلك تلقائيًا وتشتغل حتى لو النت قطع، من غير ما تقطع لعبكم.",
  },
  {
    version: "2.0.0",
    date: "2026",
    label: "feat",
    title: "القعدة بشكل جديد 🎨",
    description:
      "اختار شكل القعدة على مزاجك: قهوة سكيتو، ماتشا، موهيتو بلوبيري، عنّاب ساقع، وسموزي برقوق. غيّر الثيم من الإعدادات وشوف التغيير فورًا، مع تحميل أسرع وتجربة أنعم على الموبايل.",
  },
  {
    version: "1.4.1",
    date: "أكتوبر 2025",
    label: "chore",
    title: "تحسينات في الاستقرار",
    description:
      "إصلاحات صغيرة بتخلي التنقل بين الصفحات أسرع وأثبت، وتجربة الاستخدام أنضف على الموبايل.",
  },
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
