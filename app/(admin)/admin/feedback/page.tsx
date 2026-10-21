import type { Metadata } from "next"
import { BlockedView } from "@/features/admin/components/blocked-view"

export const metadata: Metadata = {
  title: "رسائل اللاعبين — لوحة المطوّر",
}

export default function AdminFeedbackPage() {
  return (
    <BlockedView
      stamp="FEEDBACK"
      title="رسائل اللاعبين"
      description="صندوق الرسائل موجود في قاعدة البيانات، لكنه مش هيتعرض قبل تفعيل مصادقة المسؤول."
      table="feedback"
    />
  )
}
