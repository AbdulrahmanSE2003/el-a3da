import { Suspense } from "react"
import type { Metadata } from "next"
import { QuestionsView } from "@/features/admin/components/questions-view"
import { isContentSetId } from "@/features/admin/lib/content-sets"
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
  const setId = isContentSetId(rawSet) ? rawSet : "casino"
  const query = (first(params.q) ?? "").trim().slice(0, 100)
  const category = (first(params.category) ?? "all").trim().slice(0, 100) || "all"
  const requestedPage = Number.parseInt(first(params.page) ?? "1", 10)

  const [sets, data] = await Promise.all([
    getContentSets(),
    getQuestionsPage({
      setId,
      query,
      category,
      page: Number.isFinite(requestedPage) ? requestedPage : 1,
      pageSize: 20,
    }),
  ])

  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm font-bold text-ink-soft">
          بيتم تحميل المحتوى...
        </p>
      }
    >
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
    </Suspense>
  )
}
