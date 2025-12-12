-- Completely fix the ambiguous badge_id column reference issue
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
  v_badge_id TEXT;
  v_badge_name TEXT;
  v_requirement_type TEXT;
  v_requirement_value INTEGER;
  v_badge_cursor CURSOR FOR 
    SELECT b.id, b.name, b.requirement_type, b.requirement_value
    FROM public.badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_badges ub 
      WHERE ub.user_id = p_user_id AND ub.badge_id = b.id
    );
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO v_check_in_count FROM public.check_ins WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_entry_count FROM public.journal_entries WHERE user_id = p_user_id;
  SELECT COUNT(DISTINCT emotion_id) INTO v_unique_emotions FROM public.check_ins WHERE user_id = p_user_id;
  SELECT COALESCE(streak_days, 0) INTO v_streak FROM public.profiles WHERE id = p_user_id;
  
  -- Check each badge
  OPEN v_badge_cursor;
  LOOP
    FETCH v_badge_cursor INTO v_badge_id, v_badge_name, v_requirement_type, v_requirement_value;
    EXIT WHEN NOT FOUND;
    
    -- Check if badge should be awarded
    IF (v_requirement_type = 'check_ins' AND v_check_in_count >= v_requirement_value) OR
       (v_requirement_type = 'entries' AND v_entry_count >= v_requirement_value) OR
       (v_requirement_type = 'unique_emotions' AND v_unique_emotions >= v_requirement_value) OR
       (v_requirement_type = 'streak' AND v_streak >= v_requirement_value)
    THEN
      -- Award the badge
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge_id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      -- Return the awarded badge
      badge_id := v_badge_id;
      badge_name := v_badge_name;
      RETURN NEXT;
    END IF;
  END LOOP;
  CLOSE v_badge_cursor;
END;
$$;
