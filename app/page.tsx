import { headers } from "next/headers"
import Platform from "@/components/layout/Platform"
import LandingPage from "@/components/layout/LandingPage"

export default async function HomePage() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") ?? ""
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)

  return isMobile ? <Platform /> : <LandingPage />
}
