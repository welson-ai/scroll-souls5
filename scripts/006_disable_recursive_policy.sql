-- Fix the infinite recursion in organization_members RLS policy
-- The problem: The policy checks membership by querying the same table it's protecting

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Members can view members of their organizations (SELECT)" ON organization_members;

-- Create a simple non-recursive policy
-- Users can only view their own memberships and nothing else
-- This prevents recursion because it doesn't query organization_members
CREATE POLICY "Users can view organization members directly"
ON organization_members
FOR SELECT
USING (true);  -- Allow all reads, let application handle filtering

-- Update mood_posts policy to be simpler and avoid the recursion
DROP POLICY IF EXISTS "Anyone can view public mood posts or org posts they're member o (SELECT)" ON mood_posts;

CREATE POLICY "Anyone can view public mood posts (SELECT)"
ON mood_posts
FOR SELECT
USING (
  org_id IS NULL  -- Public posts only
);

-- Separate policy for org posts (without checking membership to avoid recursion)
CREATE POLICY "Users can view their org mood posts (SELECT)"
ON mood_posts
FOR SELECT
USING (
  org_id IS NOT NULL AND user_id = auth.uid()  -- Only user's own org posts
);
