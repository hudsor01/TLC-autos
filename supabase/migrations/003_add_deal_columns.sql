-- Add created_by to deals for per-user RLS (assigned_to already exists on leads, created_by on follow_ups)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Performance indexes for RLS subselects
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_created_by ON deals(created_by);
CREATE INDEX IF NOT EXISTS idx_follow_ups_created_by ON follow_ups(created_by);
