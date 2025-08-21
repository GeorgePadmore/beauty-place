-- Initial Database Schema for Beauty Place
-- This script creates all necessary tables and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'professional')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create professionals table
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  category VARCHAR(100) NOT NULL CHECK (category IN ('hair', 'nails', 'makeup', 'massage', 'facial', 'waxing', 'other')),
  description TEXT,
  hourly_rate_cents INTEGER NOT NULL,
  travel_mode VARCHAR(20) DEFAULT 'stationary' CHECK (travel_mode IN ('mobile', 'stationary', 'both')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('hair', 'nails', 'makeup', 'massage', 'facial', 'waxing', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create availability table
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  total_price_cents INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  stripe_payment_intent_id VARCHAR(255),
  idempotency_key VARCHAR(255) UNIQUE,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create pricing_config table
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricing_type VARCHAR(50) UNIQUE NOT NULL CHECK (pricing_type IN (
    'platform_fee', 'withdrawal_fee', 'processing_fee', 'minimum_withdrawal', 'maximum_withdrawal'
  )),
  value DECIMAL(10,4) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  unit VARCHAR(20) DEFAULT 'percentage',
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create service_accounts table
CREATE TABLE service_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  gross_balance DECIMAL(15,2) DEFAULT 0.00,
  net_balance DECIMAL(15,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  last_withdrawal_at TIMESTAMP,
  last_transaction_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create service_account_transactions table
CREATE TABLE service_account_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_account_id UUID NOT NULL REFERENCES service_accounts(id) ON DELETE CASCADE,
  processing_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  booking_id UUID REFERENCES bookings(id),
  gross_balance_before DECIMAL(15,2) NOT NULL,
  gross_balance_after DECIMAL(15,2) NOT NULL,
  net_balance_before DECIMAL(15,2) NOT NULL,
  net_balance_after DECIMAL(15,2) NOT NULL,
  gross_amount DECIMAL(15,2) NOT NULL,
  net_amount DECIMAL(15,2) NOT NULL,
  platform_fee DECIMAL(15,2) DEFAULT 0.00,
  stripe_fee DECIMAL(15,2) DEFAULT 0.00,
  other_fees DECIMAL(15,2) DEFAULT 0.00,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
    'payment', 'refund', 'withdrawal', 'fee', 'adjustment', 'bonus'
  )),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_type_extra VARCHAR(100),
  description TEXT,
  notes TEXT,
  failure_reason TEXT,
  metadata JSONB,
  processed_at TIMESTAMP,
  failed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create withdrawal_requests table
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_account_id UUID NOT NULL REFERENCES service_accounts(id) ON DELETE CASCADE,
  requested_amount DECIMAL(15,2) NOT NULL,
  approved_amount DECIMAL(15,2) NOT NULL,
  processing_fee DECIMAL(15,2) DEFAULT 0.00,
  net_amount DECIMAL(15,2) NOT NULL,
  withdrawal_method VARCHAR(20) DEFAULT 'stripe_transfer' CHECK (withdrawal_method IN ('stripe_transfer', 'bank_transfer', 'check', 'paypal')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  stripe_transfer_id VARCHAR(255),
  bank_account_id VARCHAR(255),
  paypal_email VARCHAR(255),
  bank_account_details TEXT,
  approved_at TIMESTAMP,
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  admin_notes TEXT,
  user_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payload JSONB NOT NULL,
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professionals_location ON professionals(latitude, longitude);
CREATE INDEX idx_professionals_category ON professionals(category);
CREATE INDEX idx_professionals_price ON professionals(hourly_rate_cents);
CREATE INDEX idx_professionals_city ON professionals(city);

CREATE INDEX idx_services_professional_id ON services(professional_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_price ON services(price_cents);

CREATE INDEX idx_availability_professional_day ON availability(professional_id, day_of_week);

CREATE INDEX idx_bookings_professional_time ON bookings(professional_id, start_time, end_time);
CREATE INDEX idx_bookings_client_time ON bookings(client_id, start_time);
CREATE INDEX idx_bookings_idempotency ON bookings(idempotency_key);
CREATE INDEX idx_bookings_stripe_payment ON bookings(stripe_payment_intent_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Financial tables indexes
CREATE INDEX idx_pricing_config_type ON pricing_config(pricing_type);
CREATE INDEX idx_pricing_config_active ON pricing_config(is_active);

CREATE INDEX idx_service_accounts_professional_id ON service_accounts(professional_id);
CREATE INDEX idx_service_accounts_active ON service_accounts(is_active);
CREATE INDEX idx_service_accounts_balance ON service_accounts(net_balance);

CREATE INDEX idx_service_account_transactions_service_account_id ON service_account_transactions(service_account_id);
CREATE INDEX idx_service_account_transactions_type ON service_account_transactions(transaction_type);
CREATE INDEX idx_service_account_transactions_status ON service_account_transactions(status);
CREATE INDEX idx_service_account_transactions_stripe_payment ON service_account_transactions(stripe_payment_intent_id);
CREATE INDEX idx_service_account_transactions_processing_id ON service_account_transactions(processing_id);
CREATE INDEX idx_service_account_transactions_created ON service_account_transactions(created_at);

CREATE INDEX idx_withdrawal_requests_service_account_id ON withdrawal_requests(service_account_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_method ON withdrawal_requests(withdrawal_method);
CREATE INDEX idx_withdrawal_requests_created ON withdrawal_requests(created_at);

CREATE INDEX idx_webhook_events_stripe_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at);

-- Create unique constraints
ALTER TABLE bookings ADD CONSTRAINT unique_professional_time_slot 
  UNIQUE (professional_id, start_time, end_time);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_config_updated_at BEFORE UPDATE ON pricing_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_accounts_updated_at BEFORE UPDATE ON service_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_account_transactions_updated_at BEFORE UPDATE ON service_account_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default pricing configuration
INSERT INTO pricing_config (pricing_type, value, name, description, unit, is_active) VALUES
('platform_fee', 15.0, 'Platform Fee', 'Default platform fee percentage for all transactions', 'percentage', true),
('withdrawal_fee', 1.0, 'Withdrawal Fee', 'Processing fee for bank transfers', 'percentage', true),
('processing_fee', 2.9, 'Processing Fee', 'Stripe processing fee percentage', 'percentage', true),
('minimum_withdrawal', 10.00, 'Minimum Withdrawal', 'Minimum amount for withdrawal requests', 'fixed_amount', true),
('maximum_withdrawal', 10000.00, 'Maximum Withdrawal', 'Maximum amount for withdrawal requests', 'fixed_amount', true);
