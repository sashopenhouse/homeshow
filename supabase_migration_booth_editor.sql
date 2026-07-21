-- Booth editor DB changes — run this in your Supabase SQL editor.

-- 1. Internal admin notes column. Shown only in the /admin/booths editor; the
--    public floor plan never requests this column.
ALTER TABLE booths ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Allow authenticated admins to DELETE booths. The original schema only had
--    SELECT/INSERT/UPDATE policies for booths, so with RLS enabled a "Delete
--    Booth" matched zero rows and silently did nothing.
DROP POLICY IF EXISTS "Booths are deletable by authenticated users only" ON booths;
CREATE POLICY "Booths are deletable by authenticated users only"
  ON booths FOR DELETE USING (auth.role() = 'authenticated');
