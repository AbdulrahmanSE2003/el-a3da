import type { Metadata } from "next"
import { QuestionsView } from "@/features/admin/components/questions-view"
import {
  getContentSets,
  getQuestionsPage,
} from "@/features/admin/server/queries"

export const metadata: Metadata = {
  title: "الأسئلة — لوحة المطوّر",
}

interface AdminQuestionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function AdminQuestionsPage({
  searchParams,
}: AdminQuestionsPageProps) {
  const params = await searchParams
  const rawSet = first(params.set)
  const query = (first(params.q) ?? "").trim().slice(0, 100)
  const category =
    (first(params.category) ?? "all").trim().slice(0, 100) || "all"
  const requestedPage = Number.parseInt(first(params.page) ?? "1", 10)

  // القائمة بقت من Neon، فبنختار أول مجموعة متاحة بدل افتراض مجموعة ثابتة.
  // المجموعات المعروفة الناقصة بترجع كصفوف صفرية من getContentSets.
  const sets = await getContentSets()
  const setId = sets.find((set) => set.id === rawSet)?.id ?? sets[0]?.id

  if (!setId) {
    return (
      <div className="border-2 border-dashed border-ink/20 bg-paper-warm/30 p-6 text-sm text-ink-soft">
        مفيش مجموعات محتوى مسجّلة في Neon. أضف صفًا في content_sets الأول.
      </div>
    )
  }

  const data = await getQuestionsPage({
    setId,
    query,
    category,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    pageSize: 20,
  })

  // مفيش Suspense هنا: البيانات بتتقرأ فوق بالفعل، فحدود Suspense كانت
  // هتكون شكلية ومستحيل يعرض الـ fallback. حالة التحميل الحقيقية بتتغطّى
  // بـ `admin/loading.tsx` على مستوى المسار.
  return (
    <QuestionsView
      sets={sets}
      setId={setId}
      query={query}
      category={category}
      rows={data.rows}
      total={data.total}
      page={data.page}
      pageCount={data.pageCount}
      categories={data.categories}
    />
  )
}
