-- 1. worker role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'worker';

-- 2. profiles extras
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- 3. products extras
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS wishlist_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;
UPDATE public.products SET title = COALESCE(NULLIF(data->>'Name',''), NULLIF(data->>'name',''), NULLIF(data->>'Title',''), 'Untitled') WHERE title = '';
UPDATE public.products SET status = 'under_review' WHERE status = 'pending';
UPDATE public.products SET status = 'rejected' WHERE status = 'cancelled';
ALTER TABLE public.products ALTER COLUMN status SET DEFAULT 'under_review';
ALTER TABLE public.products ADD CONSTRAINT products_status_check CHECK (status IN ('under_review','verified','rejected'));

-- 4. wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own wishlist read" ON public.wishlist FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Own wishlist insert" ON public.wishlist FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own wishlist delete" ON public.wishlist FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 5. product_views
CREATE TABLE IF NOT EXISTS public.product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.product_views TO authenticated;
GRANT ALL ON public.product_views TO service_role;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Views readable" ON public.product_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Views insertable" ON public.product_views FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 6. ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings readable" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own rating insert" ON public.ratings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own rating update" ON public.ratings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own rating delete" ON public.ratings FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER ratings_updated_at BEFORE UPDATE ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports read" ON public.reports FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Reports insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Reports admin update" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Reports admin delete" ON public.reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- 8. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  link text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Notifications insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own notifications delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- 9. activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  actor_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  entity text NOT NULL DEFAULT '',
  entity_id text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read activity" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone logs activity" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 10. products: signed-in users may read verified products (marketplace)
DROP POLICY IF EXISTS "Verified products are readable" ON public.products;
CREATE POLICY "Verified products are readable" ON public.products FOR SELECT TO authenticated USING (status = 'verified');

-- 11. counters
CREATE OR REPLACE FUNCTION public.bump_wishlist_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products SET wishlist_count = wishlist_count + 1 WHERE id = NEW.product_id;
  ELSE
    UPDATE public.products SET wishlist_count = GREATEST(wishlist_count - 1, 0) WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER wishlist_count_trg AFTER INSERT OR DELETE ON public.wishlist FOR EACH ROW EXECUTE FUNCTION public.bump_wishlist_count();

CREATE OR REPLACE FUNCTION public.bump_view_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.products SET views = views + 1 WHERE id = NEW.product_id;
  RETURN NULL;
END; $$;
CREATE TRIGGER view_count_trg AFTER INSERT ON public.product_views FOR EACH ROW EXECUTE FUNCTION public.bump_view_count();