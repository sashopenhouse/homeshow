-- Spring Home Show "Enter to Win" contest entries. Run once in your Supabase SQL editor.
-- Anyone can enter (public form); only authenticated admins can read/manage.
-- One entry per email address.

CREATE TABLE IF NOT EXISTS contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  opt_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS contest_entries_email_key ON contest_entries (lower(email));

ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can enter the contest" ON contest_entries;
DROP POLICY IF EXISTS "Admins can read contest entries" ON contest_entries;
DROP POLICY IF EXISTS "Admins can delete contest entries" ON contest_entries;

CREATE POLICY "Anyone can enter the contest"
  ON contest_entries FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read contest entries"
  ON contest_entries FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete contest entries"
  ON contest_entries FOR DELETE USING (auth.role() = 'authenticated');

-- Make the API see the new table right away.
NOTIFY pgrst, 'reload schema';
