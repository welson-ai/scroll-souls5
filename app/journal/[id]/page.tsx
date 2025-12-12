import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import JournalEntryActions from "@/components/journal-entry-actions"
import BottomNav from "@/components/bottom-nav"

export default async function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch journal entry with emotion data
  const { data: entry, error } = await supabase
    .from("journal_entries")
    .select(
      `
      *,
      emotions (
        id,
        name,
        emoji,
        color_primary
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !entry) {
    notFound()
  }

  const getBgGradient = () => {
    const emotionColors: Record<string, string> = {
      joy: "from-yellow-50 to-amber-50",
      sadness: "from-blue-50 to-sky-50",
      anger: "from-red-50 to-orange-50",
      fear: "from-purple-50 to-violet-50",
      stress: "from-teal-50 to-cyan-50",
      peace: "from-green-50 to-emerald-50",
      love: "from-pink-50 to-rose-50",
      tired: "from-gray-50 to-slate-50",
    }
    return emotionColors[entry.emotions?.id] || "from-blue-50 to-purple-50"
  }

  return (
    <div className={`min-h-svh bg-gradient-to-br ${getBgGradient()} pb-20`}>
      <header className="border-b bg-white/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/journal" className="text-sm text-muted-foreground hover:underline">
            ← Back to Journal
          </Link>
          <JournalEntryActions entryId={entry.id} userId={user.id} isFavorite={entry.is_favorite} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Card className="p-8 shadow-lg">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{entry.emotions?.emoji}</div>
              <div>
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: entry.emotions?.color_primary + "20", borderColor: "transparent" }}
                >
                  {entry.emotions?.name}
                </Badge>
              </div>
            </div>
            {entry.is_favorite && <span className="text-3xl">⭐</span>}
          </div>

          {entry.title && <h1 className="mb-4 text-3xl font-bold">{entry.title}</h1>}

          <div className="mb-6 text-sm text-muted-foreground">
            {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{entry.content}</p>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
