"use client"

/**
 * ربط مزوّد المحتوى بـ React.
 *
 * الفكرة: عند فتح صفحة لعبة، بنحلّ الـ snapshot مرة واحدة لكل جلسة
 * مكوّن (mount). القيمة بتفضل ثابتة طول عمر الجلسة، فتحديث الكاش في
 * الخلفية عمره ما بيلخبط السؤال الحالي أو الـ deck.
 */

import { useEffect, useState } from "react"

import {
  getBundledSnapshot,
  loadContentSnapshot,
  type ContentSnapshot,
} from "./provider"
import type { ContentSetId } from "./types"

/**
 * snapshot ثابت لمجموعة واحدة.
 *
 * - القيمة الابتدائية هي البندل المتزامن (متاح دايمًا) عشان أول رسم
 *   ما يستناش أي حاجة.
 * - بعد كده بنحاول نقرا الكاش مرة واحدة، ولو لقينا نسخة مختلفة بنبدّلها
 *   قبل ما اللعبة تبني الـ deck (المكوّن بيستنى `ready`).
 */
export function useContentSet(id: ContentSetId): {
  snapshot: ContentSnapshot
  ready: boolean
} {
  const [snapshot, setSnapshot] = useState<ContentSnapshot>(() =>
    getBundledSnapshot(id)
  )
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const resolved = await loadContentSnapshot(id)
      if (cancelled) return
      setSnapshot(resolved)
      setReady(true)
    })()

    return () => {
      cancelled = true
    }
  }, [id])

  return { snapshot, ready }
}
