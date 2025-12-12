-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_check_in_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emotions table (reference data)
CREATE TABLE IF NOT EXISTS public.emotions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color_primary TEXT NOT NULL,
  color_secondary TEXT,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert emotion reference data
INSERT INTO public.emotions (id, name, color_primary, color_secondary, emoji) VALUES
  ('joy', 'Joy', '#FCD34D', '#FEF3C7', '😊'),
  ('sadness', 'Sadness', '#60A5FA', '#DBEAFE', '😢'),
  ('anger', 'Anger', '#F87171', '#FEE2E2', '😠'),
  ('fear', 'Fear', '#A78BFA', '#EDE9FE', '😨'),
  ('stress', 'Stress', '#6EE7B7', '#D1FAE5', '😰'),
  ('peace', 'Peace', '#34D399', '#D1FAE5', '😌'),
  ('love', 'Love', '#F9A8D4', '#FCE7F3', '❤️'),
  ('tired', 'Tired', '#D1D5DB', '#F3F4F6', '😴')
ON CONFLICT (id) DO NOTHING;

-- Create check_ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion_id TEXT NOT NULL REFERENCES public.emotions(id),
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  triggers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  emotion_id TEXT NOT NULL REFERENCES public.emotions(id),
  title TEXT,
  content TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table (reference data)
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert badge reference data
INSERT INTO public.badges (id, name, description, icon, requirement_type, requirement_value) VALUES
  ('first_check_in', 'First Steps', 'Complete your first check-in', '🌱', 'check_ins', 1),
  ('week_streak', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 7),
  ('month_streak', 'Monthly Master', 'Maintain a 30-day streak', '⭐', 'streak', 30),
  ('ten_entries', 'Storyteller', 'Write 10 journal entries', '📖', 'entries', 10),
  ('fifty_entries', 'Chronicler', 'Write 50 journal entries', '📚', 'entries', 50),
  ('all_emotions', 'Emotion Explorer', 'Experience all 8 emotions', '🎭', 'unique_emotions', 8)
ON CONFLICT (id) DO NOTHING;

-- Create user_badges table (junction table)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create mood_insights table
CREATE TABLE IF NOT EXISTS public.mood_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_date DATE NOT NULL,
  dominant_emotion_id TEXT REFERENCES public.emotions(id),
  total_check_ins INTEGER DEFAULT 0,
  emotional_variety INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, insight_date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_insights ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Check-ins policies
CREATE POLICY "Users can view their own check-ins" ON public.check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins" ON public.check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins" ON public.check_ins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins" ON public.check_ins
  FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- User badges policies
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mood insights policies
CREATE POLICY "Users can view their own insights" ON public.mood_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights" ON public.mood_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" ON public.mood_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow public read access to reference tables
ALTER TABLE public.emotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view emotions" ON public.emotions FOR SELECT USING (true);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
