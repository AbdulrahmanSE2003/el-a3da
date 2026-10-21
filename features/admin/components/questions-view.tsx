"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { EyeIcon, SearchIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "./page-header"
import { Tag, AdminTable, AdminTHead, AdminTR, AdminTH, AdminTD } from "./table"
import { AdminPagination } from "./pagination"
import { EmptyState } from "./empty-state"
import { QuestionDetailDialog } from "./question-detail-dialog"
import { getSetMeta } from "../lib/content-sets"
import { formatNumber } from "../lib/format"
import type {
  CategoryCount,
  ContentSetId,
  ContentSetRow,
  QuestionRow,
} from "../lib/types"
import { cn } from "@/lib/utils"

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(query)
  const [isPending, startTransition] = useTransition()
  const [viewing, setViewing] = useState<QuestionRow | null>(null)

  const setMeta = getSetMeta(setId)
  const setRow = useMemo(
    () => sets.find((set) => set.id === setId),
    [sets, setId]
  )

  const buildHref = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key)
        else params.set(key, value)
      }
      const next = params.toString()
      return next ? `${pathname}?${next}` : pathname
    },
    [pathname, searchParams]
  )

  const navigate = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        router.push(buildHref(updates), { scroll: false })
      })
    },
    [buildHref, router, startTransition]
  )

  // البحث مع debounce بسيط — التحديث في URL مش في الذاكرة.
  useEffect(() => {
    if (search === query) return
    const timeout = setTimeout(() => {
      const href = buildHref({
        q: search.trim() || null,
        page: null,
      })
      startTransition(() => {
        router.replace(href, { scroll: false })
      })
    }, 350)
    return () => clearTimeout(timeout)
  }, [buildHref, query, router, search, startTransition])

  const hasFilters = Boolean(query.trim()) || category !== "all"
  const emptyTitle = hasFilters ? "مفيش نتايج مطابقة" : "المجموعة فاضية"
  const emptyDescription = hasFilters
    ? "جرّب تغيير الفلاتر أو كلمة البحث."
    : "مفيش عناصر حية في المجموعة دي في قاعدة البيانات."

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        stamp="QUESTIONS"
        title="الأسئلة"
        description="قراءة مباشرة من جدول questions. الترتيب بـ position من 0، وID external_id بيتعرض زي ما هو من غير أي تطبيع."
        action={
          <div className="flex flex-col items-end gap-1">
            <Tag className="border-ink/20 bg-ink/5 font-mono text-ink-soft">
              READ ONLY
            </Tag>
            <span className="text-[10px] text-ink-soft/70">
              {setRow
                ? `${formatNumber(setRow.liveCount)} حي · ${formatNumber(setRow.deletedCount)} محذوف`
                : "—"}
            </span>
          </div>
        }
      />

      <div
        role="tablist"
        aria-label="مجموعات المحتوى"
        className="hide-scrollbar flex gap-1.5 overflow-x-auto border-b border-ink/10 pb-2"
      >
        {sets.map((set) => {
          const active = set.id === setId
          return (
            <button
              key={set.id}
              role="tab"
              aria-selected={active}
              onClick={() =>
                navigate({
                  set: set.id,
                  category: null,
                  page: null,
                })
              }
              className={cn(
                "flex shrink-0 items-center gap-2 border-2 px-3 py-1.5 text-xs font-bold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/20 text-ink-soft hover:border-ink/40 hover:text-ink"
              )}
            >
              {set.title}
              <span
                className={cn(
                  "font-mono text-[10px]",
                  active ? "text-paper/60" : "text-ink-soft/60"
                )}
              >
                {formatNumber(set.liveCount)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
        <span className="stamp-text">{setMeta.stamp}</span>
        <span className="font-mono text-[11px]" dir="ltr">
          {setMeta.sourceFile}
        </span>
        <Tag className="border-copper/30 bg-copper/10 font-mono text-[10px] text-copper">
          version {setRow?.version ?? "—"}
        </Tag>
        {!setMeta.isUsed && (
          <Tag className="border-copper/40 bg-copper/10 text-copper">
            غير مستخدم في التطبيق
          </Tag>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث في النص أو ID أو الفئة..."
            aria-label="بحث في الأسئلة"
            className="ps-9 pe-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="مسح البحث"
              className="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>

        <Select
          value={category}
          onValueChange={(value) =>
            navigate({
              category: value === "all" ? null : value,
              page: null,
            })
          }
        >
          <SelectTrigger aria-label="تصفية بالفئة" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item.category} value={item.category}>
                {item.category} ({formatNumber(item.count)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          "border-2 border-ink bg-paper-warm transition-opacity",
          isPending && "opacity-60"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-4 py-2">
          <p className="font-mono text-[10px] font-bold tracking-widest text-ink-soft">
            RESULTS · {formatNumber(total)}
          </p>
          <p className="text-[11px] text-ink-soft/70">
            {isPending
              ? "بيتم التحديث..."
              : `عرض ${formatNumber(rows.length)} من أصل ${formatNumber(total)}`}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
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
                <AdminTH className="w-24">ID</AdminTH>
                <AdminTH>النص</AdminTH>
                <AdminTH className="w-28">الفئة</AdminTH>
                {setMeta.hasCorrectAnswer && (
                  <AdminTH className="w-40">الإجابة</AdminTH>
                )}
                {setMeta.hasBadgeLabel && (
                  <AdminTH className="w-28">الشارة</AdminTH>
                )}
                <AdminTH className="w-20 text-end">عرض</AdminTH>
              </tr>
            </AdminTHead>
            <tbody>
              {rows.map((question) => (
                <AdminTR key={question.id}>
                  <AdminTD className="text-center">
                    <span
                      className="font-mono text-[11px] text-ink-soft"
                      dir="ltr"
                      title="position من 0"
                    >
                      {question.position}
                    </span>
                  </AdminTD>
                  <AdminTD>
                    <span
                      className="font-mono text-[11px] text-ink-soft"
                      dir="ltr"
                    >
                      {question.externalId.trim() || "—"}
                    </span>
                  </AdminTD>
                  <AdminTD className="max-w-md">
                    <button
                      type="button"
                      onClick={() => setViewing(question)}
                      className="line-clamp-2 text-start text-sm font-bold hover:text-copper"
                    >
                      {question.text || (
                        <span className="text-danger-brand">— نص فاضي —</span>
                      )}
                    </button>
                  </AdminTD>
                  <AdminTD className="text-center">
                    {question.category ? (
                      <Tag className="border-ink/20 bg-ink/5 text-ink-soft">
                        {question.category}
                      </Tag>
                    ) : (
                      <span className="text-xs text-ink-soft/50">—</span>
                    )}
                  </AdminTD>
                  {setMeta.hasCorrectAnswer && (
                    <AdminTD className="max-w-40">
                      <span className="line-clamp-2 text-xs text-ink-soft">
                        {question.correctAnswer || (
                          <span className="font-bold text-danger-brand">
                            ناقصة
                          </span>
                        )}
                      </span>
                    </AdminTD>
                  )}
                  {setMeta.hasBadgeLabel && (
                    <AdminTD>
                      <span className="line-clamp-1 text-xs text-ink-soft">
                        {question.badgeLabel || "—"}
                      </span>
                    </AdminTD>
                  )}
                  <AdminTD>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        aria-label="عرض التفاصيل"
                        onClick={() => setViewing(question)}
                      >
                        <EyeIcon />
                      </Button>
                    </div>
                  </AdminTD>
                </AdminTR>
              ))}
            </tbody>
          </AdminTable>
        )}
      </div>

      <AdminPagination
        page={page}
        pageCount={pageCount}
        totalItems={total}
        onPageChange={(target) =>
          navigate({ page: target === 1 ? null : String(target) })
        }
      />

      {viewing && (
        <QuestionDetailDialog
          key={viewing.id}
          question={viewing}
          setMeta={setMeta}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}
