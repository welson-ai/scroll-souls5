import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import BottomNav from "@/components/bottom-nav"
import AppHeader from "@/components/app-header"
import CheckInButton from "@/components/check-in-button"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Fetch profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // Fetch today's check-in
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: todayCheckIn } = await supabase
    .from("check_ins")
    .select("*, emotions(*)")
    .eq("user_id", user.id)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch recent journal entries
  const { data: recentEntries } = await supabase
    .from("journal_entries")
    .select("*, emotions(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  // Fetch recent badges
  const { data: recentBadges } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(2)

  const { data: emotions } = await supabase.from("emotions").select("*").order("id")

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
      <AppHeader profile={profile} />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {profile?.display_name?.split(" ")[0] || "friend"}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">How are you feeling today?</p>
        </div>

        {/* Quick Check-in */}
        {!todayCheckIn ? (
          <Card className="mb-4 border-2 border-dashed border-primary/50 bg-gradient-to-br from-blue-50 to-purple-50 sm:mb-6">
            <CardContent className="flex flex-col items-center gap-3 py-6 text-center sm:gap-4 sm:py-8">
              <div className="text-4xl sm:text-5xl">💭</div>
              <div>
                <h3 className="mb-1 text-lg font-semibold sm:text-xl">Check in with yourself</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">Take a moment to acknowledge your emotions</p>
              </div>
              <CheckInButton emotions={emotions || []} userId={user.id} />
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4 sm:mb-6" style={{ backgroundColor: todayCheckIn.emotions.color_primary + "10" }}>
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4 sm:py-6">
              <div className="text-4xl sm:text-5xl">{todayCheckIn.emotions.emoji}</div>
              <div className="flex-1">
                <h3 className="mb-1 text-base font-semibold sm:text-lg">Today&apos;s Check-in</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  You felt {todayCheckIn.emotions.name} (Intensity: {todayCheckIn.intensity}/5)
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(todayCheckIn.created_at), { addSuffix: true })}
                </p>
              </div>
              <CheckInButton
                emotions={emotions || []}
                userId={user.id}
                variant="outline"
                label="Check in again"
                className="self-start sm:self-auto"
              />
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="mb-4 grid gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm">Total Check-ins</CardDescription>
              <CardTitle className="text-xl sm:text-2xl">{totalCheckIns || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm">Journal Entries</CardDescription>
              <CardTitle className="text-xl sm:text-2xl">{totalEntries || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm">Current Streak</CardDescription>
              <CardTitle className="text-xl sm:text-2xl">
                <span className="mr-1">🔥</span>
                {profile?.streak_days || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4 sm:space-y-6">
          {/* Recent Journal Entries */}
          {recentEntries && recentEntries.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">Recent Journal Entries</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your latest thoughts and reflections</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <Link href="/journal">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {recentEntries.map((entry: any) => (
                  <Link key={entry.id} href={`/journal/${entry.id}`}>
                    <div className="flex items-start gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/50 sm:gap-3 sm:p-3">
                      <div className="text-xl sm:text-2xl">{entry.emotions.emoji}</div>
                      <div className="min-w-0 flex-1">
                        {entry.title && <p className="line-clamp-1 text-sm font-medium sm:text-base">{entry.title}</p>}
                        <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">{entry.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Badges */}
          {recentBadges && recentBadges.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">Recent Achievements</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Badges you&apos;ve unlocked</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <Link href="/profile">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {recentBadges.map((userBadge: any) => (
                  <div key={userBadge.id} className="flex items-center gap-2 rounded-lg border p-2 sm:gap-3 sm:p-3">
                    <div className="text-2xl sm:text-3xl">{userBadge.badges.icon}</div>
                    <div>
                      <p className="text-sm font-medium sm:text-base">{userBadge.badges.name}</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">{userBadge.badges.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Continue your emotional wellness journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <Button asChild variant="outline" className="h-auto justify-start gap-3 py-4 text-left bg-transparent">
                  <Link href="/journal/new" className="flex items-center">
                    <div className="text-3xl">📝</div>
                    <div>
                      <p className="text-sm font-semibold">New Journal Entry</p>
                      <p className="text-xs text-muted-foreground">Express your thoughts</p>
                    </div>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto justify-start gap-3 py-4 text-left bg-transparent">
                  <Link href="/analytics" className="flex items-center">
                    <div className="text-3xl">📊</div>
                    <div>
                      <p className="text-sm font-semibold">View Analytics</p>
                      <p className="text-xs text-muted-foreground">Track your patterns</p>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
