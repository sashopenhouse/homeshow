-- schema.sql
-- Run this in your Supabase SQL Editor

-- 1. Create Vendors Table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  industry_category VARCHAR(100),
  website_url VARCHAR(255),
  logo_url VARCHAR(500),
  description TEXT,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Vendor Applications Table
CREATE TABLE vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  industry_category VARCHAR(100),
  requested_booth_size VARCHAR(50),
  additional_requests TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Booths Table
CREATE TABLE booths (
  id SERIAL PRIMARY KEY,
  booth_number VARCHAR(10) UNIQUE NOT NULL,
  coordinates JSONB, -- Stores SVG polygon/bounding points [[x1, y1], [x2, y2]...]
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'reserved', 'sold'
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booths ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Vendors: Anyone can read (for the directory), only authenticated can write
CREATE POLICY "Vendors are viewable by everyone" ON vendors FOR SELECT USING (true);
CREATE POLICY "Vendors are insertable by authenticated users only" ON vendors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Vendors are updatable by authenticated users only" ON vendors FOR UPDATE USING (auth.role() = 'authenticated');

-- Vendor Applications: Anyone can insert (public application form), only authenticated can view/update
CREATE POLICY "Vendor applications are insertable by everyone" ON vendor_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendor applications are viewable by authenticated users only" ON vendor_applications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Vendor applications are updatable by authenticated users only" ON vendor_applications FOR UPDATE USING (auth.role() = 'authenticated');

-- Booths: Anyone can read (for the map), only authenticated can write
CREATE POLICY "Booths are viewable by everyone" ON booths FOR SELECT USING (true);
CREATE POLICY "Booths are insertable by authenticated users only" ON booths FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Booths are updatable by authenticated users only" ON booths FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert some dummy booths for the map overlay
INSERT INTO booths (booth_number, coordinates, status) VALUES 
('A1', '[[100, 100], [100, 200], [200, 200], [200, 100]]', 'available'),
('A2', '[[210, 100], [210, 200], [310, 200], [310, 100]]', 'available'),
('A3', '[[320, 100], [320, 200], [420, 200], [420, 100]]', 'available');

-- 4. Create Posts Table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR(100),
  author VARCHAR(100) DEFAULT 'Home Show Team',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view, anyone can insert (for ease of the demo/create posts feature)
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Posts are insertable by everyone" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Posts are updatable by authenticated users only" ON posts FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert initial dummy posts
INSERT INTO posts (title, slug, excerpt, content, category, author, created_at) VALUES 
('Utica University Nexus Center Prepares for Massive 2026 Turnout', 'nexus-center-prepares-2026', 'With over 200 exhibitors registered, this year''s Home Show is set to be the largest event of the season, introducing new interactive layouts and family attractions.', 'Utica University Nexus Center is preparing to host the biggest Home Show of the region. Kessler Promotions is bringing home improvement experts, interactive schedules, live music, and child museum events under one roof.', 'Event Updates', 'Home Show Team', NOW() - INTERVAL '1 day'),
('Exhibitor Spotlight: New York Sash Brings Custom Siding and Bath Solutions', 'exhibitor-spotlight-new-york-sash', 'Learn more about our presenting sponsor New York Sash and the exclusive home improvement offers they are bringing to the Nexus Center floor.', 'Our presenting sponsor New York Sash will showcase top-tier custom siding, bath systems, and window options. Find them directly at booth A1 for exclusive discount consultations. Kessler promotions are bringing state of the art home remodeling directly to your doorsteps.', 'Exhibitors', 'Kessler Promotions', NOW() - INTERVAL '2 days'),
('Interactive Children''s Exhibits & Zoomobile details announced', 'children-exhibits-zoomobile-announced', 'Discover the educational and family entertainment options available for attendees, including hands-on activities by the Utica Children''s Museum.', 'Bring the whole family! The show will feature live interactive wildlife exhibits from the Zoomobile, along with dedicated educational play areas created by the Children''s Museum.', 'Entertainment', 'Event Coordinator', NOW() - INTERVAL '3 days');

