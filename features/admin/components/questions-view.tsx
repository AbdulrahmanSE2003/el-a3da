"use client"

import { useMemo, useState } from "react"
import { LayersIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type {
  CategoryCount,
  ContentSetId,
  ContentSetRow,
  QuestionRow,
} from "../lib/types"
import { getSetMeta } from "../lib/content-sets"
import { PageHeader } from "./page-header"
import QuestionsTabs from "../questions/QuestionsTabs"
import { QuestionsFilters } from "../questions/QuestionsFilters"
import { QuestionsTable } from "../questions/QuestionsTable"
import { AdminPagination } from "./pagination"
import { QuestionDetailDialog } from "./question-detail-dialog"
import { QuestionEditDialog } from "./question-edit-dialog"
import { QuestionDeleteDialog } from "./question-delete-dialog"
import { QuestionCreateDialog } from "./question-create-dialog"
import { QuestionBulkDialog } from "./question-bulk-dialog"
import { useQuestionFilters } from "../questions/hooks/use-question-filter"

interface QuestionsViewProps {
  sets: ContentSetRow[]
  setId: ContentSetId
  query: string
  category: string
  rows: QuestionRow[]
  total: number
  page: number
  pageCount: number
  categories: CategoryCount[]
}

export function QuestionsView({
  sets,
  setId,
  query,
  category,
  rows,
  total,
  page,
  pageCount,
  categories,
}: QuestionsViewProps) {
  const [viewing, setViewing] = useState<QuestionRow | null>(null)
  const [editing, setEditing] = useState<QuestionRow | null>(null)
  const [deleting, setDeleting] = useState<QuestionRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [bulkCreating, setBulkCreating] = useState(false)

  const { search, setSearch, isPending, navigate } = useQuestionFilters(query)

  const setRow = useMemo(
    () => sets.find((set) => set.id === setId),
    [sets, setId]
  )
  const setMeta = getSetMeta(setId, setRow?.title)

  const hasFilters = Boolean(query.trim()) || category !== "all"

  const openEditor = (question: QuestionRow) => {
    setViewing(null)
    setEditing(question)
  }

  const openDelete = (question: QuestionRow) => {
    setViewing(null)
    setDeleting(question)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        stamp="الأسئلة"
        title="إدارة الأسئلة"
        description="كل أسئلة المجموعة في مكان واحد. أي تعديل بيظهر للاعبين في الجلسات الجديدة، والجلسات اللي شغالة دلوقتي هتكمل بأسئلتها زي ما هي."
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setCreating(true)}>
              <PlusIcon className="size-4" />
              سؤال جديد
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkCreating(true)}
            >
              <LayersIcon className="size-4" />
              إضافة أسئلة مجمعة
            </Button>
          </div>
        }
      />

      <QuestionsTabs sets={sets} setId={setId} />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-ink-soft">
        <span className="stamp-text">{setMeta.stamp}</span>

        <Badge className="border-copper/30 bg-copper/10 font-mono text-[10px] text-copper">
          الإصدار {setRow?.version ?? "—"}
        </Badge>
      </div>

      <QuestionsFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setId={setId}
        categories={categories}
        onCategoryChange={(value) =>
          navigate({
            category: value === "all" ? null : value,
            page: null,
          })
        }
      />

      <QuestionsTable
        onDeleteQuestion={openDelete}
        onEditQuestion={openEditor}
        setMeta={setMeta}
        rows={rows}
        total={total}
        isPending={isPending}
        hasFilters={hasFilters}
        onViewQuestion={setViewing}
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
        <QuestionDetailDialog
          key={viewing.id}
          question={viewing}
          setMeta={setMeta}
          onClose={() => setViewing(null)}
          onEdit={() => openEditor(viewing)}
          onDelete={() => openDelete(viewing)}
        />
      )}

      {editing && (
        <QuestionEditDialog
          key={editing.id}
          question={editing}
          setMeta={setMeta}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      )}

      {deleting && (
        <QuestionDeleteDialog
          key={deleting.id}
          question={deleting}
          setMeta={setMeta}
          onClose={() => setDeleting(null)}
          onDeleted={() => setDeleting(null)}
        />
      )}

      {creating && (
        <QuestionCreateDialog
          setMeta={setMeta}
          categories={categories}
          onClose={() => setCreating(false)}
          onCreated={() => setCreating(false)}
        />
      )}

      {bulkCreating && (
        <QuestionBulkDialog
          setMeta={setMeta}
          categories={categories}
          onClose={() => setBulkCreating(false)}
          onCreated={() => setBulkCreating(false)}
        />
      )}
    </div>
  )
}
