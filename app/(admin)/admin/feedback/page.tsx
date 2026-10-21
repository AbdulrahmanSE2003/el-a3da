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
      description="صندوق الرسائل موجود في قاعدة البيانات، لكن عرضه في الداشبورد لسه مش متفعّل."
      table="feedback"
    />
  )
}
