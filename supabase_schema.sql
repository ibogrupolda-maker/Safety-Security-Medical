-- SQL Schema for SSM Digital Command Center
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table (Optional but recommended)
-- This table can store additional user data that Supabase Auth doesn't handle natively
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT,
  company_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  location_name TEXT,
  status TEXT DEFAULT 'active',
  priority TEXT,
  coords JSONB,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Example: Users can only see incidents from their company)
CREATE POLICY "Users can view their company's incidents" ON public.incidents
  FOR SELECT USING (
    auth.jwt() -> 'user_metadata' ->> 'company_id' = company_id
    OR auth.jwt() -> 'user_metadata' ->> 'role' IN ('ADMIN_SSM', 'OPERADOR_COORD')
  );

-- 5. Trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, company_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'company_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
