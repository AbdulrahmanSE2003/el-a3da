"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { buildQueryUrl } from "../../questions/lib/build-query-url"

export function useFeedbackFilters(query: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(query)
  const [isPending, startTransition] = useTransition()

  const buildHref = useCallback(
    (updates: Record<string, string | null>) =>
      buildQueryUrl(
        pathname,
        new URLSearchParams(searchParams.toString()),
        updates
      ),
    [pathname, searchParams]
  )

  const navigate = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        router.push(buildHref(updates), { scroll: false })
      })
    },
    [buildHref, router]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(query)
  }, [query])

  useEffect(() => {
    if (search === query) return

    const timeout = setTimeout(() => {
      router.replace(
        buildHref({
          q: search.trim() || null,
          page: null,
        }),
        { scroll: false }
      )
    }, 350)

    return () => clearTimeout(timeout)
  }, [buildHref, query, router, search])

  return { search, setSearch, isPending, navigate }
}
