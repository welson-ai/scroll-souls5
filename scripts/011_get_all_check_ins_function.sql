-- Create a function to fetch all check-ins for global stats (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_check_ins()
RETURNS TABLE(id uuid, emotion_id text, user_id uuid, created_at timestamp, emotion_name text, emotion_emoji text, emotion_color text)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    ci.id,
    ci.emotion_id,
    ci.user_id,
    ci.created_at,
    e.name as emotion_name,
    e.emoji as emotion_emoji,
    e.color_primary as emotion_color
  FROM check_ins ci
  JOIN emotions e ON ci.emotion_id = e.id
  ORDER BY ci.created_at DESC;
$$;

-- Grant permission to anon users to call this function
GRANT EXECUTE ON FUNCTION get_all_check_ins TO anon, authenticated, service_role;
