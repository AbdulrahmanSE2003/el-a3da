"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "./page-header"
import { AdminPagination } from "./pagination"
import { FeedbackFilters } from "../feedback/FeedbackFilters"
import { FeedbackTable } from "../feedback/FeedbackTable"
import { FeedbackDetailDialog } from "../feedback/FeedbackDetailDialog"
import { useFeedbackFilters } from "../feedback/hooks/use-feedback-filters"
import type { FeedbackCounts, FeedbackRow } from "../feedback/lib/types"
import { formatNumber } from "../lib/format"
import type {
  FeedbackStatus,
  FeedbackType,
} from "@/features/feedback/lib/feedback"

interface FeedbackViewProps {
  rows: FeedbackRow[]
  total: number
  page: number
  pageCount: number
  counts: FeedbackCounts
  status: FeedbackStatus | "all"
  type: FeedbackType | "all"
  query: string
}

export function FeedbackView({
  rows,
  total,
  page,
  pageCount,
  counts,
  status,
  type,
  query,
}: FeedbackViewProps) {
  const [viewing, setViewing] = useState<FeedbackRow | null>(null)

  const { search, setSearch, isPending, navigate } = useFeedbackFilters(query)

  const hasFilters = Boolean(query.trim()) || status !== "all" || type !== "all"

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        stamp="FEEDBACK"
        title="رسائل اللاعبين"
        description="كل الملاحظات اللي بيبعتها اللاعبون من صفحة الملاحظات، مع الصور المرفقة. العرض للقراءة فقط — الحالة بتتحدّث من قاعدة البيانات مباشرة."
        action={
          <Badge className="border-copper/30 bg-copper/10 font-mono text-[10px] text-copper">
            {formatNumber(counts.open)} جديدة
          </Badge>
        }
      />

      <FeedbackFilters
        search={search}
        setSearch={setSearch}
        status={status}
        type={type}
        counts={counts}
        onStatusChange={(value) =>
          navigate({
            status: value === "all" ? null : value,
            page: null,
          })
        }
        onTypeChange={(value) =>
          navigate({
            type: value === "all" ? null : value,
            page: null,
          })
        }
      />

      <FeedbackTable
        rows={rows}
        total={total}
        isPending={isPending}
        hasFilters={hasFilters}
        onViewFeedback={setViewing}
      />

      <AdminPagination
        page={page}
        pageCount={pageCount}
        totalItems={total}
        onPageChange={(target) =>
          navigate({
            page: target === 1 ? null : String(target),
          })
        }
      />

      {viewing && (
        <FeedbackDetailDialog
          key={viewing.id}
          feedback={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}
