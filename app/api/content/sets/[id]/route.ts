import { NextResponse } from "next/server"

import { getContentSet } from "@/lib/server/content-queries"
import { isContentSetId } from "@/lib/content/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" }

/**
 * `GET /api/content/sets/[id]`
 *
 * بترجّع محتوى مجموعة واحدة مرتّب بـ `position` مع نسختها. المجموعة
 * بتتطلب بالـ id بتاعها؛ أي id غير صالح الشكل بيترفض قبل الداتابيز،
 * وأي id صالح لكن غير مسجّل بيرجع 404.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  if (!isContentSetId(id)) {
    return NextResponse.json(
      { error: "مجموعة محتوى غير معروفة." },
      { status: 400, headers: NO_STORE }
    )
  }

  try {
    const set = await getContentSet(id)

    // `getContentSet` بترجّع null للمجموعة المش موجودة أو اللي مفيش فيها
    // محتوى صالح للعب — الحالتين 404 من ناحية العميل.
    if (!set) {
      return NextResponse.json(
        { error: "المجموعة غير موجودة أو مفيش فيها محتوى متاح." },
        { status: 404, headers: NO_STORE }
      )
    }

    return NextResponse.json(set, { headers: NO_STORE })
  } catch (error) {
    console.error(`[api/content/sets/${id}] failed to read content`, error)

    return NextResponse.json(
      { error: "تعذر قراءة المحتوى." },
      { status: 503, headers: NO_STORE }
    )
  }
}
