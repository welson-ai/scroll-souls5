"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Trophy, User, Building2, Stethoscope } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const mainNavItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/mood-wall", icon: MessageSquare, label: "Wall" },
    { href: "/leaderboard", icon: Trophy, label: "Ranks" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  const moreNavItems = [
    { href: "/organizations", icon: Building2, label: "Organizations" },
    { href: "/therapist", icon: Stethoscope, label: "Therapist Hub" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/80 shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-1 flex-col items-center gap-1 py-2 transition-all duration-200 sm:py-3 ${
                isActive ? "scale-105 text-primary" : "text-muted-foreground hover:scale-105 hover:text-foreground"
              }`}
            >
              <div
                className={`rounded-full p-1.5 transition-colors sm:p-2 ${isActive ? "bg-primary/10" : "group-hover:bg-accent"}`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-[10px] font-medium sm:text-xs">{item.label}</span>
            </Link>
          )
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="group flex flex-1 flex-col items-center gap-1 py-2 text-muted-foreground hover:text-foreground sm:py-3"
            >
              <div className="rounded-full p-1.5 transition-colors group-hover:bg-accent sm:p-2">
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-[10px] font-medium sm:text-xs">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {moreNavItems.map((item) => {
              const Icon = item.icon
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
