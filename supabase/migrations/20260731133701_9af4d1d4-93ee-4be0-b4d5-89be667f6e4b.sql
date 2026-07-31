REVOKE ALL ON FUNCTION public.bump_wishlist_count() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.bump_view_count() FROM public, anon, authenticated;

DROP POLICY IF EXISTS "Notifications insert" ON public.notifications;
CREATE POLICY "Notifications insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));