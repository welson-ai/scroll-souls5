import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2 } from "lucide-react"
import { redirect } from "next/navigation"
import BottomNav from "@/components/bottom-nav"
import Link from "next/link"
import CreateOrganizationButton from "@/components/create-organization-button"
import OrganizationCard from "@/components/organization-card"

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: memberOrgs } = await serviceClient
    .from("organization_members")
    .select("org_id, organizations(id, name, description, owner_id, created_at)")
    .eq("user_id", user.id)

  const organizations = memberOrgs?.map((m: any) => m.organizations).filter(Boolean) || []

  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20">
      <div className="glass border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-4 sm:gap-4 sm:px-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold sm:text-xl">Organizations</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Private emotional wellness spaces</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-4 sm:space-y-6 sm:py-6">
        <Card className="glass border-0 p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold sm:text-lg">Create a Wellness Space</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Build a private organization for your team to share emotions and insights
              </p>
            </div>
          </div>
          <CreateOrganizationButton />
        </Card>

        {organizations.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold sm:text-base">Your Organizations ({organizations.length})</h3>
            {organizations.map((org: any) => (
              <OrganizationCard key={org.id} organization={org} currentUserId={user.id} />
            ))}
          </div>
        ) : (
          <Card className="glass border-0 p-8 text-center sm:p-12">
            <div className="mb-4 text-4xl sm:text-6xl">🏢</div>
            <p className="mb-2 text-base font-semibold sm:text-lg">No Organizations Yet</p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Create an organization to build a team wellness space
            </p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
