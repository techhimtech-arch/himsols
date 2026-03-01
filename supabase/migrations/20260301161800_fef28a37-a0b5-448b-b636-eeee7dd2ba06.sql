
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.blog_posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = post_id;
$$;
