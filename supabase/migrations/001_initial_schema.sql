-- ProofDrop: profiles (business owner info, linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  business_name TEXT NOT NULL DEFAULT '',
  business_logo_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  delivery_notes TEXT,
  delivery_address TEXT,

  driver_link_token TEXT UNIQUE NOT NULL,
  driver_phone TEXT,

  photo_url TEXT,
  signature_data TEXT,
  completed_at TIMESTAMPTZ,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_user_id ON public.deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_token ON public.deliveries(driver_link_token);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);

-- Notifications log (optional)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  recipient TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Deliveries: owner can CRUD; driver/customer access by token (handled in app)
CREATE POLICY "Users can manage own deliveries"
  ON public.deliveries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read for proof page by id (no auth) — we use a signed proof token or allow public read of completed delivery by id
-- For MVP we allow SELECT on deliveries where status = 'completed' for proof view (link contains delivery id)
CREATE POLICY "Anyone can view completed delivery proof"
  ON public.deliveries FOR SELECT
  USING (status = 'completed');

-- Notifications: only owner can read
CREATE POLICY "Users can view notifications for own deliveries"
  ON public.notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE d.id = notifications.delivery_id AND d.user_id = auth.uid()
    )
  );

-- Storage: Create bucket "delivery-photos" in Supabase Dashboard (Storage → New bucket).
-- Set it to Public so proof pages can show photo URLs.
-- Uploads are done via API using service role (driver token auth).
