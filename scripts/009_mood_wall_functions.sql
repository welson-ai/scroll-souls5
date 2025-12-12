-- Function to increment reaction count
CREATE OR REPLACE FUNCTION increment_reaction_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE mood_posts
  SET reaction_count = reaction_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement reaction count
CREATE OR REPLACE FUNCTION decrement_reaction_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE mood_posts
  SET reaction_count = GREATEST(reaction_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
