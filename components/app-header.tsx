import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface AppHeaderProps {
  profile: {
    current_level: number
    streak_days: number
  } | null
  showBack?: boolean
  title?: string
}

export default function AppHeader({ profile, showBack, title }: AppHeaderProps) {
  return (
    <header className="border-b bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <div className="flex items-center gap-3">
              <Link href="/home" className="text-muted-foreground hover:text-foreground">
                ←
              </Link>
              <h1 className="text-xl font-bold">{title || "Scroll Souls"}</h1>
            </div>
          ) : (
            <Link href="/home">
              <h1 className="text-xl font-bold">Scroll Souls</h1>
            </Link>
          )}
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Level {profile.current_level}</Badge>
            <Badge variant="outline">
              <span className="mr-1">🔥</span>
              {profile.streak_days} day{profile.streak_days !== 1 ? "s" : ""}
            </Badge>
          </div>
        )}
      </div>
    </header>
  )
}
