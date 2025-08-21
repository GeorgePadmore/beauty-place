-- Seed data for testing availability
-- This assumes you have professionals already created

-- Sarah's Weekly Schedule (Monday to Friday, 9 AM - 6 PM)
INSERT INTO availability (
  id, professional_id, day_of_week, start_time, end_time, status, is_available, is_recurring,
  break_start_time, break_end_time, max_bookings, current_bookings, advance_booking_hours,
  notes, created_by, is_active, is_deleted, created_at, updated_at
) VALUES 
-- Monday
(
  '550e8400-e29b-41d4-a716-446655440040',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  1, -- Monday
  '09:00',
  '18:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  8,
  0,
  24,
  'Regular Monday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440004',
  true,
  false,
  NOW(),
  NOW()
),
-- Tuesday
(
  '550e8400-e29b-41d4-a716-446655440041',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  2, -- Tuesday
  '09:00',
  '18:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  8,
  0,
  24,
  'Regular Tuesday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440004',
  true,
  false,
  NOW(),
  NOW()
),
-- Wednesday
(
  '550e8400-e29b-41d4-a716-446655440042',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  3, -- Wednesday
  '09:00',
  '18:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  8,
  0,
  24,
  'Regular Wednesday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440004',
  true,
  false,
  NOW(),
  NOW()
),
-- Thursday
(
  '550e8400-e29b-41d4-a716-446655440043',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  4, -- Thursday
  '09:00',
  '18:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  8,
  0,
  24,
  'Regular Thursday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440004',
  true,
  false,
  NOW(),
  NOW()
),
-- Friday
(
  '550e8400-e29b-41d4-a716-446655440044',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  5, -- Friday
  '09:00',
  '18:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  8,
  0,
  24,
  'Regular Friday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440004',
  true,
  false,
  NOW(),
  NOW()
),
-- Saturday (Half day)
(
  '550e8400-e29b-41d4-a716-446655440045',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  6, -- Saturday
  '10:00',
  '16:00',
  'available',
  true,
  true,
  NULL,
  NULL,
  4,
  0,
  24,
  'Saturday half-day schedule',
  '550e8400-e29b-41d4-a716-446655440004',
  true,
  false,
  NOW(),
  NOW()
);

-- Mike's Weekly Schedule (Monday to Saturday, 10 AM - 7 PM)
INSERT INTO availability (
  id, professional_id, day_of_week, start_time, end_time, status, is_available, is_recurring,
  break_start_time, break_end_time, max_bookings, current_bookings, advance_booking_hours,
  notes, created_by, is_active, is_deleted, created_at, updated_at
) VALUES 
-- Monday
(
  '550e8400-e29b-41d4-a716-446655440050',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  1, -- Monday
  '10:00',
  '19:00',
  'available',
  true,
  true,
  '13:00',
  '14:00',
  10,
  0,
  24,
  'Regular Monday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440005',
  true,
  false,
  NOW(),
  NOW()
),
-- Tuesday
(
  '550e8400-e29b-41d4-a716-446655440051',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  2, -- Tuesday
  '10:00',
  '19:00',
  'available',
  true,
  true,
  '13:00',
  '14:00',
  10,
  0,
  24,
  'Regular Tuesday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440005',
  true,
  false,
  NOW(),
  NOW()
),
-- Wednesday
(
  '550e8400-e29b-41d4-a716-446655440052',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  3, -- Wednesday
  '10:00',
  '19:00',
  'available',
  true,
  true,
  '13:00',
  '14:00',
  10,
  0,
  24,
  'Regular Wednesday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440005',
  true,
  false,
  NOW(),
  NOW()
),
-- Thursday
(
  '550e8400-e29b-41d4-a716-446655440053',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  4, -- Thursday
  '10:00',
  '19:00',
  'available',
  true,
  true,
  '13:00',
  '14:00',
  10,
  0,
  24,
  'Regular Thursday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440005',
  true,
  false,
  NOW(),
  NOW()
),
-- Friday
(
  '550e8400-e29b-41d4-a716-446655440054',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  5, -- Friday
  '10:00',
  '19:00',
  'available',
  true,
  true,
  '13:00',
  '14:00',
  10,
  0,
  24,
  'Regular Friday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440005',
  true,
  false,
  NOW(),
  NOW()
),
-- Saturday
(
  '550e8400-e29b-41d4-a716-446655440055',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  6, -- Saturday
  '09:00',
  '17:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  8,
  0,
  24,
  'Saturday schedule',
  '550e8400-e29b-41d4-a716-446655440005',
  true,
  false,
  NOW(),
  NOW()
);

