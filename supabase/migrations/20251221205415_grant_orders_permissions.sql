-- Grant table-level permissions required by Supabase API roles (anon/authenticated).
-- RLS policies alone are not enough; without these GRANTs inserts fail with
-- "permission denied for table orders".

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT ON TABLE public.orders TO anon, authenticated;
