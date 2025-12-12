-- Fix infinite recursion in organization_members RLS policy
drop policy if exists "Members can view org members" on public.organization_members;

-- Create non-recursive policy that directly checks auth.uid()
create policy "Members can view org members"
  on public.organization_members for select
  to authenticated
  using (
    -- Users can see members of orgs they belong to
    org_id in (
      select org_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Also fix the organizations policy to avoid recursion
drop policy if exists "Members can view their organizations" on public.organizations;

-- Create direct policy without recursive member check
create policy "Members can view their organizations"
  on public.organizations for select
  to authenticated
  using (
    -- Users can see orgs they own or are members of
    owner_id = auth.uid() or
    id in (
      select org_id from public.organization_members
      where user_id = auth.uid()
    )
  );
