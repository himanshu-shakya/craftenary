-- ============================================================================
-- Migration: 20260828000000_artisan_tourist_platform.sql
-- Description: Complete schema for Artisan & Tourist Platform
-- ============================================================================

-- 1. Extend public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Master Crafts Table
CREATE TABLE IF NOT EXISTS public.crafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crafts_is_active ON public.crafts(is_active);

-- Seed initial master crafts
INSERT INTO public.crafts (name, description, icon) VALUES
  ('Pottery', 'Jaipur blue pottery, terracotta sculpting & ceramic wheel wares', 'cup-water'),
  ('Wood Carving', 'Intricate Sheesham jali fretwork, sandalwood & teak wood panels', 'axe'),
  ('Block Printing', 'Traditional Sanganeri & Bagru wooden stamp printing with natural indigo', 'palette-outline'),
  ('Miniature Painting', 'Fine Rajasthani court paintings with natural stone pigments & gold foil', 'brush-outline'),
  ('Silver Filigree', 'Ancient Tarkasi silver wire jewelry & ornamental artefacts', 'diamond-stone'),
  ('Handloom Weaving', 'Pashmina, Kota Doria silks & artisan pit-loom dhurrie rugs', 'hanger'),
  ('Embroidery', 'Vibrant Phulkari, royal Zardozi & delicate Chikankari threadwork', 'needle'),
  ('Jewelry & Meenakari', 'Kundan gem setting and glass enamel metal crafting', 'ring'),
  ('Metal Craft', 'Engraved brassware, bell metal cast figurines & Moradabad inlay', 'hammer')
ON CONFLICT (name) DO NOTHING;

-- 3. Artisan Profiles Table
CREATE TABLE IF NOT EXISTS public.artisan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  craft_id UUID NOT NULL REFERENCES public.crafts(id) ON DELETE RESTRICT,
  bio TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  experience_years INTEGER NOT NULL DEFAULT 0,
  price_per_hour NUMERIC NOT NULL DEFAULT 0,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_artisan_profiles_user_id ON public.artisan_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_craft_id ON public.artisan_profiles(craft_id);
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_verification ON public.artisan_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_city ON public.artisan_profiles(city);

-- 4. Tourist Profiles Table
CREATE TABLE IF NOT EXISTS public.tourist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  profile_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tourist_profiles_user_id ON public.tourist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tourist_profiles_city ON public.tourist_profiles(city);

-- 5. Tourist Craft Interests (Many-to-Many Junction Table)
CREATE TABLE IF NOT EXISTS public.tourist_craft_interests (
  tourist_id UUID NOT NULL REFERENCES public.tourist_profiles(id) ON DELETE CASCADE,
  craft_id UUID NOT NULL REFERENCES public.crafts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (tourist_id, craft_id)
);

CREATE INDEX IF NOT EXISTS idx_tourist_craft_interests_craft_id ON public.tourist_craft_interests(craft_id);

-- 6. Workshops Table
CREATE TABLE IF NOT EXISTS public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES public.artisan_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  craft_id UUID NOT NULL REFERENCES public.crafts(id) ON DELETE RESTRICT,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  duration TEXT NOT NULL DEFAULT '2 Hours',
  max_participants INTEGER NOT NULL DEFAULT 6 CHECK (max_participants > 0),
  rating NUMERIC NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_workshops_artisan_id ON public.workshops(artisan_id);
CREATE INDEX IF NOT EXISTS idx_workshops_craft_id ON public.workshops(craft_id);
CREATE INDEX IF NOT EXISTS idx_workshops_city ON public.workshops(city);
CREATE INDEX IF NOT EXISTS idx_workshops_is_active ON public.workshops(is_active);

-- 7. Workshop Images Table
CREATE TABLE IF NOT EXISTS public.workshop_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_workshop_images_workshop_id ON public.workshop_images(workshop_id);

-- 8. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  tourist_id UUID NOT NULL REFERENCES public.tourist_profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  number_of_people INTEGER NOT NULL DEFAULT 1 CHECK (number_of_people > 0),
  total_price NUMERIC NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_workshop_id ON public.bookings(workshop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tourist_id ON public.bookings(tourist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.crafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_craft_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Crafts: Public read-only for active crafts
CREATE POLICY "Public can view active crafts"
  ON public.crafts FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Artisan Profiles: Anyone can view artisan profiles, but only the owner can insert/update
CREATE POLICY "Public can view artisan profiles"
  ON public.artisan_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Artisans can insert own profile"
  ON public.artisan_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Artisans can update own profile"
  ON public.artisan_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Tourist Profiles: Anyone can view tourist profile basics, owner can manage
CREATE POLICY "Public can view tourist profiles"
  ON public.tourist_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Tourists can insert own profile"
  ON public.tourist_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Tourists can update own profile"
  ON public.tourist_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Tourist Craft Interests: Tourist manages own interests
CREATE POLICY "Public can view craft interests"
  ON public.tourist_craft_interests FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Tourists can manage own craft interests"
  ON public.tourist_craft_interests FOR ALL
  TO authenticated
  USING (
    tourist_id IN (
      SELECT id FROM public.tourist_profiles WHERE user_id = (select auth.uid())
    )
  );

-- Workshops: Public can view active workshops
CREATE POLICY "Public can view active workshops"
  ON public.workshops FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Artisans can manage own workshops"
  ON public.workshops FOR ALL
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM public.artisan_profiles WHERE user_id = (select auth.uid())
    )
  );

-- Workshop Images: Public can view workshop images
CREATE POLICY "Public can view workshop images"
  ON public.workshop_images FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Artisans can manage workshop images"
  ON public.workshop_images FOR ALL
  TO authenticated
  USING (
    workshop_id IN (
      SELECT w.id FROM public.workshops w
      JOIN public.artisan_profiles a ON a.id = w.artisan_id
      WHERE a.user_id = (select auth.uid())
    )
  );

-- Bookings: Tourists can view & insert their own bookings; Artisans can view bookings for their workshops
CREATE POLICY "Tourists can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    tourist_id IN (
      SELECT id FROM public.tourist_profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Tourists can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    tourist_id IN (
      SELECT id FROM public.tourist_profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Artisans can view bookings for their workshops"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    workshop_id IN (
      SELECT w.id FROM public.workshops w
      JOIN public.artisan_profiles a ON a.id = w.artisan_id
      WHERE a.user_id = (select auth.uid())
    )
  );
