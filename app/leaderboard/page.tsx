import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import BottomNav from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Get top users by XP
  const { data: topUsers } = await supabase
    .from("profiles")
    .select("id, display_name, total_xp, level, avatar_url")
    .order("total_xp", { ascending: false })
    .limit(50)

  // Get current user's rank
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, total_xp")
    .order("total_xp", { ascending: false })

  const userRank = allProfiles?.findIndex((p) => p.id === user.id) ?? -1

  return (
    <div className="min-h-svh bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="glass border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Top Soul Members by XP</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Current User Rank */}
        <Card className="glass mb-6 border-2 border-primary/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-3xl font-bold">#{userRank + 1}</p>
            </div>
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        {/* Leaderboard List */}
        {topUsers && topUsers.length > 0 ? (
          <div className="space-y-3">
            {topUsers.map((profile, index) => {
              const isCurrentUser = profile.id === user.id
              const rank = index + 1

              return (
                <Card
                  key={profile.id}
                  className={`glass transition-all hover:shadow-lg ${
                    isCurrentUser ? "border-2 border-primary" : "border-0"
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Rank */}
                    <div className="flex w-12 items-center justify-center">
                      {rank === 1 && <Trophy className="h-8 w-8 text-yellow-500" />}
                      {rank === 2 && <Medal className="h-8 w-8 text-gray-400" />}
                      {rank === 3 && <Award className="h-8 w-8 text-amber-700" />}
                      {rank > 3 && <span className="text-xl font-bold text-muted-foreground">#{rank}</span>}
                    </div>

                    {/* Avatar */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-xl font-bold text-white">
                      {profile.display_name?.charAt(0).toUpperCase() || "?"}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{profile.display_name || "Anonymous"}</p>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Level {profile.level}</p>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{profile.total_xp?.toLocaleString() || 0}</p>
                      <p className="text-xs text-muted-foreground">Soul Points</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="glass border-0 p-12 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">No rankings yet. Start your journey!</p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
