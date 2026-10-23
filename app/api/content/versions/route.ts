import { NextResponse } from "next/server"

import { getContentVersions } from "@/lib/server/content-queries"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * `GET /api/content/versions`
 *
 * بترجّع نسخ كل مجموعات المحتوى المسجّلة في Neon — من غير أي محتوى
 * أسئلة، عشان الفحص يبقى رخيص. المجموعات الجديدة بتظهر تلقائيًا.
 * المحتوى العام مش محمي، بس القراءة فقط ومفيش أي كتابة.
 *
 * `no-store` مقصودة: لازم الفحص يوصل للنسخة الحالية من السيرفر، ومينفعش
 * service worker أو أي كاش وسيط يرجّع نسخة قديمة.
 */
export async function GET() {
  try {
    const versions = await getContentVersions()

    return NextResponse.json(versions, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    // من غير تفاصيل قاعدة بيانات في الرد — بس log على السيرفر.
    console.error("[api/content/versions] failed to read versions", error)

    return NextResponse.json(
      { error: "تعذر قراءة نسخ المحتوى." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    )
  }
}
