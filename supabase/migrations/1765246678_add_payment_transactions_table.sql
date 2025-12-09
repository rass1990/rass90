-- Migration: add_payment_transactions_table
-- Created at: 1765246678


-- Payment transactions table for tracking PayPal payments
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paypal', 'cash_on_delivery')),
  transaction_id TEXT, -- PayPal transaction ID
  payer_id TEXT, -- PayPal payer ID
  payer_email TEXT,
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  provider_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cod_pending', 'cod_completed')),
  payment_data JSONB, -- Store PayPal response data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

-- RLS policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Customers can view their own payment transactions
CREATE POLICY "Customers can view own payments"
  ON payment_transactions FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE customer_id = auth.uid()
    )
  );

-- Providers can view their booking payments
CREATE POLICY "Providers can view booking payments"
  ON payment_transactions FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE provider_id = auth.uid()
    )
  );

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON payment_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add payment tracking fields to bookings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'paypal_order_id') THEN
    ALTER TABLE bookings ADD COLUMN paypal_order_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_completed_at') THEN
    ALTER TABLE bookings ADD COLUMN payment_completed_at TIMESTAMPTZ;
  END IF;
END $$;
;