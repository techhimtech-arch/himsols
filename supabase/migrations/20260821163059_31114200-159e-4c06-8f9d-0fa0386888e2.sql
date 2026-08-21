GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_daily_visit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_visit(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_visitor_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_batch(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_batch_photos(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_batches(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_views(uuid) TO anon, authenticated;