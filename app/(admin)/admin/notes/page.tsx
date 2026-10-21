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
      description="الملاحظات الداخلية موجودة في قاعدة البيانات، لكنها مش هتتعرض قبل تفعيل مصادقة المسؤول."
      table="notes"
    />
  )
}
