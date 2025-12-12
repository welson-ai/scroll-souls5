"use server"

import { revalidatePath } from "next/cache"

function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createOrganization(name: string, description: string) {
  const { createClient } = await import("@supabase/supabase-js")

  // We need to get auth from cookies - use server client
  const { createClient: createServerClient } = await import("@/lib/supabase/server")
  const serverSupabase = await createServerClient()

  const {
    data: { user },
  } = await serverSupabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Use service role client to bypass RLS
  const serviceSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const accessCode = generateAccessCode()

    // Create organization using service role
    const { data: org, error: orgError } = await serviceSupabase
      .from("organizations")
      .insert({
        name,
        description,
        owner_id: user.id,
        access_code: accessCode,
      })
      .select()
      .single()

    if (orgError) {
      console.error("[v0] Org creation error:", orgError.message)
      throw orgError
    }

    const { error: memberError } = await serviceSupabase.from("organization_members").insert({
      org_id: org.id,
      user_id: user.id,
      role: "owner",
    })

    if (memberError) {
      console.error("[v0] Member creation error:", memberError.message)
      throw memberError
    }

    revalidatePath("/organizations")
    return { success: true, orgId: org.id }
  } catch (error: any) {
    console.error("[v0] Error creating organization:", error?.message || error)
    return { success: false, error: error?.message || "Failed to create organization" }
  }
}

export async function addMembersToOrganization(organizationId: string, userIds: string[]) {
  const { createClient } = await import("@supabase/supabase-js")

  // Use service role client to bypass RLS
  const serviceSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const memberInserts = userIds.map((userId) => ({
      org_id: organizationId,
      user_id: userId,
      role: "member",
    }))

    const { error } = await serviceSupabase.from("organization_members").insert(memberInserts)

    if (error) throw error

    revalidatePath("/organizations")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error adding members:", error)
    return { success: false, error: "Failed to add members" }
  }
}
