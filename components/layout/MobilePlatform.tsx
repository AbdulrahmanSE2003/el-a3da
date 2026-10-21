// components/layout/MobilePlatform.tsx
"use client"

import { useMounted } from "@/hooks/use-mounted"
import { useMediaQuery } from "@/hooks/use-media-query"
import Platform from "./Platform"
import LandingPage from "./LandingPage"
import MobilePlatformLoader from "./MobilePlatformLoader"

export const MobilePlatform = () => {
  const isMounted = useMounted()
  const isMobileOrTablet = useMediaQuery("(max-width: 1024px)")

  if (!isMounted) return <MobilePlatformLoader />

  return isMobileOrTablet ? <Platform /> : <LandingPage />
}
