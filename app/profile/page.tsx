import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"
import SignOutButton from "@/components/sign-out-button"
import BottomNav from "@/components/bottom-nav"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch all badges
  const { data: allBadges } = await supabase.from("badges").select("*").order("requirement_value")

  // Fetch user's earned badges
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  const earnedBadgeIds = new Set(earnedBadges?.map((b: any) => b.badge_id))

  // Calculate XP progress
  const currentLevel = profile?.current_level || 1
  const currentXP = profile?.total_xp || 0
  const xpForCurrentLevel = (currentLevel - 1) * 100
  const xpForNextLevel = currentLevel * 100
  const xpInCurrentLevel = currentXP - xpForCurrentLevel
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100

  // Stats
  const { count: totalCheckIns } = await supabase
    .from("check_ins")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: totalEntries } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="glass border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Profile</h1>
              <p className="text-sm text-muted-foreground">Your journey and achievements</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-3xl text-white">
                  {profile?.display_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{profile?.display_name}</h2>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Badge variant="secondary" className="text-base">
                      Level {currentLevel}
                    </Badge>
                    <Badge variant="outline" className="text-base">
                      <span className="mr-1">🔥</span>
                      {profile?.streak_days || 0} day streak
                    </Badge>
                    <Badge variant="outline" className="text-base">
                      {currentXP} XP
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
              <CardDescription>
                {xpInCurrentLevel} / {xpNeededForNextLevel} XP to Level {currentLevel + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercentage} className="h-3" />
              <p className="mt-2 text-sm text-muted-foreground">
                Keep checking in and journaling to earn more XP and level up!
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Check-ins</CardDescription>
                <CardTitle className="text-3xl">{totalCheckIns || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Journal Entries</CardDescription>
                <CardTitle className="text-3xl">{totalEntries || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Badges Earned</CardDescription>
                <CardTitle className="text-3xl">
                  {earnedBadges?.length || 0}/{allBadges?.length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Achievements you&apos;ve unlocked on your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {allBadges?.map((badge: any) => {
                  const isEarned = earnedBadgeIds.has(badge.id)
                  const earnedBadge = earnedBadges?.find((b: any) => b.badge_id === badge.id)
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-start gap-4 rounded-lg border p-4 ${isEarned ? "bg-muted/50" : "opacity-50"}`}
                    >
                      <div className={`text-4xl ${isEarned ? "" : "grayscale"}`}>{badge.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{badge.name}</h3>
                          {isEarned && <Badge variant="secondary">Earned</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        {isEarned && earnedBadge && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Earned {new Date(earnedBadge.earned_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* How to Earn XP */}
          <Card>
            <CardHeader>
              <CardTitle>How to Earn XP</CardTitle>
              <CardDescription>Complete activities to level up and unlock badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <span>Complete a check-in</span>
                  </div>
                  <Badge variant="outline">+10 XP</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📝</div>
                    <span>Write a journal entry</span>
                  </div>
                  <Badge variant="outline">+20 XP</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔥</div>
                    <span>Maintain your streak</span>
                  </div>
                  <Badge variant="outline">Daily bonus</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  )
}
