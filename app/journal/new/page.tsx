import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import JournalEntryForm from "@/components/journal-entry-form"

export default async function NewJournalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch emotions
  const { data: emotions } = await supabase.from("emotions").select("*").order("id")

  // Get the latest check-in to pre-select emotion
  const { data: latestCheckIn } = await supabase
    .from("check_ins")
    .select("*, emotions(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return <JournalEntryForm emotions={emotions || []} userId={user.id} latestCheckIn={latestCheckIn} />
}
