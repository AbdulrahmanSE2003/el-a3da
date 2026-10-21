import type { Metadata } from "next"
import { AdminShell } from "@/features/admin/components/admin-shell"
import { requireAdminPage } from "@/features/admin/server/auth"

export const metadata: Metadata = {
  title: "لوحة المطوّر — القعدة",
  description: "لوحة تحكم داخلية لتطوير محتوى القعدة.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminPage("/admin")

  return <AdminShell>{children}</AdminShell>
}
