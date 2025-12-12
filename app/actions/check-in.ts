"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CheckInData {
  userId: string
  emotionId: string
  intensity: number
  triggers: string[]
  isAnonymous?: boolean
}

export async function saveCheckIn(data: CheckInData) {
  const supabase = await createClient()

  try {
    const { data: checkIn, error: checkInError } = await supabase
      .from("check_ins")
      .insert({
        user_id: data.isAnonymous ? null : data.userId,
        emotion_id: data.emotionId,
        intensity: data.intensity,
        triggers: data.triggers,
      })
      .select()
      .single()

    if (checkInError) throw checkInError

    if (!data.isAnonymous) {
      const { data: streakResult, error: streakError } = await supabase.rpc("update_user_streak", {
        p_user_id: data.userId,
      })

      if (streakError) {
        console.error("[v0] Error updating streak:", streakError)
      }

      const { data: xpResult, error: xpError } = await supabase.rpc("add_user_xp", {
        p_user_id: data.userId,
        p_xp_amount: 10,
      })

      if (xpError) {
        console.error("[v0] Error adding XP:", xpError)
      }

      revalidatePath("/check-in")
      revalidatePath("/analytics")
      revalidatePath("/profile")

      return {
        success: true,
        checkInId: checkIn.id,
        newBadges: [],
        levelUp: xpResult?.[0]?.level_up || false,
      }
    }

    revalidatePath("/check-in")

    return {
      success: true,
      checkInId: checkIn.id,
      newBadges: [],
      levelUp: false,
    }
  } catch (error) {
    console.error("[v0] Error in saveCheckIn:", error)
    return { success: false, error: "Failed to save check-in" }
  }
}
