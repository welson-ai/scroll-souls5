-- Fix the ambiguous badge_id column reference by using table aliases properly
DROP FUNCTION IF EXISTS public.check_and_award_badges(UUID);

CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE (awarded_badge_id TEXT, awarded_badge_name TEXT)
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
      
      -- Return the awarded badge with renamed columns to avoid ambiguity
      awarded_badge_id := v_badge.id;
      awarded_badge_name := v_badge.name;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;
