-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view organizations they own or belong to (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Users can update their own organizations (UPDATE)" ON organizations;
DROP POLICY IF EXISTS "Users can delete their own organizations (DELETE)" ON organizations;
DROP POLICY IF EXISTS "Users can insert organizations (INSERT)" ON organizations;
DROP POLICY IF EXISTS "Members can view org members (SELECT)" ON organization_members;
DROP POLICY IF EXISTS "Users can add themselves as members (INSERT)" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own memberships (SELECT)" ON organization_members;

-- Create new non-recursive policies for organizations table
CREATE POLICY "Users can view organizations they own (SELECT)" 
ON organizations FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can view organizations they're members of (SELECT)" 
ON organizations FOR SELECT 
USING (
  id IN (
    SELECT org_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create organizations (INSERT)" 
ON organizations FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Organization owners can update their org (UPDATE)" 
ON organizations FOR UPDATE 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Organization owners can delete their org (DELETE)" 
ON organizations FOR DELETE 
USING (auth.uid() = owner_id);

-- Create simpler, non-recursive policies for organization_members table
CREATE POLICY "Allow viewing membership records (SELECT)" 
ON organization_members FOR SELECT 
USING (
  auth.uid() = user_id 
  OR auth.uid() IN (SELECT owner_id FROM organizations WHERE id = org_id)
);

CREATE POLICY "Allow inserting membership records (INSERT)" 
ON organization_members FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT owner_id FROM organizations WHERE id = org_id)
);

CREATE POLICY "Allow deleting own membership (DELETE)" 
ON organization_members FOR DELETE 
USING (
  auth.uid() = user_id 
  OR auth.uid() IN (SELECT owner_id FROM organizations WHERE id = org_id)
);

-- Ensure RLS is enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
