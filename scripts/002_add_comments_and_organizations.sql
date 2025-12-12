-- Add comments table for mood posts
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.mood_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  is_anonymous boolean default true,
  created_at timestamp with time zone default now()
);

-- Add organizations table
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete cascade not null,
  access_code text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add organization members table
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'therapist', 'member')),
  joined_at timestamp with time zone default now(),
  unique(org_id, user_id)
);

-- Add org_id to mood_posts for organization-specific posts
alter table public.mood_posts add column if not exists org_id uuid references public.organizations(id) on delete cascade;
alter table public.mood_posts add column if not exists anonymous_user_hash text;

-- Enable RLS
alter table public.post_comments enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- RLS for comments
create policy "Anyone can view comments"
  on public.post_comments for select
  to authenticated
  using (true);

create policy "Users can create comments"
  on public.post_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.post_comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS for organizations
create policy "Members can view their organizations"
  on public.organizations for select
  to authenticated
  using (
    exists (
      select 1 from public.organization_members
      where org_id = id and user_id = auth.uid()
    )
  );

create policy "Users can create organizations"
  on public.organizations for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Owners can update their organizations"
  on public.organizations for update
  to authenticated
  using (auth.uid() = owner_id);

-- RLS for organization_members
create policy "Members can view org members"
  on public.organization_members for select
  to authenticated
  using (
    exists (
      select 1 from public.organization_members om
      where om.org_id = org_id and om.user_id = auth.uid()
    )
  );

create policy "Users can join organizations"
  on public.organization_members for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Update mood_posts RLS to handle organization posts
drop policy if exists "Anyone can view mood posts" on public.mood_posts;
create policy "Anyone can view public mood posts or org posts they're member of"
  on public.mood_posts for select
  to authenticated
  using (
    org_id is null or
    exists (
      select 1 from public.organization_members
      where org_id = mood_posts.org_id and user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_post_comments_post_id on public.post_comments(post_id);
create index if not exists idx_organization_members_org_id on public.organization_members(org_id);
create index if not exists idx_organization_members_user_id on public.organization_members(user_id);
create index if not exists idx_mood_posts_org_id on public.mood_posts(org_id);
