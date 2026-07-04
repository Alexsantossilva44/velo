-- Allow E2E tests to clean up seeded orders (scoped by test customer email).

GRANT DELETE ON TABLE public.orders TO anon, authenticated;

CREATE POLICY "E2E tests can delete seeded orders"
ON public.orders
FOR DELETE
USING (customer_email = 'e2e-test@velo.local');
