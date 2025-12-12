-- Create mood_posts table for community mood sharing
create table if not exists public.mood_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  emotion_id text references public.emotions(id) not null,
  content text not null,
  intensity integer not null check (intensity >= 1 and intensity <= 5),
  is_anonymous boolean default true,
  reaction_count jsonb default '{"support": 0, "relate": 0, "uplift": 0}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create post_reactions table for tracking user reactions
create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.mood_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  reaction_type text not null check (reaction_type in ('support', 'relate', 'uplift')),
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

-- Enable Row Level Security
alter table public.mood_posts enable row level security;
alter table public.post_reactions enable row level security;

-- RLS Policies for mood_posts
create policy "Anyone can view mood posts"
  on public.mood_posts for select
  to authenticated
  using (true);

create policy "Users can create their own mood posts"
  on public.mood_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own mood posts"
  on public.mood_posts for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own mood posts"
  on public.mood_posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policies for post_reactions
create policy "Anyone can view reactions"
  on public.post_reactions for select
  to authenticated
  using (true);

create policy "Users can add their own reactions"
  on public.post_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own reactions"
  on public.post_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- Function to update reaction counts
create or replace function public.update_post_reaction_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.mood_posts
    set reaction_count = jsonb_set(
      reaction_count,
      array[new.reaction_type],
      to_jsonb((reaction_count->>new.reaction_type)::int + 1)
    )
    where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.mood_posts
    set reaction_count = jsonb_set(
      reaction_count,
      array[old.reaction_type],
      to_jsonb(greatest((reaction_count->>old.reaction_type)::int - 1, 0))
    )
    where id = old.post_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Trigger to automatically update reaction counts
create trigger on_reaction_change
  after insert or delete on public.post_reactions
  for each row execute function public.update_post_reaction_count();

-- Index for better performance
create index if not exists idx_mood_posts_created_at on public.mood_posts(created_at desc);
create index if not exists idx_post_reactions_post_id on public.post_reactions(post_id);
create index if not exists idx_post_reactions_user_id on public.post_reactions(user_id);
