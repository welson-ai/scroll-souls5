-- Fix the ambiguous badge_id column reference
DROP FUNCTION IF EXISTS public.check_and_award_badges(UUID);

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
  
  -- Fixed ambiguous column reference by using aliases
  FOR v_badge IN SELECT b.id AS badge_id_val, b.name AS badge_name_val, b.requirement_type, b.requirement_value
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
      VALUES (p_user_id, v_badge.badge_id_val)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      RETURN QUERY SELECT v_badge.badge_id_val, v_badge.badge_name_val;
    END IF;
  END LOOP;
END;
$$;
