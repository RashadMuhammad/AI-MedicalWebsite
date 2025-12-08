"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Truck, MapPin, History, Settings } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/ambulance", label: "Dashboard", icon: Truck },
    { href: "/ambulance/active-requests", label: "Active Requests", icon: MapPin },
    { href: "/ambulance/history", label: "Trip History", icon: History },
    { href: "/ambulance/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
