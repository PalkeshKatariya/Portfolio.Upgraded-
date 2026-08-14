-- Run this script in your Supabase SQL Editor to set up your database

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    thumbnail TEXT,
    tags TEXT[] DEFAULT '{}',
    year TEXT,
    client TEXT,
    featured BOOLEAN DEFAULT false,
    hidden BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Anyone can READ non-hidden projects (for the public website)
CREATE POLICY "Public can view active projects" 
ON public.portfolio_projects FOR SELECT 
USING (hidden = false);

-- Authenticated users (Admin) can READ ALL projects (including hidden)
CREATE POLICY "Admins can view all projects" 
ON public.portfolio_projects FOR SELECT 
TO authenticated 
USING (true);

-- Authenticated users (Admin) can INSERT, UPDATE, DELETE
CREATE POLICY "Admins can insert projects" 
ON public.portfolio_projects FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admins can update projects" 
ON public.portfolio_projects FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Admins can delete projects" 
ON public.portfolio_projects FOR DELETE 
TO authenticated 
USING (true);

-- 4. Insert Initial Dummy Data (Optional, just to have something to see)
INSERT INTO public.portfolio_projects (title, category, youtube_url, sort_order)
VALUES 
('Brand Identity Campaign', 'Commercial', 'L_LUpnjgPso', 1),
('A Love Story in Golden Hour', 'Wedding', 'https://youtube.com/shorts/vX9oyQjr-w8?feature=share', 2),
('Neon Dreams', 'Music Video', 'dQw4w9WgXcQ', 3);
