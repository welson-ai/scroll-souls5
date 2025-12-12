import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import BottomNav from "@/components/bottom-nav"
import { ArrowLeft } from "lucide-react"

export default async function JournalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch journal entries with emotion data
  const { data: entries } = await supabase
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      <div className="glass border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">My Journal</h1>
              <p className="text-sm text-muted-foreground">Your emotional journey in words</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/journal/new">New Entry</Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Journal</h2>
            <p className="mt-1 text-muted-foreground">Your emotional journey in words</p>
          </div>
          <Button asChild size="lg">
            <Link href="/journal/new">New Entry</Link>
          </Button>
        </div>

        {entries && entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry: any) => (
              <Link key={entry.id} href={`/journal/${entry.id}`}>
                <Card className="cursor-pointer p-6 transition-all hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{entry.emotions?.emoji}</div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        {entry.title && <h3 className="text-lg font-semibold line-clamp-1">{entry.title}</h3>}
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: entry.emotions?.color_primary + "20", borderColor: "transparent" }}
                        >
                          {entry.emotions?.name}
                        </Badge>
                        {entry.is_favorite && <span className="text-yellow-500">⭐</span>}
                      </div>
                      <p className="mb-3 text-muted-foreground line-clamp-2">{entry.content}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="mb-4 text-5xl">📝</div>
            <h3 className="mb-2 text-xl font-semibold">No journal entries yet</h3>
            <p className="mb-6 text-muted-foreground">Start expressing your thoughts and feelings</p>
            <Button asChild size="lg">
              <Link href="/journal/new">Write your first entry</Link>
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
