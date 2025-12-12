-- Function to get global emotion statistics
CREATE OR REPLACE FUNCTION get_global_emotion_stats()
RETURNS TABLE (
  emotion_name TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.name as emotion_name,
    COUNT(c.id) as count
  FROM emotions e
  LEFT JOIN check_ins c ON c.emotion_id = e.id
  WHERE c.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY e.name, e.id
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
