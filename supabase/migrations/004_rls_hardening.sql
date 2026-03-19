-- =================================================================
-- RLS HARDENING: Replace auth.role() = 'authenticated' with
-- app_metadata role checks and per-user restrictions
-- =================================================================

-- --- DROP OLD OVERLY-PERMISSIVE POLICIES ---

DROP POLICY IF EXISTS "Admin full access vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin full access vehicle_images" ON vehicle_images;
DROP POLICY IF EXISTS "Admin full access vehicle_costs" ON vehicle_costs;
DROP POLICY IF EXISTS "Admin full access customers" ON customers;
DROP POLICY IF EXISTS "Admin full access leads" ON leads;
DROP POLICY IF EXISTS "Admin full access follow_ups" ON follow_ups;
DROP POLICY IF EXISTS "Admin full access deals" ON deals;

-- --- SHARED TABLES (all staff can read/write): vehicles, vehicle_images, vehicle_costs, customers ---

-- vehicles: all staff read/write, public SELECT already exists for status='available'
CREATE POLICY "Staff select vehicles" ON vehicles FOR SELECT TO authenticated
  USING ((select private.is_staff()));
CREATE POLICY "Staff insert vehicles" ON vehicles FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update vehicles" ON vehicles FOR UPDATE TO authenticated
  USING ((select private.is_staff()))
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Admin delete vehicles" ON vehicles FOR DELETE TO authenticated
  USING ((select private.is_admin()));

-- vehicle_images: all staff read/write
CREATE POLICY "Staff select vehicle_images" ON vehicle_images FOR SELECT TO authenticated
  USING ((select private.is_staff()));
CREATE POLICY "Staff insert vehicle_images" ON vehicle_images FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update vehicle_images" ON vehicle_images FOR UPDATE TO authenticated
  USING ((select private.is_staff()))
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff delete vehicle_images" ON vehicle_images FOR DELETE TO authenticated
  USING ((select private.is_staff()));

-- vehicle_costs: all staff read/write
CREATE POLICY "Staff select vehicle_costs" ON vehicle_costs FOR SELECT TO authenticated
  USING ((select private.is_staff()));
CREATE POLICY "Staff insert vehicle_costs" ON vehicle_costs FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update vehicle_costs" ON vehicle_costs FOR UPDATE TO authenticated
  USING ((select private.is_staff()))
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff delete vehicle_costs" ON vehicle_costs FOR DELETE TO authenticated
  USING ((select private.is_staff()));

-- customers: all staff read/write
CREATE POLICY "Staff select customers" ON customers FOR SELECT TO authenticated
  USING ((select private.is_staff()));
CREATE POLICY "Staff insert customers" ON customers FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update customers" ON customers FOR UPDATE TO authenticated
  USING ((select private.is_staff()))
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Admin delete customers" ON customers FOR DELETE TO authenticated
  USING ((select private.is_admin()));

-- --- PER-USER TABLES: leads (staff sees own assigned, admin sees all) ---

-- Drop the public insert policy to recreate it properly scoped
DROP POLICY IF EXISTS "Public can submit leads" ON leads;

CREATE POLICY "Staff select leads" ON leads FOR SELECT TO authenticated
  USING ((select private.is_admin()) OR assigned_to = (select auth.uid()));
CREATE POLICY "Staff insert leads" ON leads FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update own leads" ON leads FOR UPDATE TO authenticated
  USING ((select private.is_admin()) OR assigned_to = (select auth.uid()))
  WITH CHECK ((select private.is_admin()) OR assigned_to = (select auth.uid()));
CREATE POLICY "Admin delete leads" ON leads FOR DELETE TO authenticated
  USING ((select private.is_admin()));

-- Re-create public lead submission (anon can insert for contact form)
CREATE POLICY "Public can submit leads" ON leads FOR INSERT TO anon
  WITH CHECK (true);

-- --- PER-USER TABLES: deals (staff sees own created, admin sees all) ---

CREATE POLICY "Staff select deals" ON deals FOR SELECT TO authenticated
  USING ((select private.is_admin()) OR created_by = (select auth.uid()));
CREATE POLICY "Staff insert deals" ON deals FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update own deals" ON deals FOR UPDATE TO authenticated
  USING ((select private.is_admin()) OR created_by = (select auth.uid()))
  WITH CHECK ((select private.is_admin()) OR created_by = (select auth.uid()));
CREATE POLICY "Admin delete deals" ON deals FOR DELETE TO authenticated
  USING ((select private.is_admin()));

-- --- PER-USER TABLES: follow_ups (staff sees own created, admin sees all) ---

CREATE POLICY "Staff select follow_ups" ON follow_ups FOR SELECT TO authenticated
  USING ((select private.is_admin()) OR created_by = (select auth.uid()));
CREATE POLICY "Staff insert follow_ups" ON follow_ups FOR INSERT TO authenticated
  WITH CHECK ((select private.is_staff()));
CREATE POLICY "Staff update own follow_ups" ON follow_ups FOR UPDATE TO authenticated
  USING ((select private.is_admin()) OR created_by = (select auth.uid()))
  WITH CHECK ((select private.is_admin()) OR created_by = (select auth.uid()));
CREATE POLICY "Admin delete follow_ups" ON follow_ups FOR DELETE TO authenticated
  USING ((select private.is_admin()));
