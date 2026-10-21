import type { Metadata } from "next"
import { BlockedView } from "@/features/admin/components/blocked-view"

export const metadata: Metadata = {
  title: "ملاحظات المطوّر — لوحة المطوّر",
}

export default function AdminNotesPage() {
  return (
    <BlockedView
      stamp="NOTES"
      title="ملاحظات المطوّر"
      description="الملاحظات الداخلية موجودة في قاعدة البيانات، لكن عرضها في الداشبورد لسه مش متفعّل."
      table="notes"
    />
  )
}
