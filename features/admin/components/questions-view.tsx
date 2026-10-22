"use client"

import { useMemo, useState } from "react"
import { PlusIcon } from "lucide-react"
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

  const { search, setSearch, isPending, navigate } = useQuestionFilters(query)

  const setMeta = getSetMeta(setId)

  const setRow = useMemo(
    () => sets.find((set) => set.id === setId),
    [sets, setId]
  )

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
        description="عرض وإدارة الأسئلة النشطة في Neon. يمكن إضافة سؤال جديد، وتعديل النص والفئة والحقول الخاصة بكل مجموعة، والحذف يتم soft delete مع الاحتفاظ بالسجل. صفحات اللعبة الحالية لسه بتقرأ من ملفات المحتوى الثابتة."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <PlusIcon className="size-4" />
            سؤال جديد
          </Button>
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
        setId={setId}
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
    </div>
  )
}
