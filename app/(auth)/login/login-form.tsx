"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const GENERIC_ERROR = "البريد الإلكتروني أو كلمة المرور غير صحيحة."

export function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next }),
        credentials: "same-origin",
      })

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; redirectTo?: unknown; error?: unknown }
        | null

      if (!response.ok || !data?.ok) {
        setError(
          typeof data?.error === "string" && data.error
            ? data.error
            : GENERIC_ERROR
        )
        return
      }

      const redirectTo =
        typeof data.redirectTo === "string" ? data.redirectTo : "/admin"
      router.replace(redirectTo)
      router.refresh()
    } catch {
      setError(GENERIC_ERROR)
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      action="/api/admin/login"
      method="post"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="next" value={next} />

      <div>
        <Label htmlFor="admin-email">البريد الإلكتروني</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          dir="ltr"
          required
          autoFocus
          disabled={pending}
          aria-invalid={error ? true : undefined}
          className="text-start"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <Label htmlFor="admin-password">كلمة المرور</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          required
          disabled={pending}
          aria-invalid={error ? true : undefined}
          className="text-start"
          placeholder="••••••••••••"
        />
      </div>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="border-2 border-danger-brand/40 bg-danger-brand/5 px-3 py-2 text-xs font-bold leading-relaxed text-danger-brand"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "بيتم التحقق..." : "تسجيل الدخول"}
      </Button>
    </form>
  )
}
