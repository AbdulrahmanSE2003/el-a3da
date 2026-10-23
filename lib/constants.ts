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
    title: "القنبلة ومحتوى Neon الديناميكي",
    description:
      "إطلاق لعبة القنبلة بثلاثة مؤثرات صوتية وتحكم في الكتم، وربط محتواها بـ Neon مع fallback أوفلاين. مجموعات المحتوى بقت تتكتشف من قاعدة البيانات، والداشبورد بيعرض أرقام الرسائل والملاحظات الحقيقية.",
  },
  {
    version: "2.0.0",
    date: "2026",
    label: "feat",
    title: "القعدة v2 — ألوان وتجربة جديدة",
    description:
      "إطلاق نظام الثيمات الجديد مع خيارات متعددة وأجواء مختلفة. إضافة صفحة إعدادات المظهر، تحسين أداء التحميل ، ومزامنة البيانات مع Neon لدعم التشغيل أوفلاين.",
  },
  {
    version: "1.4.1",
    date: "أكتوبر 2025",
    label: "chore",
    title: "تحسين استقرار البيانات ولوحة التحكم",
    description:
      "تنظيف معرفات المحتوى (Content IDs)، مزامنة قاعدة البيانات للتطوير، وإضافة لوحة تحكم للقراءة فقط لفحص حالة النظام.",
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
