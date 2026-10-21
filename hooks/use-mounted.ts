"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** true بعد الـ hydration فقط — من غير setState داخل effect. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
