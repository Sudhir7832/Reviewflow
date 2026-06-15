-- Run this SQL in your Supabase SQL Editor

-- Create the businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- If using auth, otherwise can be nullable for now
    name TEXT NOT NULL,
    address TEXT,
    google_url TEXT NOT NULL,
    logo_url TEXT, -- ADDED IN PHASE 3
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Remove permissive policies if they exist
DROP POLICY IF EXISTS "Allow public read access to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public insert to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public update to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public delete to businesses" ON public.businesses;

-- STRICT POLICIES FOR BUSINESSES
-- Public can read businesses (needed for QR page)
CREATE POLICY "Public can read businesses" ON public.businesses FOR SELECT USING (true);
-- Only authenticated users can insert, and they must be inserting as themselves
CREATE POLICY "Users can insert own businesses" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Only the owner can update their business
CREATE POLICY "Users can update own businesses" ON public.businesses FOR UPDATE USING (auth.uid() = user_id);
-- Only the owner can delete their business
CREATE POLICY "Users can delete own businesses" ON public.businesses FOR DELETE USING (auth.uid() = user_id);

-- IF YOU ALREADY HAVE THE TABLE, JUST RUN THIS LINE TO UPDATE IT:
-- ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- PHASE 4 ADDITIONS (Run these to add category and description)
-- ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS category TEXT;
-- ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS description TEXT;

-- PHASE 5 ADDITIONS (Run these commands in your Supabase SQL Editor)
-- 1. Add Smart Gate settings to businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS gate_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS gate_threshold INTEGER DEFAULT 3;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#10b981';

-- 2. Create Analytics table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    stars INTEGER, 
    action_taken TEXT NOT NULL, -- 'scanned', 'redirected', or 'intercepted'
    feedback_text TEXT
);

-- Enable RLS for scans
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Remove permissive policies if they exist
DROP POLICY IF EXISTS "Allow public insert to scans" ON public.scans;
DROP POLICY IF EXISTS "Allow public update to scans" ON public.scans;
DROP POLICY IF EXISTS "Allow public read access to scans" ON public.scans;

-- STRICT POLICIES FOR SCANS
-- Public can insert scans (when customers scan the QR)
CREATE POLICY "Public can insert scans" ON public.scans FOR INSERT WITH CHECK (true);
-- Public can update scans (when customers submit ratings/feedback)
CREATE POLICY "Public can update scans" ON public.scans FOR UPDATE USING (true) WITH CHECK (true);
-- Select scans: Only the business owner can read the scans!
CREATE POLICY "Owners can read their business scans" ON public.scans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = scans.business_id 
    AND businesses.user_id = auth.uid()
  )
);

/*
STORAGE BUCKET SETUP INSTRUCTIONS:
1. Go to "Storage" in your Supabase Dashboard.
2. Click "New Bucket".
3. Name it EXACTLY: logos
4. Toggle "Public Bucket" to ON. Click Save.
5. Click on the new "logos" bucket, go to the "Policies" tab.
6. Click "New Policy" -> "For Full Customization".
7. Name it "Allow Public Uploads", set allowed operations to INSERT, SELECT, UPDATE, DELETE.
8. Set the policy to `true`.
*/

-- PHASE 6: PROFILES AND AUTH (Run these in SQL Editor)

-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    plan_tier TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active', -- 'active' or 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan_tier, status)
  VALUES (new.id, new.email, 'free', 'active');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Move plan_tier from businesses to profiles (optional cleanup)
-- ALTER TABLE public.businesses DROP COLUMN IF EXISTS plan_tier;

-- 4. Secure Businesses Table (Enforce user_id)
-- CREATE POLICY "Users can manage own businesses" ON public.businesses FOR ALL USING (auth.uid() = user_id);

-- PHASE 7: SECURITY DEFINER FUNCTIONS FOR PUBLIC API
-- Secure function to count intercepts without bypassing RLS for general selects
CREATE OR REPLACE FUNCTION get_intercept_count(b_id UUID)
RETURNS INTEGER AS $$
DECLARE
  intercept_count INTEGER;
BEGIN
  SELECT count(*) INTO intercept_count
  FROM public.scans
  WHERE business_id = b_id AND action_taken = 'intercepted';
  
  RETURN intercept_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure function to update a scan, bypassing SELECT RLS restrictions for public users
CREATE OR REPLACE FUNCTION update_scan(s_id UUID, s_action TEXT, s_stars INTEGER, s_feedback TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.scans
  SET action_taken = s_action, stars = s_stars, feedback_text = COALESCE(s_feedback, feedback_text)
  WHERE id = s_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PHASE 6 ADDITIONS (Stripe Subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_id TEXT,
    status TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- PHASE 7 ADDITIONS (Global Admin Settings)
CREATE TABLE IF NOT EXISTS public.global_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default limit of 5
INSERT INTO public.global_settings (setting_key, setting_value) 
VALUES ('free_plan_intercept_limit', '5') 
ON CONFLICT (setting_key) DO NOTHING;

ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
-- Anyone can read settings (needed for public scan pages)
DROP POLICY IF EXISTS "Public can read global settings" ON public.global_settings;
CREATE POLICY "Public can read global settings" ON public.global_settings FOR SELECT USING (true);
