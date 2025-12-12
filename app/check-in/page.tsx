import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EmotionCheckIn from "@/components/emotion-check-in"
import BottomNav from "@/components/bottom-nav"

export default async function CheckInPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch emotions from database
  const { data: emotions } = await supabase.from("emotions").select("*").order("id")

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <>
      <EmotionCheckIn emotions={emotions || []} profile={profile} userId={user.id} />
      <BottomNav />
    </>
  )
}
