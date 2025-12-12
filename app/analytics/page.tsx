import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import EmotionChart from "@/components/emotion-chart"
import { Button } from "@/components/ui/button"
import { startOfWeek, endOfWeek, subDays } from "date-fns"
import BottomNav from "@/components/bottom-nav"
import { ArrowLeft } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch check-ins from the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const { data: recentCheckIns } = await supabase
    .from("check_ins")
    .select("*, emotions(*)")
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: true })

  // Fetch emotions
  const { data: emotions } = await supabase.from("emotions").select("*")

  // Calculate emotion breakdown
  const emotionCounts: Record<string, number> = {}
  recentCheckIns?.forEach((checkIn: any) => {
    const emotionId = checkIn.emotion_id
    emotionCounts[emotionId] = (emotionCounts[emotionId] || 0) + 1
  })

  // Get dominant emotion
  const dominantEmotionId = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0]
  const dominantEmotion = emotions?.find((e) => e.id === dominantEmotionId)

  // Calculate this week vs last week
  const thisWeekStart = startOfWeek(new Date())
  const thisWeekEnd = endOfWeek(new Date())
  const { data: thisWeekCheckIns } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", thisWeekStart.toISOString())
    .lte("created_at", thisWeekEnd.toISOString())

  // Total check-ins
  const { count: totalCheckIns } = await supabase
    .from("check_ins")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Total journal entries
  const { count: totalEntries } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Unique emotions experienced
  const { data: uniqueEmotions } = await supabase.from("check_ins").select("emotion_id").eq("user_id", user.id)

  const uniqueEmotionCount = new Set(uniqueEmotions?.map((c: any) => c.emotion_id)).size

  // Average intensity
  const { data: allCheckIns } = await supabase.from("check_ins").select("intensity").eq("user_id", user.id)

  const avgIntensity = allCheckIns?.length
    ? (allCheckIns.reduce((sum: number, c: any) => sum + c.intensity, 0) / allCheckIns.length).toFixed(1)
    : "0"

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      <div className="glass border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Insights into your emotional journey</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-6">
        {totalCheckIns && totalCheckIns > 0 ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Check-ins</CardDescription>
                  <CardTitle className="text-3xl">{totalCheckIns}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Journal Entries</CardDescription>
                  <CardTitle className="text-3xl">{totalEntries}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Written so far</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Emotions Explored</CardDescription>
                  <CardTitle className="text-3xl">{uniqueEmotionCount}/8</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Unique emotions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Avg Intensity</CardDescription>
                  <CardTitle className="text-3xl">{avgIntensity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Out of 5</p>
                </CardContent>
              </Card>
            </div>

            {/* Emotion Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Trends (Last 30 Days)</CardTitle>
                <CardDescription>Track how your emotions change over time</CardDescription>
              </CardHeader>
              <CardContent>
                <EmotionChart checkIns={recentCheckIns || []} emotions={emotions || []} />
              </CardContent>
            </Card>

            {/* Emotion Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
                <CardDescription>Your most common emotions in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(emotionCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([emotionId, count]) => {
                      const emotion = emotions?.find((e) => e.id === emotionId)
                      const percentage = ((count / (recentCheckIns?.length || 1)) * 100).toFixed(0)
                      return (
                        <div key={emotionId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{emotion?.emoji}</span>
                              <span className="font-medium">{emotion?.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {count} times ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: emotion?.color_primary,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            {dominantEmotion && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Insights</CardTitle>
                  <CardDescription>Personalized observations based on your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                    <div className="text-2xl">{dominantEmotion.emoji}</div>
                    <div>
                      <p className="font-medium">Most Frequent Emotion</p>
                      <p className="text-sm text-muted-foreground">
                        {dominantEmotion.name} has been your dominant emotion recently. Consider journaling about what
                        triggers this feeling.
                      </p>
                    </div>
                  </div>

                  {thisWeekCheckIns && thisWeekCheckIns.length > 0 && (
                    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                      <div className="text-2xl">📊</div>
                      <div>
                        <p className="font-medium">Weekly Activity</p>
                        <p className="text-sm text-muted-foreground">
                          You&apos;ve checked in {thisWeekCheckIns.length} time
                          {thisWeekCheckIns.length !== 1 ? "s" : ""} this week. Keep up the consistency!
                        </p>
                      </div>
                    </div>
                  )}

                  {profile && profile.streak_days >= 7 && (
                    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                      <div className="text-2xl">🔥</div>
                      <div>
                        <p className="font-medium">Streak Champion</p>
                        <p className="text-sm text-muted-foreground">
                          Amazing! You&apos;ve maintained a {profile.streak_days}-day streak. Consistency builds
                          self-awareness.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="mb-4 text-5xl">📊</div>
            <h3 className="mb-2 text-xl font-semibold">No data yet</h3>
            <p className="mb-6 text-muted-foreground">Start tracking your emotions to see analytics</p>
            <Button asChild size="lg">
              <Link href="/check-in">Do your first check-in</Link>
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
