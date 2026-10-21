export interface CategoryStyle {
  /** حدود + خلفية + لون النص للـbadge */
  badge: string
  /** لون النقطة الصغيرة المرافقة للـbadge */
  dot: string
}

/**
 * لوحة ألوان ثابتة. الكلاسات مكتوبة كاملة (مش متولدة بالـtemplate strings)
 * عشان Tailwind يقدر يلقطها أثناء البناء.
 */
const PALETTE = {
  copper: {
    badge: "border-copper/40 bg-copper/10 text-copper",
    dot: "bg-copper",
  },
  inkGlow: {
    badge: "border-ink-glow/40 bg-ink-glow/10 text-ink-glow",
    dot: "bg-ink-glow",
  },
  primary: {
    badge: "border-primary/40 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  danger: {
    badge: "border-danger-brand/40 bg-danger-brand/10 text-danger-brand",
    dot: "bg-danger-brand",
  },
  emerald: {
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    dot: "bg-emerald-500",
  },
  teal: {
    badge: "border-teal-500/40 bg-teal-500/10 text-teal-500",
    dot: "bg-teal-500",
  },
  sky: {
    badge: "border-sky-500/40 bg-sky-500/10 text-sky-500",
    dot: "bg-sky-500",
  },
  indigo: {
    badge: "border-indigo-500/40 bg-indigo-500/10 text-indigo-500",
    dot: "bg-indigo-500",
  },
  violet: {
    badge: "border-violet-500/40 bg-violet-500/10 text-violet-500",
    dot: "bg-violet-500",
  },
  fuchsia: {
    badge: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-500",
    dot: "bg-fuchsia-500",
  },
  rose: {
    badge: "border-rose-500/40 bg-rose-500/10 text-rose-500",
    dot: "bg-rose-500",
  },
  orange: {
    badge: "border-orange-500/40 bg-orange-500/10 text-orange-500",
    dot: "bg-orange-500",
  },
  amber: {
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    dot: "bg-amber-500",
  },
} satisfies Record<string, CategoryStyle>

const ARABIC_MARKS = /[\u0610-\u061A\u0640\u064B-\u065F\u0670\u06D6-\u06ED]/g

/**
 * توحيد بسيط للفئة قبل البحث: إزالة التشكيل والمسافات الزائدة، وتوحيد
 * الألف/الياء/التاء المربوطة، عشان "صلاة الضُحى" و"صلاة الضحى" ياخدوا نفس اللون.
 */
function normalizeCategory(value: string): string {
  return value
    .trim()
    .replace(ARABIC_MARKS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .toLowerCase()
}

/**
 * ألوان مقصودة للفئات المتكررة. الباقي (زي فئات زاد الفريدة) بياخد لون
 * ثابت من FALLBACK_STYLES عن طريق hash، فمفيش ألوان بتتغير بين render وآخر.
 */
const CATEGORY_STYLE_MAP: Record<string, CategoryStyle> = Object.fromEntries(
  Object.entries({
    // عام / القعدة
    عام: PALETTE.copper,
    "معلومات عامة": PALETTE.copper,
    القعدة: PALETTE.copper,
    قهوة: PALETTE.amber,

    // ضحك
    ضحك: PALETTE.amber,
    مضحكة: PALETTE.amber,

    // تحدي / جرأة / صراحة
    تحدي: PALETTE.danger,
    جريئة: PALETTE.rose,
    جرأة: PALETTE.rose,
    صراحة: PALETTE.rose,
    اعترافات: PALETTE.rose,
    فضايح: PALETTE.danger,
    عقاب: PALETTE.danger,

    // معرفة / ثقافة
    معرفة: PALETTE.primary,
    ثقافة: PALETTE.inkGlow,
    "جغرافيا وتاريخ": PALETTE.teal,
    "شغل وعلم": PALETTE.teal,
    "عواصم وبلاد": PALETTE.sky,
    أعلام: PALETTE.sky,
    موبايل: PALETTE.sky,
    "أرقام محددة": PALETTE.indigo,

    // فن / ميديا
    أفلام: PALETTE.violet,
    أغاني: PALETTE.fuchsia,
    تمثيل: PALETTE.indigo,
    تقليد: PALETTE.indigo,

    // اجتماعي / شخصي
    علاقات: PALETTE.rose,
    شخصية: PALETTE.primary,
    تجارب: PALETTE.primary,
    ذكريات: PALETTE.primary,
    خيالية: PALETTE.violet,
    "عالم موازي": PALETTE.violet,

    // خيارات / سرعة / ذكاء
    خيارات: PALETTE.orange,
    "كلمات معكوسة": PALETTE.orange,
    جدال: PALETTE.orange,
    سرعة: PALETTE.amber,
    ذكاء: PALETTE.emerald,
    كورة: PALETTE.emerald,
    عميقة: PALETTE.inkGlow,
  }).map(([key, style]) => [normalizeCategory(key), style])
)

const FALLBACK_STYLES: readonly CategoryStyle[] = [
  PALETTE.copper,
  PALETTE.inkGlow,
  PALETTE.primary,
  PALETTE.danger,
  PALETTE.emerald,
  PALETTE.amber,
  PALETTE.indigo,
  PALETTE.violet,
  PALETTE.sky,
  PALETTE.teal,
  PALETTE.rose,
  PALETTE.orange,
  PALETTE.fuchsia,
]

/** FNV-1a — توزيع ثابت للفئات غير المذكورة صراحةً. */
function hashCategory(value: string): number {
  let hash = 0x811c9dc5

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return hash >>> 0
}

export function getCategoryStyle(
  category?: string | null
): CategoryStyle | null {
  if (!category) return null

  const normalized = normalizeCategory(category)
  if (!normalized) return null

  return (
    CATEGORY_STYLE_MAP[normalized] ??
    FALLBACK_STYLES[hashCategory(normalized) % FALLBACK_STYLES.length]
  )
}

export function getCategoryBadgeStyle(category?: string | null): string {
  return getCategoryStyle(category)?.badge ?? ""
}

export function getCategoryDotStyle(category?: string | null): string {
  return getCategoryStyle(category)?.dot ?? "bg-ink/20"
}
