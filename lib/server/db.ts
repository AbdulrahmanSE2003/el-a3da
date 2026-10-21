import "server-only"

import { neon } from "@neondatabase/serverless"

/**
 * عميل Neon المشترك بين قراءات الداشبورد وكتابات الأسئلة والملاحظات.
 *
 * الملف server-only: أي محاولة لاستيراده من Client Component هتفشل وقت
 * البناء، و`DATABASE_URL` عمره ما بيتحط في الـ browser bundle.
 */

type SqlClient = ReturnType<typeof neon>

let sqlClient: SqlClient | null = null

export function getSql(): SqlClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Add the Neon dev branch connection string to .env.local."
    )
  }

  sqlClient ??= neon(url)
  return sqlClient
}
