"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface JournalEntryData {
  userId: string
  emotionId: string
  title: string
  content: string
  checkInId?: string
}

export async function saveJournalEntry(data: JournalEntryData) {
  const supabase = await createClient()

  try {
    // Insert journal entry
    const { data: entry, error: entryError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: data.userId,
        emotion_id: data.emotionId,
        title: data.title || null,
        content: data.content,
        check_in_id: data.checkInId || null,
      })
      .select()
      .single()

    if (entryError) throw entryError

    // Add XP for journal entry (20 XP per entry)
    const { error: xpError } = await supabase.rpc("add_user_xp", {
      p_user_id: data.userId,
      p_xp_amount: 20,
    })

    if (xpError) {
      console.error("[v0] Error adding XP:", xpError)
    }

    // Check and award badges
    // const { error: badgesError } = await supabase.rpc("check_and_award_badges", {
    //   p_user_id: data.userId,
    // })

    // if (badgesError) {
    //   console.error("[v0] Error checking badges:", badgesError)
    // }

    revalidatePath("/journal")
    revalidatePath("/profile")

    return { success: true, entryId: entry.id }
  } catch (error) {
    console.error("[v0] Error in saveJournalEntry:", error)
    return { success: false, error: "Failed to save journal entry" }
  }
}

export async function toggleFavorite(entryId: string, userId: string, isFavorite: boolean) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("journal_entries")
      .update({ is_favorite: isFavorite })
      .eq("id", entryId)
      .eq("user_id", userId)

    if (error) throw error

    revalidatePath("/journal")
    revalidatePath(`/journal/${entryId}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error toggling favorite:", error)
    return { success: false }
  }
}

export async function deleteJournalEntry(entryId: string, userId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("journal_entries").delete().eq("id", entryId).eq("user_id", userId)

    if (error) throw error

    revalidatePath("/journal")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting entry:", error)
    return { success: false }
  }
}
