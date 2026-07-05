
-- LESSONS
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_hi TEXT,
  summary TEXT,
  summary_hi TEXT,
  body TEXT NOT NULL,
  body_hi TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  cover_image_url TEXT,
  read_minutes INTEGER NOT NULL DEFAULT 5,
  quiz_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lessons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published lessons" ON public.lessons FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage lessons" ON public.lessons FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LESSON COMPLETIONS
CREATE TABLE public.lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_completions TO authenticated;
GRANT ALL ON public.lesson_completions TO service_role;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own completions" ON public.lesson_completions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own completions" ON public.lesson_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own completions" ON public.lesson_completions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ECO TIPS
CREATE TABLE public.eco_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_hi TEXT,
  body TEXT NOT NULL,
  body_hi TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eco_tips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eco_tips TO authenticated;
GRANT ALL ON public.eco_tips TO service_role;
ALTER TABLE public.eco_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active tips" ON public.eco_tips FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tips" ON public.eco_tips FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_eco_tips_updated_at BEFORE UPDATE ON public.eco_tips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER STREAKS
CREATE TABLE public.user_streaks (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_visit_date DATE,
  total_bonus_awarded NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_streaks TO authenticated;
GRANT ALL ON public.user_streaks TO service_role;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own streak" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- LEARN VIDEOS
CREATE TABLE public.learn_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT,
  description_hi TEXT,
  embed_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learn_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learn_videos TO authenticated;
GRANT ALL ON public.learn_videos TO service_role;
ALTER TABLE public.learn_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active videos" ON public.learn_videos FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage videos" ON public.learn_videos FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_learn_videos_updated_at BEFORE UPDATE ON public.learn_videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STREAK UPSERT RPC (called from client when user visits daily tip page)
CREATE OR REPLACE FUNCTION public.record_daily_visit(p_user_id UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, bonus_awarded NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date DATE;
  v_current INTEGER := 0;
  v_longest INTEGER := 0;
  v_today DATE := CURRENT_DATE;
  v_bonus NUMERIC := 0;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT us.last_visit_date, us.current_streak, us.longest_streak
    INTO v_last_date, v_current, v_longest
  FROM public.user_streaks us WHERE us.user_id = p_user_id;

  IF v_last_date IS NULL THEN
    v_current := 1;
  ELSIF v_last_date = v_today THEN
    -- same day, no change
    NULL;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    v_current := v_current + 1;
  ELSE
    v_current := 1;
  END IF;

  IF v_current > v_longest THEN v_longest := v_current; END IF;

  INSERT INTO public.user_streaks(user_id, current_streak, longest_streak, last_visit_date, updated_at)
  VALUES (p_user_id, v_current, v_longest, v_today, now())
  ON CONFLICT (user_id) DO UPDATE
    SET current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        last_visit_date = EXCLUDED.last_visit_date,
        updated_at = now();

  -- Award ₹10 wallet bonus every time streak hits a multiple of 7 and hasn't been awarded today
  IF v_current > 0 AND v_current % 7 = 0 AND v_last_date IS DISTINCT FROM v_today THEN
    v_bonus := 10;
    PERFORM public.wallet_transaction(
      p_user_id,
      'CREDIT'::varchar,
      v_bonus,
      'streak_bonus'::varchar,
      NULL,
      'Daily streak bonus (' || v_current || ' days)'
    );
    UPDATE public.user_streaks
      SET total_bonus_awarded = total_bonus_awarded + v_bonus
      WHERE user_id = p_user_id;
  END IF;

  RETURN QUERY SELECT v_current, v_longest, v_bonus;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_daily_visit(UUID) TO authenticated;
