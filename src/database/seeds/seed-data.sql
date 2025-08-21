-- Seed Data for Beauty Place
-- This script populates the database with sample data for testing

-- Insert sample users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_email_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'client1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK6.', 'client', 'Alice', 'Johnson', '+1234567890', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'client2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK6.', 'client', 'Bob', 'Smith', '+1234567891', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'hair@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK6.', 'professional', 'Sarah', 'Wilson', '+1234567892', true, true),
('550e8400-e29b-41d4-a716-446655440004', 'nails@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK6.', 'professional', 'Maria', 'Garcia', '+1234567893', true, true),
('550e8400-e29b-41d4-a716-446655440005', 'makeup@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK6.', 'professional', 'Emma', 'Davis', '+1234567894', true, true);

-- Insert sample professionals
INSERT INTO professionals (id, user_id, business_name, category, description, hourly_rate_cents, travel_mode, latitude, longitude, address, city, state, zip_code, is_active, is_verified) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Sarah\'s Hair Studio', 'hair', 'Professional hair styling and coloring services', 7500, 'stationary', 40.7128, -74.0060, '123 Main St', 'New York', 'NY', '10001', true, true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Maria\'s Nail Art', 'nails', 'Creative nail art and manicure services', 6000, 'mobile', 40.7589, -73.9851, '456 Broadway', 'New York', 'NY', '10002', true, true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Emma\'s Makeup Artistry', 'makeup', 'Professional makeup for special occasions', 8000, 'both', 40.7505, -73.9934, '789 5th Ave', 'New York', 'NY', '10003', true, true);

-- Insert sample services
INSERT INTO services (id, professional_id, name, description, duration_minutes, price_cents, category, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Haircut & Style', 'Professional haircut with styling', 60, 7500, 'hair', true),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Hair Coloring', 'Full hair coloring service', 120, 15000, 'hair', true),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'Manicure', 'Classic manicure with polish', 45, 4500, 'nails', true),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Gel Manicure', 'Gel polish manicure with nail art', 60, 6000, 'nails', true),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'Bridal Makeup', 'Complete bridal makeup look', 90, 12000, 'makeup', true),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', 'Party Makeup', 'Glamorous party makeup', 60, 8000, 'makeup', true);

-- Insert sample availability
INSERT INTO availability (id, professional_id, day_of_week, start_time, end_time, is_available) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, '09:00', '17:00', true), -- Monday
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 2, '09:00', '17:00', true), -- Tuesday
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 3, '09:00', '17:00', true), -- Wednesday
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 4, '09:00', '17:00', true), -- Thursday
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 5, '09:00', '17:00', true), -- Friday
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 1, '10:00', '18:00', true), -- Monday
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 2, '10:00', '18:00', true), -- Tuesday
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 3, '10:00', '18:00', true), -- Wednesday
('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440002', 4, '10:00', '18:00', true), -- Thursday
('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 5, '10:00', '18:00', true), -- Friday
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440003', 1, '11:00', '19:00', true), -- Monday
('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440003', 2, '11:00', '19:00', true), -- Tuesday
('880e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003', 3, '11:00', '19:00', true), -- Wednesday
('880e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440003', 4, '11:00', '19:00', true), -- Thursday
('880e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440003', 5, '11:00', '19:00', true); -- Friday

-- Insert sample bookings (for testing)
INSERT INTO bookings (id, client_id, professional_id, service_id, start_time, end_time, total_price_cents, status, notes) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '2024-01-15 10:00:00', '2024-01-15 11:00:00', 7500, 'confirmed', 'First time client'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', '2024-01-16 14:00:00', '2024-01-16 14:45:00', 4500, 'pending', 'Regular client');

-- Note: All passwords are hashed versions of 'password123'
-- You can generate new hashes using bcrypt with 12 rounds
