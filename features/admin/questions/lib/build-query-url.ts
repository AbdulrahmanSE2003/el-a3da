export function buildQueryUrl(
  pathname: string,
  searchParams: URLSearchParams,
  updates: Record<string, string | null>
) {
  const params = new URLSearchParams(searchParams.toString())

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
