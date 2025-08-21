-- Seed data for testing professionals
-- This assumes you have users with professional role already created

-- Professional 1: Sarah Beauty (Beauty & Wellness)
INSERT INTO professionals (
  id, user_id, business_name, professional_title, bio, description, category, status, verification_status,
  years_experience, service_areas, travel_mode, base_travel_fee, travel_fee_per_km, max_travel_distance,
  working_hours, average_rating, total_reviews, total_bookings, completion_rate, is_featured, is_premium,
  social_media, contact_preferences, insurance_info, background_check, emergency_contact, banking_info, tax_info,
  is_deleted, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440004', -- sarah.beauty@example.com
  'Sarah Beauty Studio',
  'Licensed Esthetician & Beauty Specialist',
  'Passionate beauty professional with 8+ years of experience in skincare, makeup, and beauty treatments.',
  'Specializing in facials, chemical peels, microdermabrasion, and anti-aging treatments. Certified in advanced skincare techniques and committed to helping clients achieve their beauty goals.',
  'facial',
  'active',
  'verified',
  8,
  '[{"city": "New York", "state": "NY", "country": "USA", "postalCode": "10001", "radiusKm": 25, "travelFee": 15.00}]',
  'both',
  15.00,
  0.50,
  25.00,
  '{"monday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "tuesday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "wednesday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "thursday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "friday": {"start": "09:00", "end": "18:00", "isAvailable": true}, "saturday": {"start": "10:00", "end": "16:00", "isAvailable": true}, "sunday": {"start": "10:00", "end": "16:00", "isAvailable": false}}',
  4.8,
  45,
  120,
  98.5,
  true,
  true,
  '{"instagram": "@sarahbeauty", "facebook": "Sarah Beauty Studio", "website": "https://sarahbeauty.com"}',
  '{"preferredContactMethod": "both", "responseTime": 2, "autoReplyMessage": "Thank you for your message. I will respond within 2 hours."}',
  '{"hasInsurance": true, "insuranceProvider": "Beauty Pro Insurance", "policyNumber": "BPI-2024-001", "expiryDate": "2025-12-31", "coverageAmount": 1000000}',
  '{"isCompleted": true, "completedDate": "2024-01-15", "expiresDate": "2027-01-15", "status": "passed", "notes": "Background check completed successfully"}',
  '{"name": "John Beauty", "relationship": "Spouse", "phone": "+1234567890", "email": "john@sarahbeauty.com"}',
  '{"accountHolderName": "Sarah Beauty", "accountNumber": "1234567890", "routingNumber": "021000021", "bankName": "Chase Bank", "accountType": "checking"}',
  '{"taxId": "12-3456789", "taxIdType": "ssn", "businessName": "Sarah Beauty Studio", "businessAddress": "123 Beauty St, New York, NY 10001"}',
  false,
  NOW(),
  NOW()
);

