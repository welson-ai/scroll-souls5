-- Fix the organization_members role check constraint to allow owner, admin, and member roles
-- First drop the existing constraint
ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;

-- Add new constraint with all needed role values
ALTER TABLE organization_members ADD CONSTRAINT organization_members_role_check 
  CHECK (role IN ('owner', 'admin', 'member'));
