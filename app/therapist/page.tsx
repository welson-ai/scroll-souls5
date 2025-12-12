import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Stethoscope, Users, Shield } from "lucide-react"
import { redirect } from "next/navigation"
import BottomNav from "@/components/bottom-nav"
import Link from "next/link"
import TherapistRegistrationButton from "@/components/therapist-registration-button"
import TherapistGrid from "@/components/therapist-grid"
import TherapistApprovalList from "@/components/therapist-approval-list"

const ADMIN_EMAIL = "jahnetkiminza@gmail.com"

export default async function TherapistHubPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).maybeSingle()

  const isAdmin = profile?.email === ADMIN_EMAIL || user.email === ADMIN_EMAIL

  // Check if user has a therapist application
  const { data: therapistApp } = await supabase.from("therapists").select("*").eq("user_id", user.id).maybeSingle()

  // Fetch approved therapists
  const { data: approvedTherapists } = await supabase
    .from("therapists")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const { data: pendingTherapists } = isAdmin
    ? await supabase.from("therapists").select("*").eq("status", "pending").order("created_at", { ascending: false })
    : { data: null }

  return (
    <div className="min-h-svh bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="glass border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4 sm:gap-4 sm:px-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold sm:text-xl">Therapist Hub</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Connect with licensed mental health professionals
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-4 sm:space-y-6 sm:py-6">
        {/* Therapist Application Status */}
        {therapistApp ? (
          <Card className="glass border-0 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Stethoscope className="h-6 w-6 flex-shrink-0 text-purple-600 sm:h-8 sm:w-8" />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold sm:text-lg">Your Therapist Application</h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Status:{" "}
                  <Badge
                    variant={
                      therapistApp.status === "approved"
                        ? "default"
                        : therapistApp.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {therapistApp.status}
                  </Badge>
                </p>
                {therapistApp.status === "pending" && (
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                    Your application is under review. We&apos;ll notify you once it&apos;s been processed.
                  </p>
                )}
                {therapistApp.status === "approved" && (
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                    Congratulations! Your profile is now visible to users seeking therapy.
                  </p>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="glass border-0 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Stethoscope className="h-6 w-6 flex-shrink-0 text-purple-600 sm:h-8 sm:w-8" />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold sm:text-lg">Become a Therapist</h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Are you a licensed mental health professional? Join our network to help users on their wellness
                  journey.
                </p>
                <div className="mt-4">
                  <TherapistRegistrationButton />
                </div>
              </div>
            </div>
          </Card>
        )}

        {isAdmin && pendingTherapists && pendingTherapists.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold sm:text-xl">Pending Approvals (Admin)</h2>
              <Badge variant="secondary">{pendingTherapists.length}</Badge>
            </div>
            <TherapistApprovalList therapists={pendingTherapists} />
          </div>
        )}

        {/* Available Therapists */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold sm:text-xl">Available Therapists</h2>
          </div>
          <TherapistGrid therapists={approvedTherapists || []} />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
