"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMoodPost(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const emotionId = formData.get("emotionId") as string
  const content = formData.get("content") as string
  const intensity = Number.parseInt(formData.get("intensity") as string)

  if (!emotionId || !content || !intensity) {
    return { success: false, error: "Missing required fields" }
  }

  const { error } = await supabase.from("mood_posts").insert({
    user_id: user.id,
    emotion_id: emotionId,
    content,
    intensity,
    is_anonymous: true,
  })

  if (error) {
    console.error("[v0] Error creating mood post:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/mood-wall")
  return { success: true }
}

export async function addReaction(postId: string, reactionType: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if user already has this specific reaction type
  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("reaction_type", reactionType)
    .maybeSingle()

  if (existing) {
    // Remove this specific reaction if it exists
    const { error } = await supabase.from("post_reactions").delete().eq("id", existing.id)

    if (error) {
      return { success: false, error: error.message }
    }
  } else {
    // Add new reaction (user can have multiple different reaction types)
    const { error } = await supabase.from("post_reactions").insert({
      post_id: postId,
      user_id: user.id,
      reaction_type: reactionType,
    })

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath("/mood-wall")
  return { success: true }
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  if (!content.trim()) {
    return { success: false, error: "Comment cannot be empty" }
  }

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
    is_anonymous: true,
  })

  if (error) {
    console.error("[v0] Error creating comment:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/mood-wall")
  return { success: true }
}
