import { NextResponse } from "next/server"
import { requireAdmin } from "@/features/admin/server/auth"
import { getFeedbackAttachment } from "@/features/admin/server/feedback-queries"
import { createFeedbackDownloadUrl } from "@/lib/server/neon-storage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * وسيط لعرض صور الملاحظات. الـ bucket خاص، فمفيش صورة بتتوصل للـ browser
 * مباشرة. الراوت بيتحقق من جلسة الأدمن، وبعدها بيعمل redirect لرابط موقّع
 * قصير العمر من Neon Storage.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params
  const attachment = await getFeedbackAttachment(id)
  if (!attachment) {
    return new NextResponse("Not found", { status: 404 })
  }

  let url: string
  try {
    url = await createFeedbackDownloadUrl(attachment.storageKey)
  } catch (error) {
    console.error("[admin/feedback] attachment signing failed", error)
    return new NextResponse("Storage unavailable", { status: 503 })
  }

  return NextResponse.redirect(url, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": attachment.mimeType,
    },
  })
}
