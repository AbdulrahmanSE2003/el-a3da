/** تنسيق الأرقام — أرقام لاتينية زي باقي التطبيق */
export const formatNumber = (value: number) => value.toLocaleString("en-US")

const dateTimeFormatter = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  dateStyle: "medium",
  timeStyle: "short",
})

/** تنسيق تاريخ ووقت — للمعاينة الإدارية */
export const formatDateTime = (iso: string | Date) =>
  dateTimeFormatter.format(typeof iso === "string" ? new Date(iso) : iso)

export const formatArabicTimeAgo = (
  lastContentUpdate: string | Date | number
): string => {
  const updateDate = new Date(lastContentUpdate)
  const now = new Date()

  // Calculate total days passed
  const diffInMs = Math.max(0, now.getTime() - updateDate.getTime())
  const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (totalDays === 0) {
    return "اليوم"
  }

  const weeks = Math.floor(totalDays / 7)
  const days = totalDays % 7

  const getWeekText = (count: number): string => {
    if (count === 0) return ""
    if (count === 1) return "أسبوع"
    if (count === 2) return "أسبوعين"
    if (count >= 3 && count <= 10) return `${count} أسابيع`
    return `${count} أسبوعاً`
  }

  const getDayText = (count: number): string => {
    if (count === 0) return ""
    if (count === 1) return "يوم"
    if (count === 2) return "يومين"
    if (count >= 3 && count <= 10) return `${count} أيام`
    return `${count} يوماً`
  }

  const weekStr = getWeekText(weeks)
  const dayStr = getDayText(days)

  if (weekStr && dayStr) {
    return `${weekStr} و ${dayStr}`
  }

  return weekStr || dayStr
}
