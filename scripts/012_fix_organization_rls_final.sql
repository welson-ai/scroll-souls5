-- Fix infinite recursion in organization_members RLS policies
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view organization members directly (SELECT)" ON organization_members;
DROP POLICY IF EXISTS "Members can view members of their organizations (SELECT)" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own memberships (SELECT)" ON organization_members;
DROP POLICY IF EXISTS "Users can view all memberships (SELECT) (SELECT)" ON organization_members;
DROP POLICY IF EXISTS "Allow viewing membership records (SELECT) (SELECT)" ON organization_members;

DROP POLICY IF EXISTS "Users can view organizations they own or belong to (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they own (SELECT) (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Owners can view their organizations (SELECT) (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they're members of (SELECT) (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Anyone can view organizations (SELECT) (SELECT)" ON organizations;

-- Create simple, non-recursive policies for organization_members
CREATE POLICY "Users can view all organization memberships"
  ON organization_members FOR SELECT
  USING (true);

CREATE POLICY "Users can insert organization memberships"
  ON organization_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own memberships"
  ON organization_members FOR DELETE
  USING (user_id = auth.uid());

-- Create simple, non-recursive policies for organizations
CREATE POLICY "Users can view organizations they own"
  ON organizations FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their organizations"
  ON organizations FOR DELETE
  USING (owner_id = auth.uid());
