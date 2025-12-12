-- Seed initial challenges
INSERT INTO challenges (title, description, emotion_id, target_count, reward_points, start_date, end_date, is_active)
SELECT 
  'Peace Seeker',
  'Log Peace/Calm 5 times this week',
  id,
  5,
  50,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  true
FROM emotions WHERE name = 'Peace';

INSERT INTO challenges (title, description, emotion_id, target_count, reward_points, start_date, end_date, is_active)
SELECT 
  'Joy Collector',
  'Experience Joy 7 times this week',
  id,
  7,
  70,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  true
FROM emotions WHERE name = 'Joy';

INSERT INTO challenges (title, description, emotion_id, target_count, reward_points, start_date, end_date, is_active)
SELECT 
  'Emotion Explorer',
  'Log at least 4 different emotions this week',
  NULL,
  4,
  100,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  true;
