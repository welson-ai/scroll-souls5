-- Function to update user XP and level
CREATE OR REPLACE FUNCTION public.add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS TABLE (new_level INTEGER, new_xp INTEGER, level_up BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_xp_for_next_level INTEGER;
  v_level_up BOOLEAN := FALSE;
BEGIN
  -- Get current XP and level
  SELECT total_xp, current_level INTO v_current_xp, v_current_level
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Calculate new XP
  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := v_current_level;
  
  -- Check for level up (100 XP per level)
  v_xp_for_next_level := v_current_level * 100;
  
  WHILE v_new_xp >= v_xp_for_next_level LOOP
    v_new_level := v_new_level + 1;
    v_xp_for_next_level := v_new_level * 100;
    v_level_up := TRUE;
  END LOOP;
  
  -- Update profile
  UPDATE public.profiles
  SET total_xp = v_new_xp,
      current_level = v_new_level,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN QUERY SELECT v_new_level, v_new_xp, v_level_up;
END;
$$;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE (badge_id TEXT, badge_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_check_in_count INTEGER;
  v_entry_count INTEGER;
  v_unique_emotions INTEGER;
  v_streak INTEGER;
  v_badge RECORD;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO v_check_in_count FROM public.check_ins WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_entry_count FROM public.journal_entries WHERE user_id = p_user_id;
  SELECT COUNT(DISTINCT emotion_id) INTO v_unique_emotions FROM public.check_ins WHERE user_id = p_user_id;
  SELECT streak_days INTO v_streak FROM public.profiles WHERE id = p_user_id;
  
  -- Check each badge requirement
  FOR v_badge IN SELECT b.id, b.name, b.requirement_type, b.requirement_value
                 FROM public.badges b
                 WHERE NOT EXISTS (
                   SELECT 1 FROM public.user_badges ub 
                   WHERE ub.user_id = p_user_id AND ub.badge_id = b.id
                 )
  LOOP
    IF (v_badge.requirement_type = 'check_ins' AND v_check_in_count >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'entries' AND v_entry_count >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'unique_emotions' AND v_unique_emotions >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'streak' AND v_streak >= v_badge.requirement_value)
    THEN
      -- Award the badge
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      RETURN QUERY SELECT v_badge.id, v_badge.name;
    END IF;
  END LOOP;
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_check_in DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  SELECT last_check_in_date, streak_days INTO v_last_check_in, v_current_streak
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- If no previous check-in, start streak at 1
  IF v_last_check_in IS NULL THEN
    v_new_streak := 1;
  -- If last check-in was yesterday, increment streak
  ELSIF v_last_check_in = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_current_streak + 1;
  -- If last check-in was today, keep current streak
  ELSIF v_last_check_in = CURRENT_DATE THEN
    v_new_streak := v_current_streak;
  -- If last check-in was more than a day ago, reset streak
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET streak_days = v_new_streak,
      last_check_in_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN v_new_streak;
END;
$$;
