-- Seed data for testing users
-- Passwords are hashed versions of 'password123'

-- Client users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_email_verified, is_active, is_deleted, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'john.doe@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG', -- password123
  'client',
  'John',
  'Doe',
  '+1234567890',
  true,
  true,
  false,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'jane.smith@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG', -- password123
  'client',
  'Jane',
  'Smith',
  '+1234567891',
  true,
  true,
  false,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'bob.wilson@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG', -- password123
  'client',
  'Bob',
  'Wilson',
  '+1234567892',
  false,
  true,
  false,
  NOW(),
  NOW()
);

-- Professional users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_email_verified, is_active, is_deleted, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440004',
  'sarah.beauty@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG', -- password123
  'professional',
  'Sarah',
  'Beauty',
  '+1234567893',
  true,
  true,
  false,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'mike.stylist@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG', -- password123
  'professional',
  'Mike',
  'Stylist',
  '+1234567894',
  true,
  true,
  false,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'lisa.massage@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s8uG', -- password123
  'professional',
  'Lisa',
  'Massage',
  '+1234567895',
  true,
  false,
  false,
  NOW(),
  NOW()
);