-- Lisa's Weekly Schedule (Monday to Friday, 8 AM - 5 PM)
INSERT INTO availability (
  id, professional_id, day_of_week, start_time, end_time, status, is_available, is_recurring,
  break_start_time, break_end_time, max_bookings, current_bookings, advance_booking_hours,
  notes, created_by, is_active, is_deleted, created_at, updated_at
) VALUES 
-- Monday
(
  '550e8400-e29b-41d4-a716-446655440060',
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  1, -- Monday
  '08:00',
  '17:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  6,
  0,
  24,
  'Regular Monday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440006',
  true,
  false,
  NOW(),
  NOW()
),
-- Tuesday
(
  '550e8400-e29b-41d4-a716-446655440061',
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  2, -- Tuesday
  '08:00',
  '17:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  6,
  0,
  24,
  'Regular Tuesday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440006',
  true,
  false,
  NOW(),
  NOW()
),
-- Wednesday
(
  '550e8400-e29b-41d4-a716-446655440062',
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  3, -- Wednesday
  '08:00',
  '17:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  6,
  0,
  24,
  'Regular Wednesday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440006',
  true,
  false,
  NOW(),
  NOW()
),
-- Thursday
(
  '550e8400-e29b-41d4-a716-446655440063',
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  4, -- Thursday
  '08:00',
  '17:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  6,
  0,
  24,
  'Regular Thursday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440006',
  true,
  false,
  NOW(),
  NOW()
),
-- Friday
(
  '550e8400-e29b-41d4-a716-446655440064',
  '550e8400-e29b-41d4-a716-446655440012', -- Lisa Massage Therapy
  5, -- Friday
  '08:00',
  '17:00',
  'available',
  true,
  true,
  '12:00',
  '13:00',
  6,
  0,
  24,
  'Regular Friday schedule with lunch break',
  '550e8400-e29b-41d4-a716-446655440006',
  true,
  false,
  NOW(),
  NOW()
);

-- Specific date overrides (non-recurring)
INSERT INTO availability (
  id, professional_id, day_of_week, date, start_time, end_time, status, is_available, is_recurring,
  break_start_time, break_end_time, max_bookings, current_bookings, advance_booking_hours,
  notes, created_by, is_active, is_deleted, created_at, updated_at
) VALUES 
-- Sarah's holiday (specific date override)
(
  '550e8400-e29b-41d4-a716-446655440070',
  '550e8400-e29b-41d4-a716-446655440010', -- Sarah Beauty Studio
  1, -- Monday (but overridden by specific date)
  '2024-12-25', -- Christmas Day
  '00:00',
  '00:00',
  'unavailable',
  false,
  false,
  NULL,
  NULL,
  NULL,
  0,
  24,
  'Christmas Day - Closed',
  '550e8400-e29b-41d4-a716-446655440004',
  true,
  false,
  NOW(),
  NOW()
),
-- Mike's special event
(
  '550e8400-e29b-41d4-a716-446655440071',
  '550e8400-e29b-41d4-a716-446655440011', -- Mike Stylist Mobile
  6, -- Saturday (but overridden by specific date)
  '2024-12-31', -- New Year's Eve
  '10:00',
  '15:00',
  'available',
  true,
  false,
  NULL,
  NULL,
  5,
  0,
  24,
  'New Years Eve - Early closing',
  '550e8400-e29b-41d4-a716-446655440005',
  true,
  false,
  NOW(),
  NOW()
);
