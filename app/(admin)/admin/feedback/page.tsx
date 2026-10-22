import type { Metadata } from "next"
import { FeedbackView } from "@/features/admin/components/feedback-view"
import { getFeedbackPage } from "@/features/admin/server/feedback-queries"
import {
  isFeedbackStatus,
  isFeedbackType,
} from "@/features/feedback/lib/feedback"

export const metadata: Metadata = {
  title: "رسائل اللاعبين — لوحة المطوّر",
}

interface AdminFeedbackPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function AdminFeedbackPage({
  searchParams,
}: AdminFeedbackPageProps) {
  const params = await searchParams

  const rawStatus = first(params.status)
  const status = isFeedbackStatus(rawStatus) ? rawStatus : "all"

  const rawType = first(params.type)
  const type = isFeedbackType(rawType) ? rawType : "all"

  const query = (first(params.q) ?? "").trim().slice(0, 100)
  const requestedPage = Number.parseInt(first(params.page) ?? "1", 10)

  const data = await getFeedbackPage({
    status,
    type,
    query,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    pageSize: 20,
  })

  return (
    <FeedbackView
      rows={data.rows}
      total={data.total}
      page={data.page}
      pageCount={data.pageCount}
      counts={data.counts}
      status={status}
      type={type}
      query={query}
    />
  )
}