-- Professional 2: Mike Stylist (Hair & Grooming)
INSERT INTO professionals (
  id, user_id, business_name, professional_title, bio, description, category, status, verification_status,
  years_experience, service_areas, travel_mode, base_travel_fee, travel_fee_per_km, max_travel_distance,
  working_hours, average_rating, total_reviews, total_bookings, completion_rate, is_featured, is_premium,
  social_media, contact_preferences, insurance_info, background_check, emergency_contact, banking_info, tax_info,
  is_deleted, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440005', -- mike.stylist@example.com
  'Mike Stylist Mobile',
  'Master Hair Stylist & Grooming Expert',
  'Experienced hair stylist specializing in mens cuts, styling, and grooming services.',
  'Offering professional haircuts, beard trims, styling, and grooming services. Available for home visits and salon appointments. Committed to delivering exceptional results and customer satisfaction.',
  'hair',
  'active',
  'verified',
  12,
  '[{"city": "Los Angeles", "state": "CA", "country": "USA", "postalCode": "90210", "radiusKm": 30, "travelFee": 20.00}]',
  'home_visit',
  20.00,
  0.75,
  30.00,
  '{"monday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "tuesday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "wednesday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "thursday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "friday": {"start": "10:00", "end": "19:00", "isAvailable": true}, "saturday": {"start": "09:00", "end": "17:00", "isAvailable": true}, "sunday": {"start": "09:00", "end": "17:00", "isAvailable": false}}',
  4.9,
  67,
  89,
  97.8,
  true,
  false,
  '{"instagram": "@mikestylist", "facebook": "Mike Stylist Mobile", "website": "https://mikestylist.com"}',
  '{"preferredContactMethod": "phone", "responseTime": 1, "autoReplyMessage": "Thanks for contacting Mike Stylist. I will call you back within 1 hour."}',
  '{"hasInsurance": true, "insuranceProvider": "Hair Pro Insurance", "policyNumber": "HPI-2024-002", "expiryDate": "2025-12-31", "coverageAmount": 500000}',
  '{"isCompleted": true, "completedDate": "2024-02-01", "expiresDate": "2027-02-01", "status": "passed", "notes": "Background check completed successfully"}',
  '{"name": "Lisa Stylist", "relationship": "Sister", "phone": "+1234567891", "email": "lisa@mikestylist.com"}',
  '{"accountHolderName": "Mike Stylist", "accountNumber": "0987654321", "routingNumber": "121000248", "bankName": "Bank of America", "accountType": "checking"}',
  '{"taxId": "98-7654321", "taxIdType": "ssn", "businessName": "Mike Stylist Mobile", "businessAddress": "456 Style Ave, Los Angeles, CA 90210"}',
  false,
  NOW(),
  NOW()
);

-- Professional 3: Lisa Massage (Wellness & Therapy)
INSERT INTO professionals (
  id, user_id, business_name, professional_title, bio, description, category, status, verification_status,
  years_experience, service_areas, travel_mode, base_travel_fee, travel_fee_per_km, max_travel_distance,
  working_hours, average_rating, total_reviews, total_bookings, completion_rate, is_featured, is_premium,
  social_media, contact_preferences, insurance_info, background_check, emergency_contact, banking_info, tax_info,
  is_deleted, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440006', -- lisa.massage@example.com
  'Lisa Massage Therapy',
  'Licensed Massage Therapist & Wellness Coach',
  'Certified massage therapist with expertise in therapeutic massage, relaxation, and wellness.',
  'Specializing in Swedish massage, deep tissue massage, sports massage, and relaxation therapy. Committed to promoting wellness and helping clients achieve physical and mental balance.',
  'massage',
  'inactive',
  'verified',
  6,
  '[{"city": "Chicago", "state": "IL", "country": "USA", "postalCode": "60601", "radiusKm": 20, "travelFee": 12.00}]',
  'both',
  12.00,
  0.60,
  20.00,
  '{"monday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "tuesday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "wednesday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "thursday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "friday": {"start": "08:00", "end": "17:00", "isAvailable": true}, "saturday": {"start": "09:00", "end": "15:00", "isAvailable": false}, "sunday": {"start": "09:00", "end": "15:00", "isAvailable": false}}',
  4.7,
  34,
  56,
  96.4,
  false,
  false,
  '{"instagram": "@lisamassage", "facebook": "Lisa Massage Therapy", "website": "https://lisamassage.com"}',
  '{"preferredContactMethod": "email", "responseTime": 4, "autoReplyMessage": "Thank you for your message. I will respond within 4 hours."}',
  '{"hasInsurance": true, "insuranceProvider": "Wellness Pro Insurance", "policyNumber": "WPI-2024-003", "expiryDate": "2025-12-31", "coverageAmount": 750000}',
  '{"isCompleted": true, "completedDate": "2024-01-20", "expiresDate": "2027-01-20", "status": "passed", "notes": "Background check completed successfully"}',
  '{"name": "Tom Massage", "relationship": "Husband", "phone": "+1234567892", "email": "tom@lisamassage.com"}',
  '{"accountHolderName": "Lisa Massage", "accountNumber": "1122334455", "routingNumber": "071000013", "bankName": "Wells Fargo", "accountType": "checking"}',
  '{"taxId": "11-2233445", "taxIdType": "ssn", "businessName": "Lisa Massage Therapy", "businessAddress": "789 Wellness Blvd, Chicago, IL 60601"}',
  false,
  NOW(),
  NOW()
);
