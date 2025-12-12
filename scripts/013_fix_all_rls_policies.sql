-- Fix all RLS policy issues
-- This script removes duplicate/recursive policies and creates clean ones

-- ===================
-- FIX ORGANIZATION_MEMBERS - Remove all and create simple policies
-- ===================
DROP POLICY IF EXISTS "Users can view all memberships (SELECT)" ON organization_members;
DROP POLICY IF EXISTS "Users can join organizations" ON organization_members;
DROP POLICY IF EXISTS "Allow deleting own membership (DELETE)" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization members directly" ON organization_members;
DROP POLICY IF EXISTS "Allow inserting membership records (INSERT)" ON organization_members;
DROP POLICY IF EXISTS "Allow viewing membership records (SELECT)" ON organization_members;
DROP POLICY IF EXISTS "Members can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;

-- Disable RLS temporarily to allow operations
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Simple policies without recursion
CREATE POLICY "select_own_memberships" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert_memberships" ON organization_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "delete_own_memberships" ON organization_members
  FOR DELETE USING (user_id = auth.uid());

-- ===================
-- FIX ORGANIZATIONS - Remove all and create simple policies
-- ===================
DROP POLICY IF EXISTS "Anyone can view organizations (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their org (UPDATE)" ON organizations;
DROP POLICY IF EXISTS "Owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they're members of (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they own or belong to" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they own (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations (INSERT)" ON organizations;
DROP POLICY IF EXISTS "Owners can view their organizations (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Organization owners can delete their org (DELETE)" ON organizations;

-- Disable RLS temporarily
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "select_own_organizations" ON organizations
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "insert_organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "update_own_organizations" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "delete_own_organizations" ON organizations
  FOR DELETE USING (owner_id = auth.uid());

-- ===================
-- FIX THERAPISTS - Allow admin to update any therapist
-- ===================
DROP POLICY IF EXISTS "Users can update their own pending application" ON therapists;

-- Allow users to update their own OR allow admin (jahnetkiminza@gmail.com) to update any
CREATE POLICY "update_therapists" ON therapists
  FOR UPDATE USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'jahnetkiminza@gmail.com'
    )
  );

-- ===================
-- FIX CHECK_INS - Allow global read for landing page stats
-- ===================
DROP POLICY IF EXISTS "Users can view their own check-ins" ON check_ins;

-- Allow users to see own check-ins AND allow public count queries
CREATE POLICY "select_check_ins" ON check_ins
  FOR SELECT USING (true);
