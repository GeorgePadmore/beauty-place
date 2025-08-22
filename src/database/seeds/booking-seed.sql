-- Seed data for testing bookings
-- This will create sample bookings for the existing users, professionals, and services

-- Insert sample bookings
INSERT INTO bookings (
  id,
  client_id,
  professional_id,
  service_id,
  start_time,
  end_time,
  total_price_cents,
  service_price_cents,
  travel_fee_cents,
  platform_fee_cents,
  discount_cents,
  status,
  "paymentStatus",
  "bookingType",
  idempotency_key,
  location,
  client_notes,
  professional_notes,
  is_active,
  is_deleted,
  created_at,
  updated_at
) VALUES 
-- Client 1 (John Doe) booking with Sarah Beauty Studio
(
  '550e8400-e29b-41d4-a716-446655440001',
  '10756772-303e-4cdb-b2b1-6232d580efb2', -- John Doe
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  '550e8400-e29b-41d4-a716-446655440030', -- Facial Treatment
  '2024-01-15 10:00:00',
  '2024-01-15 11:30:00',
  8500, -- $85.00
  7500, -- $75.00
  500,  -- $5.00 travel fee
  500,  -- $5.00 platform fee
  0,    -- No discount
  'confirmed',
  'paid',
  'in_person',
  'booking-001-john-sarah-facial',
  '{"address": "123 Main St", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10001"}',
  'Please use gentle products for sensitive skin',
  'Client has sensitive skin, will use hypoallergenic products',
  true,
  false,
  '2024-01-10 09:00:00',
  '2024-01-10 09:00:00'
),

-- Client 2 (Jane Smith) booking with Mike Stylist Mobile
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440002', -- Jane Smith
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  '550e8400-e29b-41d4-a716-446655440032', -- Hair Styling
  '2024-01-16 14:00:00',
  '2024-01-16 15:30:00',
  12000, -- $120.00
  11000, -- $110.00
  1000,  -- $10.00 travel fee
  1100,  -- $11.00 platform fee
  0,     -- No discount
  'pending',
  'pending',
  'home_visit',
  'booking-002-jane-mike-hair',
  '{"address": "456 Oak Ave", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10002"}',
  'I have long curly hair, need help with styling',
  'Client has long curly hair, will bring appropriate products',
  true,
  false,
  '2024-01-11 10:00:00',
  '2024-01-11 10:00:00'
),

-- Client 3 (Bob Johnson) booking with Lisa Massage Therapy
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440003', -- Bob Johnson
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  '550e8400-e29b-41d4-a716-446655440035', -- Deep Tissue Massage
  '2024-01-17 16:00:00',
  '2024-01-17 17:00:00',
  8800, -- $88.00
  8000, -- $80.00
  0,    -- No travel fee (in-person)
  800,  -- $8.00 platform fee
  0,    -- No discount
  'confirmed',
  'paid',
  'in_person',
  'booking-003-bob-lisa-massage',
  '{"address": "789 Pine St", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10003"}',
  'Focus on lower back and shoulders',
  'Client requested focus on lower back and shoulders',
  true,
  false,
  '2024-01-12 11:00:00',
  '2024-01-12 11:00:00'
),

-- Client 1 (John Doe) second booking with Sarah Beauty Studio
(
  '550e8400-e29b-41d4-a716-446655440004',
  '10756772-303e-4cdb-b2b1-6232d580efb2', -- John Doe
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  '550e8400-e29b-41d4-a716-446655440031', -- Hair Treatment
  '2024-01-20 13:00:00',
  '2024-01-20 14:00:00',
  6500, -- $65.00
  6000, -- $60.00
  0,    -- No travel fee (in-person)
  500,  -- $5.00 platform fee
  0,    -- No discount
  'pending',
  'pending',
  'in_person',
  'booking-004-john-sarah-hair',
  '{"address": "123 Main St", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10001"}',
  'Regular hair treatment appointment',
  'Regular client, standard hair treatment',
  true,
  false,
  '2024-01-13 14:00:00',
  '2024-01-13 14:00:00'
),

-- Client 2 (Jane Smith) second booking with Mike Stylist Mobile
(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440002', -- Jane Smith
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  '550e8400-e29b-41d4-a716-446655440033', -- Hair Coloring
  '2024-01-22 10:00:00',
  '2024-01-22 12:00:00',
  18000, -- $180.00
  16000, -- $160.00
  1000,  -- $10.00 travel fee
  1700,  -- $17.00 platform fee
  0,     -- No discount
  'confirmed',
  'paid',
  'home_visit',
  'booking-005-jane-mike-coloring',
  '{"address": "456 Oak Ave", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10002"}',
  'Want to go from brunette to blonde highlights',
  'Client wants brunette to blonde highlights, will need multiple sessions',
  true,
  false,
  '2024-01-14 15:00:00',
  '2024-01-14 15:00:00'
),

-- Client 3 (Bob Johnson) second booking with Lisa Massage Therapy
(
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440003', -- Bob Johnson
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  '550e8400-e29b-41d4-a716-446655440034', -- Swedish Massage
  '2024-01-25 15:00:00',
  '2024-01-25 16:00:00',
  7700, -- $77.00
  7000, -- $70.00
  0,    -- No travel fee (in-person)
  700,  -- $7.00 platform fee
  0,    -- No discount
  'pending',
  'pending',
  'in_person',
  'booking-006-bob-lisa-swedish',
  '{"address": "789 Pine St", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10003"}',
  'Relaxing massage, no deep tissue',
  'Client requested relaxing massage, no deep pressure',
  true,
  false,
  '2024-01-15 16:00:00',
  '2024-01-15 16:00:00'
)

ON CONFLICT (id) DO NOTHING;
