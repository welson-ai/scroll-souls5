-- Add org_id column to check_ins table to support organization check-ins
ALTER TABLE public.check_ins
ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Update RLS policies to allow organization members to view organization check-ins
CREATE POLICY "Organization members can view org check-ins" ON public.check_ins
  FOR SELECT USING (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = check_ins.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Allow anonymous check-ins (for landing page)
CREATE POLICY "Anonymous users can insert check-ins" ON public.check_ins
  FOR INSERT WITH CHECK (user_id IS NULL AND org_id IS NULL);

-- Allow organization members to insert org check-ins
CREATE POLICY "Organization members can insert org check-ins" ON public.check_ins
  FOR INSERT WITH CHECK (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = check_ins.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Make user_id nullable to support anonymous check-ins
ALTER TABLE public.check_ins
ALTER COLUMN user_id DROP NOT NULL;
