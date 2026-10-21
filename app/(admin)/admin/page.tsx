import type { Metadata } from "next"
import { OverviewView } from "@/features/admin/components/overview-view"
import { getOverviewData } from "@/features/admin/server/queries"

export const metadata: Metadata = {
  title: "نظرة عامة — لوحة المطوّر",
}

export default async function AdminOverviewPage() {
  const data = await getOverviewData()
  return <OverviewView data={data} />
}
