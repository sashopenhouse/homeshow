-- Allow authenticated admins to delete vendors from the pool.
-- The base schema defined SELECT/INSERT/UPDATE policies for vendors but no
-- DELETE, so with RLS on, deletes silently matched zero rows.
-- Booths referencing a deleted vendor are unassigned automatically via the
-- booths.vendor_id ON DELETE SET NULL foreign key.

DROP POLICY IF EXISTS "Vendors are deletable by authenticated users only" ON vendors;
CREATE POLICY "Vendors are deletable by authenticated users only"
  ON vendors FOR DELETE USING (auth.role() = 'authenticated');
