import { bombCategories, isBombCategory } from "@/games/bomb/constants"
import type { ContentSetMeta } from "./types"

/**
 * الفئات المشتركة بين الإضافة الفردية والـbulk.
 *
 * القيم دي هي نفس القيم المخزنة في `questions.category`؛ مفيش أي تغيير
 * للـpersisted values هنا. الـmapping للعرض بس، وأشهر حالة ليه هي `bomb`
 * اللي بيخزن مفاتيح إنجليزية زي `GENERAL` وبيعرض الاسم العربي.
 */

export interface CategoryOption {
  value: string
  label: string
}

/** الفئات المسموحة للمجموعة: canonical للمجموعات المقيّدة، وإلا فئات الداتابيز. */
export function getCategoryValues(
  setMeta: ContentSetMeta,
  dbCategories: readonly string[]
): readonly string[] {
  if (setMeta.categoryOptions) return setMeta.categoryOptions
  return dbCategories
}

/** الاسم المعروض للفئة مع الحفاظ على القيمة المخزنة كما هي. */
export function getCategoryLabel(setId: string, category: string): string {
  if (setId === "bomb" && isBombCategory(category)) {
    return bombCategories[category].name
  }

  return category
}

export function getCategoryOptions(
  setMeta: ContentSetMeta,
  dbCategories: readonly string[]
): CategoryOption[] {
  return getCategoryValues(setMeta, dbCategories).map((value) => ({
    value,
    label: getCategoryLabel(setMeta.id, value),
  }))
}

/** للعرض في الرسائل والـlegend: الاسم العربي + القيمة المخزنة لو مختلفين. */
export function formatCategoryOption(option: CategoryOption): string {
  return option.label === option.value
    ? option.value
    : `${option.value} (${option.label})`
}

export function formatCategoryValue(
  setMeta: ContentSetMeta,
  category: string
): string {
  return formatCategoryOption({
    value: category,
    label: getCategoryLabel(setMeta.id, category),
  })
}
