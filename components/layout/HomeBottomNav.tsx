"use client"

import { cn } from "cn"
import { Gamepad2, Home, MessageSquare, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    href: "/",
    label: "الرئيسية",
    icon: Home,
  },
  {
    href: "/games",
    label: "الألعاب",
    icon: Gamepad2,
  },
  {
    href: "/players",
    label: "اللعيبة",
    icon: Users,
  },
  {
    href: "/feedback",
    label: "الملاحظات",
    icon: MessageSquare,
  },
  {
    href: "/settings",
    label: "الإعدادات",
    icon: Settings,
  },
]

const HomeBottomNav = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto flex w-full items-center justify-around border border-ink/10 bg-paper/95 p-2 shadow-lg backdrop-blur-sm">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-16 flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive ? "text-copper" : "text-ink-soft hover:text-ink"
              }`}
            >
              <Icon className={cn("size-5", isActive ? "fill-primary" : "")} />
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isActive ? "font-black" : ""
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default HomeBottomNav
