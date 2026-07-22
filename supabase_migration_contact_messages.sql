-- Contact form submissions. Run once in your Supabase SQL editor.
-- Anyone can submit (public form); only authenticated admins can read/manage.

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a contact message"
  ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read contact messages"
  ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete contact messages"
  ON contact_messages FOR DELETE USING (auth.role() = 'authenticated');
