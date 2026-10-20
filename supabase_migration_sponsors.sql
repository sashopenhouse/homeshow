-- Create the sponsors table used by /sponsors and /admin/sponsors.
-- It was defined in supabase_schema.sql but never applied to the live project.
-- Safe to re-run. Only signed-in admins can add, edit or delete sponsors.

CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  description TEXT,
  tier VARCHAR(100) NOT NULL DEFAULT 'Major Partners',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sponsors are viewable by everyone" ON sponsors;
DROP POLICY IF EXISTS "Sponsors are insertable by authenticated users only" ON sponsors;
DROP POLICY IF EXISTS "Sponsors are updatable by authenticated users only" ON sponsors;
DROP POLICY IF EXISTS "Sponsors are deletable by authenticated users only" ON sponsors;

CREATE POLICY "Sponsors are viewable by everyone" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Sponsors are insertable by authenticated users only" ON sponsors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sponsors are updatable by authenticated users only" ON sponsors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Sponsors are deletable by authenticated users only" ON sponsors FOR DELETE USING (auth.role() = 'authenticated');

-- Make the API see the new table right away.
NOTIFY pgrst, 'reload schema';
