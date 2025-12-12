-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Members can view org members" ON public.organization_members;
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;

-- Simple policy: users can view their own membership records
CREATE POLICY "Users can view their own memberships"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can view organizations they own
CREATE POLICY "Users can view organizations they own or belong to"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR
    -- Check if user is a member by directly comparing user_id
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.org_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Allow users to view all members of organizations they belong to (but avoid recursion)
-- We'll do this by allowing authenticated users to query, and handle filtering in application code
-- Or create a more permissive policy that doesn't recurse

CREATE POLICY "Members can view members of their organizations"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (
    -- User can see their own membership
    user_id = auth.uid()
    OR
    -- User can see other members if they share an org
    -- This works because we check the user's direct membership first
    EXISTS (
      SELECT 1 FROM public.organization_members my_memberships
      WHERE my_memberships.user_id = auth.uid()
      AND my_memberships.org_id = organization_members.org_id
    )
  );
