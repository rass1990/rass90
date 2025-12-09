-- Migration: enable_rls_policies
-- Created at: 1765240297


-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read service_categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read provider_profiles" ON provider_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Public read provider_gallery" ON provider_gallery FOR SELECT USING (true);
CREATE POLICY "Public read provider_availability" ON provider_availability FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);

-- Allow all operations via edge functions
CREATE POLICY "Allow all bookings" ON bookings FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow all services write" ON services FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow all reviews write" ON reviews FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow all provider_profiles write" ON provider_profiles FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow all provider_availability write" ON provider_availability FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow all provider_gallery write" ON provider_gallery FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow all addresses" ON addresses FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow all support_tickets" ON support_tickets FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow profiles write" ON profiles FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
CREATE POLICY "Allow categories write" ON service_categories FOR ALL USING (auth.role() IN ('anon', 'service_role', 'authenticated'));
;