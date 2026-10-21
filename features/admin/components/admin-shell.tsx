"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ActivityIcon,
  AlertTriangleIcon,
  ListChecksIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  StickyNoteIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboardIcon },
  { href: "/admin/questions", label: "الأسئلة", icon: ListChecksIcon },
  { href: "/admin/feedback", label: "رسائل اللاعبين", icon: MessageSquareIcon },
  { href: "/admin/notes", label: "ملاحظات المطوّر", icon: StickyNoteIcon },
  { href: "/admin/health", label: "صحة المحتوى", icon: ActivityIcon },
] as const

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname.startsWith(href)

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const logoutButton = (
    <form action="/api/admin/logout" method="post">
      <button
        type="submit"
        className="flex w-full items-center gap-2 border-2 border-ink/20 px-3 py-2 text-xs font-bold text-ink-soft transition-colors outline-none hover:border-ink hover:bg-paper hover:text-ink focus-visible:ring-[3px] focus-visible:ring-copper/50"
      >
        <LogOutIcon className="size-4 shrink-0" />
        تسجيل الخروج
      </button>
    </form>
  )

  const nav = (
    <nav aria-label="أقسام لوحة المطوّر" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 border-2 px-3 py-2 text-sm font-bold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50",
              active
                ? "border-ink bg-paper text-ink shadow-[2px_2px_0_var(--color-ink)]"
                : "border-transparent text-ink-soft hover:bg-paper hover:text-ink"
            )}
          >
            <item.icon
              className={cn("size-4 shrink-0", active && "text-copper")}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-[1440px]">
        {/* الشريط الجانبي — ديسكتوب */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e-2 border-ink bg-paper-warm p-5 md:flex">
          <Link href="/admin" className="block outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50">
            <span className="block text-2xl font-black tracking-tight">
              القعدة
            </span>
            <span className="stamp-text mt-1 block">DEV CONSOLE</span>
          </Link>

          <div className="mt-6">{nav}</div>

          <div className="mt-auto border-2 border-ink/20 bg-paper p-3">
            <p className="font-mono text-[10px] font-bold tracking-widest text-copper">
              CONTENT ADMIN
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              الأسئلة والمجموعات بتتقرأ من Neon. تقدر تعدّل حقول السؤال أو
              تحذفه soft delete. الإضافة والنشر والرسائل والملاحظات لسه مش
              متفعّلة.
            </p>
            <div className="mt-3">{logoutButton}</div>
          </div>
        </aside>

        {/* المحتوى */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* شريط الموبايل */}
          <div className="border-b-2 border-ink bg-paper-warm md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-xl font-black">القعدة</span>
                <span className="stamp-text ms-2">DEV</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border-2 border-ink/20 bg-paper px-2.5 py-1.5 font-mono text-[10px] font-bold text-ink-soft">
                  ADMIN
                </span>
                <form action="/api/admin/logout" method="post">
                  <button
                    type="submit"
                    aria-label="تسجيل الخروج"
                    className="border-2 border-ink/20 bg-paper p-1.5 text-ink-soft transition-colors outline-none hover:border-ink hover:text-ink focus-visible:ring-[3px] focus-visible:ring-copper/50"
                  >
                    <LogOutIcon className="size-4" />
                  </button>
                </form>
              </div>
            </div>

            <nav
              aria-label="أقسام لوحة المطوّر"
              className="hide-scrollbar flex gap-1 overflow-x-auto px-4 pb-3"
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 border-2 px-2.5 py-1.5 text-xs font-bold whitespace-nowrap outline-none focus-visible:ring-[3px] focus-visible:ring-copper/50",
                      active
                        ? "border-ink bg-copper text-paper"
                        : "border-ink/20 text-ink-soft"
                    )}
                  >
                    <item.icon className="size-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* تنبيه الوصول */}
          <div className="flex items-start gap-2.5 border-b border-copper/30 bg-copper/10 px-4 py-2.5 text-xs leading-relaxed text-ink-soft md:px-8">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-copper" />
            <p>
              <span className="font-bold text-ink">لوحة محمية:</span> الدخول
              محمي بجلسة مسؤول. تعديل وحذف الأسئلة متاح، لكن الإضافة والنشر
              ورسائل اللاعبين والملاحظات لسه مش متفعّلة.
            </p>
          </div>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
