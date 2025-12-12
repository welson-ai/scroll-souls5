import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { Sparkles, TrendingUp, Users, Heart, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import CheckInButton from "@/components/check-in-button"
import EmotionPieChartSimple from "@/components/emotion-pie-chart-simple"

const EMOTION_COLORS = {
  Joy: "#fde047",
  Sadness: "#60a5fa",
  Anger: "#f87171",
  Fear: "#a78bfa",
  Stress: "#fb923c",
  Peace: "#14b8a6",
  Love: "#f472b6",
  Tired: "#a8a29e",
}

export default async function LandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let recentCheckIns: any[] = []
  let emotions: any[] | null = null

  try {
    // Fetch recent public check-ins (limited sample for stats display)
    const { data, error } = await supabase
      .from("check_ins")
      .select("*, emotions(id, name, emoji, color_primary)")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error && data) {
      recentCheckIns = data
    }
  } catch (error) {
    // Silently fail - landing page should work even without stats
  }

  try {
    const { data } = await supabase.from("emotions").select("*").order("name")
    emotions = data
  } catch (error) {
    // Silently fail
  }

  // Calculate stats from available data
  const emotionCounts: Record<string, { name: string; count: number; color: string }> = {}

  recentCheckIns?.forEach((checkIn: any) => {
    const emotionName = checkIn.emotions?.name
    if (emotionName) {
      if (!emotionCounts[emotionName]) {
        emotionCounts[emotionName] = {
          name: emotionName,
          count: 0,
          color: EMOTION_COLORS[emotionName as keyof typeof EMOTION_COLORS] || "#94a3b8",
        }
      }
      emotionCounts[emotionName].count++
    }
  })

  const chartData = Object.values(emotionCounts).map((stat) => ({
    name: stat.name,
    value: stat.count,
    color: stat.color,
  }))

  const topEmotion =
    chartData.length > 0 ? chartData.reduce((prev, current) => (prev.value > current.value ? prev : current)) : null

  const serializedEmotions = emotions ? JSON.parse(JSON.stringify(emotions)) : null

  return (
    <div className="min-h-svh bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Getting Started Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="animate-pulse rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-1">
              <div className="rounded-full bg-white p-4">
                <Sparkles className="h-8 w-8 text-purple-500 sm:h-10 sm:w-10" />
              </div>
            </div>
          </div>
          <h1 className="mb-2 text-balance bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl md:text-4xl">
            Scroll Souls
          </h1>
          <p className="mx-auto mb-3 max-w-2xl text-balance text-sm font-medium text-gray-700 sm:text-base">
            Start Your Emotional Wellness Journey Today
          </p>
        </div>

        {/* CTA Section - Getting Started Box */}
        <div className="glass mb-12 rounded-3xl bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6 text-center shadow-xl sm:p-10">
          <Heart className="mx-auto mb-3 h-12 w-12 text-pink-500 sm:mb-4 sm:h-16 sm:w-16" />
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
            {user ? "Welcome Back" : "Join Our Community"}
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-balance text-xs text-gray-700 sm:mb-8 sm:text-sm">
            {user
              ? "Track your emotions, connect with others, and gain insights into your emotional wellbeing."
              : "Track your emotions anonymously and be part of a supportive community."}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            {user ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-sm sm:h-12 sm:px-10 sm:text-base"
                >
                  <Link href="/home">Go to Dashboard</Link>
                </Button>
                {serializedEmotions && <CheckInButton emotions={serializedEmotions} userId={user.id} />}
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-sm sm:h-12 sm:px-10 sm:text-base"
                >
                  <Link href="/auth/sign-up">Get Started Free</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-full border-2 border-purple-600 bg-white px-8 text-sm text-purple-600 hover:bg-purple-50 sm:h-12 sm:px-10 sm:text-base"
                >
                  <Link href="/auth/login">Log In</Link>
                </Button>
                {serializedEmotions && <CheckInButton emotions={serializedEmotions} />}
              </>
            )}
          </div>
        </div>

        {/* Global Stats Section */}
        {chartData.length > 0 && (
          <>
            <Card className="glass mb-12 border-0 p-4 shadow-2xl sm:p-6 md:p-8">
              <h2 className="mb-6 text-center text-base font-bold text-gray-900 sm:text-lg">
                Recent Emotion Distribution
              </h2>
              <EmotionPieChartSimple data={chartData} />
            </Card>

            {/* Stats Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <Card className="glass group border-0 p-4 transition-all hover:scale-105 hover:shadow-xl sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="rounded-full bg-purple-100 p-2 transition-colors group-hover:bg-purple-200 sm:p-3">
                    <Users className="h-6 w-6 text-purple-600 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">Growing</p>
                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">Community</p>
                  </div>
                </div>
              </Card>

              <Card className="glass group border-0 p-4 transition-all hover:scale-105 hover:shadow-xl sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="rounded-full bg-green-100 p-2 transition-colors group-hover:bg-green-200 sm:p-3">
                    <TrendingUp className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{recentCheckIns.length}+</p>
                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">Recent Check-ins</p>
                  </div>
                </div>
              </Card>

              <Card className="glass group border-0 p-4 transition-all hover:scale-105 hover:shadow-xl sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="rounded-full bg-yellow-100 p-2 transition-colors group-hover:bg-yellow-200 sm:p-3">
                    <Zap className="h-6 w-6 text-yellow-600 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{topEmotion?.name || "—"}</p>
                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">Top Emotion</p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Features Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:p-6">
            <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl">😊</div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">Emotion Check-ins</h3>
            <p className="text-xs text-gray-700 sm:text-sm">Quick daily check-ins to track how you feel</p>
          </div>
          <div className="group rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:p-6">
            <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl">📝</div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">Journaling</h3>
            <p className="text-xs text-gray-700 sm:text-sm">Express your thoughts and feelings freely</p>
          </div>
          <div className="group rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:p-6">
            <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl">📊</div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">Analytics</h3>
            <p className="text-xs text-gray-700 sm:text-sm">Visualize patterns in your emotional journey</p>
          </div>
          <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:p-6">
            <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl">🏆</div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">Gamification</h3>
            <p className="text-xs text-gray-700 sm:text-sm">Earn badges and level up your wellness</p>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center sm:py-8">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Made with care for your emotional well-being ❤️</p>
        </div>
      </footer>
    </div>
  )
}
