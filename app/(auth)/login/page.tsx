import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  getAdminSession,
  safeAdminRedirect,
} from "@/features/admin/server/auth"
import { LoginForm } from "./login-form"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "تسجيل الدخول — لوحة المطوّر",
  description: "تسجيل الدخول إلى لوحة تحكم تطبيق القعدة.",
  robots: {
    index: false,
    follow: false,
  },
}

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const next = safeAdminRedirect(first(params.next))

  const session = await getAdminSession()
  if (session) redirect(next)

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-10 text-ink">
      <div className="w-full max-w-md">
        {/* Top Header Row */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">القعدة</span>
            <span className="stamp-text">DEV CONSOLE</span>
          </div>
          <Badge variant={"outline"}>ADMIN</Badge>
        </div>

        {/* Main Card */}
        <section className="border-2 border-ink bg-paper-warm shadow-[6px_6px_0_var(--color-ink)]">
          <header className="border-b border-ink/10 px-5 py-4">
            <p className="stamp-text">SECURE ACCESS</p>
            <h1 className="mt-1 text-xl font-black">تسجيل دخول المسؤول</h1>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              وصول مخصص للمسؤولين. تنتهي صلاحية الجلسة تلقائياً بعد 8 ساعات.
            </p>
          </header>

          <div className="px-5 py-5">
            <LoginForm next={next} />
          </div>
        </section>

        {/* Navigation Link */}
        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-copper transition-opacity hover:opacity-80"
          >
            العودة إلى التطبيق الرئيسي
          </Link>
        </div>
      </div>
    </main>
  )
}
