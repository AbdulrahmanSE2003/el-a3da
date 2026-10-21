import type { Metadata } from "next"
import { HealthView } from "@/features/admin/components/health-view"
import { getHealthReport } from "@/features/admin/server/queries"

export const metadata: Metadata = {
  title: "صحة المحتوى — لوحة المطوّر",
}

export default async function AdminHealthPage() {
  const report = await getHealthReport()
  return <HealthView report={report} />
}
