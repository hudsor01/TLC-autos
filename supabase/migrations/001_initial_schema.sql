-- ═══════════════════════════════════════════════════════════════
-- TLC AUTOS — INITIAL SCHEMA
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── INVENTORY ───

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_number TEXT UNIQUE NOT NULL,
  vin TEXT NOT NULL,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT DEFAULT '',
  body_style TEXT DEFAULT '',
  exterior_color TEXT DEFAULT '',
  interior_color TEXT DEFAULT '',
  mileage INTEGER DEFAULT 0,
  mileage_type TEXT DEFAULT 'Actual',
  fuel_type TEXT DEFAULT 'Gasoline',
  transmission TEXT DEFAULT '',
  engine TEXT DEFAULT '',
  cylinders INTEGER,
  drivetrain TEXT DEFAULT '',
  vehicle_type TEXT DEFAULT '',
  description TEXT DEFAULT '',
  features JSONB DEFAULT '[]',
  status TEXT DEFAULT 'available',
  purchase_price NUMERIC(10,2) DEFAULT 0,
  buyer_fee NUMERIC(10,2) DEFAULT 0,
  lot_fee NUMERIC(10,2) DEFAULT 0,
  added_costs NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  selling_price NUMERIC(10,2) DEFAULT 0,
  purchase_date TIMESTAMPTZ DEFAULT now(),
  date_added TIMESTAMPTZ DEFAULT now(),
  date_sold TIMESTAMPTZ,
  location_code TEXT DEFAULT '',
  gps_serial TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE vehicle_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  vendor TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT now(),
  category TEXT DEFAULT 'repair',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CUSTOMERS & LEADS ───

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip TEXT DEFAULT '',
  drivers_license TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new',
  vehicle_interest TEXT DEFAULT '',
  trade_vehicle TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'note',
  content TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── SALES / DESKING ───

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_number TEXT UNIQUE NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  sale_type TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'pending',
  selling_price NUMERIC(10,2) DEFAULT 0,
  trade_allowance NUMERIC(10,2) DEFAULT 0,
  trade_payoff NUMERIC(10,2) DEFAULT 0,
  down_payment NUMERIC(10,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 6.25,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  title_fee NUMERIC(10,2) DEFAULT 0,
  registration_fee NUMERIC(10,2) DEFAULT 0,
  doc_fee NUMERIC(10,2) DEFAULT 0,
  other_fees NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  amount_financed NUMERIC(10,2) DEFAULT 0,
  apr NUMERIC(5,2) DEFAULT 0,
  term INTEGER DEFAULT 0,
  monthly_payment NUMERIC(10,2) DEFAULT 0,
  lien_holder TEXT DEFAULT '',
  salesperson TEXT DEFAULT '',
  sale_date TIMESTAMPTZ DEFAULT now(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ───

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_customer ON leads(customer_id);
CREATE INDEX idx_deals_vehicle ON deals(vehicle_id);
CREATE INDEX idx_deals_customer ON deals(customer_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_costs_vehicle ON vehicle_costs(vehicle_id);

-- ─── AUTO-UPDATE TIMESTAMPS ───

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ───

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Public: read available vehicles and their images
CREATE POLICY "Public can view available vehicles" ON vehicles FOR SELECT USING (status = 'available');
CREATE POLICY "Public can view vehicle images" ON vehicle_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_images.vehicle_id AND vehicles.status = 'available')
);

-- Authenticated (admin): full access to everything
CREATE POLICY "Admin full access vehicles" ON vehicles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access vehicle_images" ON vehicle_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access vehicle_costs" ON vehicle_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access follow_ups" ON follow_ups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access deals" ON deals FOR ALL USING (auth.role() = 'authenticated');

-- Public: can submit leads (contact form)
CREATE POLICY "Public can submit leads" ON leads FOR INSERT WITH CHECK (true);

-- ─── STORAGE BUCKET ───

INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view vehicle images storage" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');
CREATE POLICY "Admin can upload vehicle images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin can update vehicle images" ON storage.objects FOR UPDATE USING (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin can delete vehicle images" ON storage.objects FOR DELETE USING (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');
