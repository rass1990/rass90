import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://llcooutneswyvjfsmozb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY29vdXRuZXN3eXZqZnNtb3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjc1OTEsImV4cCI6MjA4MDgwMzU5MX0.1MkOQYm0gQ1yKMaQDujEQdWXnlSEIzGko9byJBY1eqc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  user_type: 'customer' | 'provider' | 'admin';
  preferred_language: 'en' | 'ar';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceCategory = {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Service = {
  id: string;
  provider_id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  base_price: number;
  price_type: string;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProviderProfile = {
  id: string;
  user_id: string;
  business_name: string | null;
  bio_en: string | null;
  bio_ar: string | null;
  years_experience: number | null;
  is_verified: boolean;
  verification_status: string;
  avg_rating: number | null;
  total_reviews: number;
  total_bookings: number;
  whatsapp_number: string | null;
  service_area: string[];
  min_price: number | null;
  max_price: number | null;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  total_amount: number | null;
  commission_amount: number | null;
  payment_status: string;
  payment_method: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  provider_response: string | null;
  created_at: string;
  updated_at: string;
};
