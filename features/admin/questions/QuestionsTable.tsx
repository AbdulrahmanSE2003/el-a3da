"use client"

import { EyeIcon, PencilIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "../components/empty-state"
import {
  AdminTable,
  AdminTHead,
  AdminTR,
  AdminTH,
  AdminTD,
} from "../components/table"
import { CategoryBadge } from "../components/category-badge"
import { formatNumber } from "../lib/format"
import type { ContentSetMeta, QuestionRow } from "../lib/types"
import { cn } from "@/lib/utils"

interface QuestionsTableProps {
  setMeta: ContentSetMeta
  rows: QuestionRow[]
  total: number
  isPending: boolean
  hasFilters: boolean
  onViewQuestion: (question: QuestionRow) => void
  onEditQuestion: (question: QuestionRow) => void
  onDeleteQuestion: (question: QuestionRow) => void
}

export function QuestionsTable({
  setMeta,
  rows,
  total,
  isPending,
  hasFilters,
  onViewQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: QuestionsTableProps) {
  const emptyTitle = hasFilters ? "مفيش نتائج مطابقة" : "مفيش أسئلة هنا"
  const emptyDescription = hasFilters
    ? "جرّب تغيّر الفلتر أو كلمة البحث."
    : "المجموعة دي لسه فاضية. ابدأ بسؤال جديد أو إضافة مجمعة."

  return (
    <div
      className={cn(
        "border-2 border-ink bg-paper-warm transition-opacity duration-150",
        isPending && "pointer-events-none opacity-60"
      )}
    >
      {/* Table Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-paper-warm/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-copper" />
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft uppercase">
            النتائج · {formatNumber(total)}
          </p>
        </div>

        <p className="text-[11px] font-medium text-ink-soft/80">
          {isPending
            ? "بيتم التحديث..."
            : `عرض ${formatNumber(rows.length)} من أصل ${formatNumber(total)}`}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={SearchIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      ) : (
        <AdminTable>
          <AdminTHead>
            <tr>
              <AdminTH className="w-12 text-center">#</AdminTH>
              <AdminTH className="w-24">المعرف</AdminTH>
              <AdminTH>نص السؤال</AdminTH>
              <AdminTH className="w-28 text-center">الفئة</AdminTH>

              {setMeta.hasCorrectAnswer && (
                <AdminTH className="w-40">الإجابة الصحيحة</AdminTH>
              )}

              {setMeta.hasBadgeLabel && (
                <AdminTH className="w-28">الشارة</AdminTH>
              )}

              <AdminTH className="w-28 text-end">الإجراءات</AdminTH>
            </tr>
          </AdminTHead>

          <tbody>
            {rows.map((question) => (
              <AdminTR
                key={question.id}
                className="group transition-colors hover:bg-paper-warm/60"
              >
                {/* Position */}
                <AdminTD className="text-center">
                  <span
                    className="font-mono text-[11px] font-bold text-ink-soft/70"
                    dir="ltr"
                    title="الترتيب يبدأ من 0"
                  >
                    {question.position}
                  </span>
                </AdminTD>

                {/* External ID */}
                <AdminTD>
                  <span
                    className="font-mono text-[11px] font-bold text-ink-soft"
                    dir="ltr"
                  >
                    {question.externalId.trim() || "—"}
                  </span>
                </AdminTD>

                {/* Question Text */}
                <AdminTD className="max-w-md">
                  <button
                    type="button"
                    onClick={() => onViewQuestion(question)}
                    className="line-clamp-2 text-start text-sm font-bold text-foreground transition-colors hover:text-copper"
                  >
                    {question.text || (
                      <span className="font-normal text-danger-brand italic">
                        — نص غير متوفر —
                      </span>
                    )}
                  </button>
                </AdminTD>

                {/* Category Tag */}
                <AdminTD className="text-center">
                  {question.category ? (
                    <CategoryBadge
                      category={question.category}
                      setId={setMeta.id}
                      className="font-bold transition-all"
                    />
                  ) : (
                    <span className="text-xs text-ink-soft/40">—</span>
                  )}
                </AdminTD>

                {/* Correct Answer */}
                {setMeta.hasCorrectAnswer && (
                  <AdminTD className="max-w-40">
                    <span className="line-clamp-2 text-xs font-medium text-ink-soft">
                      {question.correctAnswer || (
                        <span className="font-bold text-danger-brand">
                          ناقصة
                        </span>
                      )}
                    </span>
                  </AdminTD>
                )}

                {/* Badge Label */}
                {setMeta.hasBadgeLabel && (
                  <AdminTD>
                    <span className="line-clamp-1 text-xs text-ink-soft">
                      {question.badgeLabel || "—"}
                    </span>
                  </AdminTD>
                )}

                {/* Actions */}
                <AdminTD>
                  <div className="flex justify-end gap-1 opacity-90 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-ink-soft hover:bg-ink/10 hover:text-ink"
                      aria-label="عرض التفاصيل"
                      title="عرض التفاصيل"
                      onClick={() => onViewQuestion(question)}
                    >
                      <EyeIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-copper hover:bg-copper/10 hover:text-copper"
                      aria-label="تعديل السؤال"
                      title="تعديل السؤال"
                      onClick={() => onEditQuestion(question)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-danger-brand hover:bg-danger-brand/10 hover:text-danger-brand"
                      aria-label="حذف السؤال"
                      title="حذف السؤال"
                      onClick={() => onDeleteQuestion(question)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </AdminTD>
              </AdminTR>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  )
}
