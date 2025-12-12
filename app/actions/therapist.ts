"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createServiceClient } from "@/lib/supabase/service"

const ADMIN_EMAIL = "jahnetkiminza@gmail.com"

export async function registerAsTherapist(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const therapistData = {
    user_id: user.id,
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    license_number: formData.get("license_number") as string,
    specialization: formData.get("specialization") as string,
    years_of_experience: Number.parseInt(formData.get("years_of_experience") as string),
    bio: formData.get("bio") as string,
    qualifications: formData.get("qualifications") as string,
    approach: formData.get("approach") as string,
    availability: formData.get("availability") as string,
    session_rate: formData.get("session_rate") as string,
    status: "pending",
  }

  const { error } = await supabase.from("therapists").insert(therapistData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/therapist")
  return { success: true }
}

export async function bookTherapist(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const bookingData = {
    therapist_id: formData.get("therapist_id") as string,
    user_id: user.id,
    session_date: formData.get("session_date") as string,
    session_type: formData.get("session_type") as string,
    notes: formData.get("notes") as string,
    status: "pending",
  }

  const { error } = await supabase.from("therapist_bookings").insert(bookingData)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function sendTherapistMessage(therapistId: string, message: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("therapist_messages").insert({
    therapist_id: therapistId,
    user_id: user.id,
    sender_type: "user",
    message: message,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getTherapistMessages(therapistId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: messages, error } = await supabase
    .from("therapist_messages")
    .select("*")
    .eq("therapist_id", therapistId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { success: true, messages }
}

export async function approveTherapist(therapistId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).maybeSingle()
  const isAdmin = profile?.email === ADMIN_EMAIL || user.email === ADMIN_EMAIL

  if (!isAdmin) {
    return { success: false, error: "Only admins can approve therapists" }
  }

  // Use service role key to bypass RLS for admin operations
  const serviceSupabase = createServiceClient()

  const { error } = await serviceSupabase
    .from("therapists")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", therapistId)

  if (error) {
    console.error("[v0] Error approving therapist:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/therapist")
  return { success: true }
}

export async function rejectTherapist(therapistId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).maybeSingle()
  const isAdmin = profile?.email === ADMIN_EMAIL || user.email === ADMIN_EMAIL

  if (!isAdmin) {
    return { success: false, error: "Only admins can reject therapists" }
  }

  // Use service role key to bypass RLS for admin operations
  const serviceSupabase = createServiceClient()

  const { error } = await serviceSupabase.from("therapists").update({ status: "rejected" }).eq("id", therapistId)

  if (error) {
    console.error("[v0] Error rejecting therapist:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/therapist")
  return { success: true }
}
