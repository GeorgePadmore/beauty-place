-- Seed data for testing services
-- This assumes you have professionals already created

-- Service 1: Sarah's Facial Treatment
INSERT INTO services (
  id, professional_id, service_name, description, category, status, "serviceType", "pricingModel",
  base_price, discounted_price, currency, duration_minutes, is_featured, travel_fee, travel_fee_per_km,
  max_travel_distance, average_rating, total_reviews, total_bookings, completion_rate, is_deleted,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440030',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  'Signature Facial Treatment',
  'Professional facial treatment including cleansing, exfoliation, mask, and moisturizing. Perfect for all skin types.',
  'facial',
  'active',
  'single',
  'fixed',
  85.00,
  75.00,
  'USD',
  60,
  true,
  15.00,
  0.50,
  25.00,
  4.8,
  23,
  45,
  97.8,
  false,
  NOW(),
  NOW()
);

-- Service 2: Sarah's Chemical Peel
INSERT INTO services (
  id, professional_id, service_name, description, category, status, "serviceType", "pricingModel",
  base_price, discounted_price, currency, duration_minutes, is_featured, travel_fee, travel_fee_per_km,
  max_travel_distance, average_rating, total_reviews, total_bookings, completion_rate, is_deleted,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440031',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  'Chemical Peel Treatment',
  'Advanced chemical peel for skin rejuvenation and acne treatment. Results in smoother, clearer skin.',
  'facial',
  'active',
  'single',
  'fixed',
  120.00,
  NULL,
  'USD',
  90,
  false,
  15.00,
  0.50,
  25.00,
  4.9,
  18,
  32,
  96.9,
  false,
  NOW(),
  NOW()
);

-- Service 3: Mike's Haircut
INSERT INTO services (
  id, professional_id, service_name, description, category, status, "serviceType", "pricingModel",
  base_price, discounted_price, currency, duration_minutes, is_featured, travel_fee, travel_fee_per_km,
  max_travel_distance, average_rating, total_reviews, total_bookings, completion_rate, is_deleted,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440032',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  'Professional Haircut',
  'Professional haircut and styling for men. Includes consultation, wash, cut, and style.',
  'hair',
  'active',
  'single',
  'fixed',
  45.00,
  40.00,
  'USD',
  45,
  true,
  20.00,
  0.75,
  30.00,
  4.9,
  45,
  67,
  98.5,
  false,
  NOW(),
  NOW()
);

-- Service 4: Mike's Beard Trim
INSERT INTO services (
  id, professional_id, service_name, description, category, status, "serviceType", "pricingModel",
  base_price, discounted_price, currency, duration_minutes, is_featured, travel_fee, travel_fee_per_km,
  max_travel_distance, average_rating, total_reviews, total_bookings, completion_rate, is_deleted,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440033',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  'Beard Trim & Shape',
  'Professional beard trimming and shaping. Includes consultation and styling advice.',
  'hair',
  'active',
  'single',
  'fixed',
  25.00,
  NULL,
  'USD',
  30,
  false,
  20.00,
  0.75,
  30.00,
  4.7,
  22,
  22,
  95.5,
  false,
  NOW(),
  NOW()
);

-- Service 5: Lisa's Swedish Massage
INSERT INTO services (
  id, professional_id, service_name, description, category, status, "serviceType", "pricingModel",
  base_price, discounted_price, currency, duration_minutes, is_featured, travel_fee, travel_fee_per_km,
  max_travel_distance, average_rating, total_reviews, total_bookings, completion_rate, is_deleted,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440034',
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  'Swedish Massage',
  'Relaxing Swedish massage for stress relief and muscle tension. Perfect for relaxation and wellness.',
  'massage',
  'active',
  'single',
  'fixed',
  80.00,
  70.00,
  'USD',
  60,
  true,
  12.00,
  0.60,
  20.00,
  4.7,
  20,
  28,
  96.4,
  false,
  NOW(),
  NOW()
);

-- Service 6: Lisa's Deep Tissue Massage
INSERT INTO services (
  id, professional_id, service_name, description, category, status, "serviceType", "pricingModel",
  base_price, discounted_price, currency, duration_minutes, is_featured, travel_fee, travel_fee_per_km,
  max_travel_distance, average_rating, total_reviews, total_bookings, completion_rate, is_deleted,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440035',
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  'Deep Tissue Massage',
  'Therapeutic deep tissue massage for chronic muscle tension and pain relief.',
  'massage',
  'active',
  'single',
  'fixed',
  95.00,
  NULL,
  'USD',
  75,
  false,
  12.00,
  0.60,
  20.00,
  4.8,
  14,
  28,
  96.4,
  false,
  NOW(),
  NOW()
);
