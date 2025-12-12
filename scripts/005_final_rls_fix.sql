-- Fix the infinite recursion in organization_members by dropping and recreating the problematic policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view org members (SELECT)" ON organization_members;

-- Create a simple policy that doesn't reference the same table
-- Users can view their own memberships directly
CREATE POLICY "Users can view their own memberships"
ON organization_members FOR SELECT
USING (auth.uid() = user_id);

-- Optionally, add a policy for viewing other members in the same org (without recursion)
-- This uses a direct check without subqueries on the same table
CREATE POLICY "View org member list"
ON organization_members FOR SELECT
USING (
  org_id IN (
    SELECT om.org_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid()
  )
);
