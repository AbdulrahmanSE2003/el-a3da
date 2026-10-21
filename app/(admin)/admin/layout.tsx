import type { Metadata } from "next"
import { AdminShell } from "@/features/admin/components/admin-shell"

export const metadata: Metadata = {
  title: "لوحة المطوّر — القعدة",
  description: "لوحة تحكم داخلية لتطوير محتوى القعدة.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminShell>{children}</AdminShell>
}
