-- Drop the problematic recursive policy and replace with simple non-recursive ones
-- This script fixes the infinite recursion issue in organization_members

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view organizations they own or belong to (SELECT)" ON organizations;
DROP POLICY IF EXISTS "Members can view members of their organizations (SELECT)" ON organization_members;
DROP POLICY IF EXISTS "Users can view their org mood posts (SELECT)" ON mood_posts;

-- Replace with simple, non-recursive policies
-- Organizations: Users can view organizations they own directly (no subquery)
CREATE POLICY "Owners can view their organizations (SELECT)"
ON organizations FOR SELECT
USING (auth.uid() = owner_id);

-- Organizations: Users can view all organizations (let app filter by membership)
CREATE POLICY "Anyone can view organizations (SELECT)"
ON organizations FOR SELECT
USING (true);

-- Organization Members: Simple policy - users can view all memberships
-- (The app will filter to show only relevant ones)
CREATE POLICY "Users can view all memberships (SELECT)"
ON organization_members FOR SELECT
USING (true);

-- Mood Posts: Separate the public and org post policies to avoid recursion
-- Public posts can be viewed by anyone
CREATE POLICY "View public mood posts (SELECT)"
ON mood_posts FOR SELECT
USING (org_id IS NULL);

-- Org posts: For now, allow all authenticated users to view
-- (The app should handle org-specific filtering)
CREATE POLICY "View org mood posts (SELECT)"
ON mood_posts FOR SELECT
USING (org_id IS NOT NULL AND auth.uid() IS NOT NULL);
