<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-85%25%20complete-brightgreen" alt="Project Status" />
  <img src="https://img.shields.io/badge/node-v18+-blue" alt="Node Version" />
  <img src="https://img.shields.io/badge/postgresql-15+-blue" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

# Beauty Place - On-Demand Beauty Services Marketplace

## 🎯 **Project Overview**
**Beauty Place** is a comprehensive marketplace platform that connects beauty service professionals with clients seeking on-demand beauty services. The platform facilitates service discovery, booking, payment processing, and service delivery management.

### 🏗️ **System Architecture**
- **Platform Type**: Web application with responsive design for mobile and desktop
- **Architecture**: Monolithic NestJS backend (scalable to microservices later)
- **Database**: PostgreSQL with TypeORM for data persistence
- **Authentication**: JWT-based with HTTP-only cookies and RBAC
- **Payment**: Stripe integration (currently mocked for development)
- **Search**: Advanced search engine with location-based discovery
- **Notifications**: Multi-channel notification system (email, SMS, push, in-app)

### 🔑 **Key Features**
- **User Management**: Client, Professional, and Admin roles with RBAC
- **Professional Profiles**: Verified professionals with portfolios and services
- **Service Management**: Detailed service offerings with pricing and availability
- **Booking System**: Real-time availability management with double-booking prevention
- **Payment Processing**: Secure payment handling with Stripe integration
- **Search & Discovery**: Advanced search with filters and location-based results
- **Notification System**: Multi-channel communication for users

## 🚀 **Quick Start**

### Prerequisites
- **Node.js**: v18 or higher
- **PostgreSQL**: v15 or higher
- **npm**: v8 or higher

### Environment Setup
Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/beauty_place
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
API_PREFIX=api

# Stripe Configuration (for production)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd beauty-place

# Install dependencies
npm install

# Start PostgreSQL service
# (Ensure PostgreSQL is running on your system)

# Run database migrations and seed data
npm run start:dev
# The application will automatically sync the database schema and seed initial data

# The application will be available at:
# - API: http://localhost:3000/api
# - Swagger Docs: http://localhost:3000/api
# - Health Check: http://localhost:3000/health
```

## 📋 **Project Setup Commands**

```bash
# Install dependencies
npm install

# Development mode with auto-reload
npm run start:dev

# Production build
npm run build

# Production mode
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Test coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

## 🗄️ **Database Setup**

### Automatic Setup (Development)
The application automatically:
- Creates all necessary tables
- Seeds initial data (users, professionals, services, etc.)
- Sets up database indexes for performance
- Configures platform pricing and notification templates

### Manual Setup (Production)
```bash
# Create database
createdb beauty_place

# Run migrations (when implemented)
npm run migration:run

# Seed data (optional)
npm run seed
```

## 🔐 **Authentication & Testing**

### 🚀 **Quick Testing - Seed Data Available**

The system automatically seeds comprehensive test data for immediate testing. **No manual setup required!**

#### **Default Test Users (Auto-created)**
```json
// Client User - Full access to booking and search
{
  "email": "client@beautyplace.com",
  "password": "password123",
  "role": "client"
}

// Professional User - Can manage services and availability
{
  "email": "professional@beautyplace.com",
  "password": "password123",
  "role": "professional"
}

// Admin User - Full platform access
{
  "email": "admin@beautyplace.com",
  "password": "password123",
  "role": "admin"
}
```

#### **📊 Seed Data Summary**
- **3 Professional Users** with complete profiles
- **Multiple Services** across different categories (beauty, grooming, wellness)
- **Availability Slots** for testing booking scenarios
- **Notification Templates** for all communication types
- **Platform Configuration** with pricing and fees
- **Sample Coordinates** for location-based search testing

#### **🔗 Quick Test Links**
```bash
# 1. Health Check (No auth required)
curl http://localhost:3000/health

# 2. View All Professionals (Public)
curl http://localhost:3000/api/professionals

# 3. View All Services (Public)
curl http://localhost:3000/api/services

# 4. Search Services by Category
curl "http://localhost:3000/api/search/services?category=beauty"

# 5. Login as Client (Get JWT token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "client@beautyplace.com", "password": "password123"}'
```

#### **🎯 Ready-to-Test Scenarios**
1. **Browse Services** → `GET /api/services` (Public)
2. **Search Professionals** → `GET /api/search/professionals?category=beauty` (Public)
3. **Client Login** → `POST /api/auth/login` (Use client credentials above)
4. **View Profile** → `GET /api/users/profile` (Authenticated)
5. **Search & Book** → Use search endpoints then create bookings
6. **Admin Access** → Login with admin credentials for full platform access

### 📋 **Complete Seed Data Details**

#### **Professional Users Created**
```json
// Sarah Beauty Studio (Beauty Category)
{
  "id": "550e8400-e29b-41d4-a716-446655440011",
  "businessName": "Sarah Beauty Studio",
  "category": "beauty",
  "location": "New York, NY",
  "coordinates": [40.7589, -73.9851],
  "services": ["Hair Styling", "Makeup", "Facial Treatment"]
}

// Mike Stylist Mobile (Grooming Category)
{
  "id": "550e8400-e29b-41d4-a716-446655440012", 
  "businessName": "Mike Stylist Mobile",
  "category": "grooming",
  "location": "Los Angeles, CA",
  "coordinates": [34.0522, -118.2437],
  "services": ["Haircut", "Beard Trim", "Styling"]
}

// Lisa Massage Therapy (Wellness Category)
{
  "id": "550e8400-e29b-41d4-a716-446655440013",
  "businessName": "Lisa Massage Therapy", 
  "category": "wellness",
  "location": "Chicago, IL",
  "coordinates": [41.8781, -87.6298],
  "services": ["Swedish Massage", "Deep Tissue", "Relaxation"]
}
```

#### **Services Available for Testing**
- **Beauty Services**: Hair styling ($45-120), Makeup ($60-150), Facial treatments ($80-200)
- **Grooming Services**: Haircuts ($25-75), Beard trims ($15-40), Styling ($30-80)
- **Wellness Services**: Massage therapy ($80-150), Relaxation sessions ($60-120)

#### **Availability Slots**
- **Weekdays**: 9:00 AM - 6:00 PM (most professionals)
- **Weekends**: 10:00 AM - 4:00 PM (varies by professional)
- **Travel Services**: Home visits with distance-based pricing
- **Real-time Updates**: Automatic availability management

### 🧪 **5-Minute Test Workflow**

```bash
# Step 1: Verify system is running
curl http://localhost:3000/health

# Step 2: Explore public data (no auth needed)
curl http://localhost:3000/api/professionals | jq '.[0:2]'
curl http://localhost:3000/api/services | jq '.[0:2]'

# Step 3: Test search functionality
curl "http://localhost:3000/api/search/professionals?category=beauty"
curl "http://localhost:3000/api/search/services?maxPrice=100"

# Step 4: Login as client
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "client@beautyplace.com", "password": "password123"}' | jq -r '.data.accessToken')

# Step 5: Access authenticated endpoints
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users/profile

# Step 6: Test admin access
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@beautyplace.com", "password": "password123"}' | jq -r '.data.accessToken')

curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/notifications/templates
```

### 🔗 **Quick Access to Full Documentation**

#### **📚 Detailed Documentation Files**
- **`documents/architecture_design_document.docx`** - Complete system architecture and design
- **`documents/assumptions.md`** - Project requirements and business assumptions
- **`documents/project_summary.md`** - Current implementation status and progress
- **`documents/rbac_testing_results.md`** - Role-based access control testing results

#### **🎯 Testing Resources**
- **Swagger API Docs**: http://localhost:3000/api (Interactive API testing)
- **Health Endpoints**: http://localhost:3000/health (System status)
- **Cookie Files**: Use `cookies.txt`, `client_cookies.txt`, `prof_cookies.txt` for quick testing

#### **🚨 Common Testing Issues & Solutions**
```bash
# Issue: "Database sync failed"
# Solution: Check PostgreSQL is running and DATABASE_URL is correct

# Issue: "Search not working"
# Solution: Restart app to trigger database sync with coordinates

# Issue: "Admin login failed" 
# Solution: Check if admin user was seeded, restart app if needed

# Issue: "Price filtering not working"
# Solution: Database schema needs DECIMAL conversion, restart app
```

### Authentication Flow
```bash
# 1. Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@beautyplace.com",
    "password": "password123"
  }'

# 2. Use the token in subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/users/profile
```

## 🧪 **API Testing Commands**

### Health Check
```bash
curl http://localhost:3000/health
```

### User Management
```bash
# Get user profile (authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/profile

# Update user profile
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe"}'
```

### Professional Management
```bash
# Get all professionals
curl http://localhost:3000/api/professionals

# Get professional by ID
curl http://localhost:3000/api/professionals/PROFESSIONAL_ID

# Create professional profile (requires professional role)
curl -X POST http://localhost:3000/api/professionals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "My Beauty Studio",
    "category": "beauty",
    "description": "Professional beauty services"
  }'
```

### Service Management
```bash
# Get all services
curl http://localhost:3000/api/services

# Get services by professional
curl http://localhost:3000/api/services/professional/PROFESSIONAL_ID

# Create service (requires professional role)
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hair Styling",
    "description": "Professional hair styling service",
    "basePrice": 50.00,
    "category": "beauty"
  }'
```

### Availability Management
```bash
# Get professional availability
curl http://localhost:3000/api/availability/professional/PROFESSIONAL_ID

# Create availability slot (requires professional role)
curl -X POST http://localhost:3000/api/availability \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "maxBookings": 5
  }'
```

### Booking Management
```bash
# Get user bookings
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/bookings/my-bookings

# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "PROFESSIONAL_ID",
    "serviceId": "SERVICE_ID",
    "availabilityId": "AVAILABILITY_ID",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z"
  }'
```

### Search & Discovery
```bash
# Search professionals
curl "http://localhost:3000/api/search/professionals?category=beauty&minRating=4.0"

# Search services
curl "http://localhost:3000/api/search/services?category=beauty&maxPrice=100"

# Get search suggestions
curl "http://localhost:3000/api/search/suggestions?query=hair"
```

### Payment Processing
```bash
# Create payment intent
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "amount": 50.00
  }'

# Confirm payment
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_1234567890",
    "bookingId": "BOOKING_ID"
  }'
```

### Notifications
```bash
# Get user notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications

# Update notification preferences
curl -X PATCH http://localhost:3000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": true,
    "sms": false,
    "push": true
  }'
```

## 🔍 **Search & Testing Scenarios**

### Test Data Available
The system seeds:
- **3 Professional Users** with different categories (beauty, grooming, wellness)
- **Multiple Services** with varying prices and categories
- **Availability Slots** for testing booking scenarios
- **Notification Templates** for different scenarios

### Common Test Scenarios
```bash
# 1. Client searches for beauty services
curl "http://localhost:3000/api/search/services?category=beauty"

# 2. Client books a service
# (Use the booking creation commands above)

# 3. Professional confirms booking
curl -X PATCH http://localhost:3000/api/bookings/BOOKING_ID/status \
  -H "Authorization: Bearer PROFESSIONAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# 4. Client makes payment
# (Use the payment commands above)

# 5. Check notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications
```

## 🚨 **Troubleshooting**

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U username -d beauty_place
```

#### Application Startup
```bash
# Check logs
npm run start:dev

# Check database sync
# Look for "Database sync completed successfully" in logs
```

#### Search Issues
```bash
# Check if coordinates are populated
curl "http://localhost:3000/api/professionals" | jq '.[0].latitude'

# If null, restart application to trigger database sync
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run start:dev

# Check specific module
DEBUG=*:database* npm run start:dev
```

## 📚 **API Documentation**

### Swagger UI
- **URL**: http://localhost:3000/api
- **Features**: Interactive API documentation, request testing, schema validation

### API Response Format
All API responses follow a standardized format:

```json
{
  "success": true,
  "responseCode": "000",
  "responseMessage": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 🏗️ **Project Structure**

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module configuration
├── config/                          # Configuration management
├── database/                        # Database management
├── common/                          # Shared components
├── auth/                            # Authentication module
├── users/                           # User management
├── professionals/                   # Professional profiles
├── services/                        # Service offerings
├── availability/                    # Availability management
├── bookings/                        # Booking management
├── payments/                        # Payment processing
├── search/                          # Search & discovery
└── notifications/                   # Notification system
```

## 🚀 **Deployment**

### Production Build
```bash
# Build application
npm run build

# Start production server
npm run start:prod

# Or use PM2
pm2 start dist/main.js --name "beauty-place"
```

### Environment Variables
Ensure all production environment variables are set:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 📊 **Monitoring & Health Checks**

### Health Endpoints
- **Overall Health**: `GET /health`
- **Database Health**: `GET /health/db`
- **API Status**: `GET /health/api`

### Logging
- **Application Logs**: Console and file logging
- **Request Logging**: HTTP request/response logging
- **Error Logging**: Structured error logging with stack traces

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 **License**

This project is [MIT licensed](LICENSE).

## 🆘 **Support**

- **Issues**: Create an issue in the repository
- **Documentation**: Check the `/documents` folder for detailed documentation
- **Architecture**: See `documents/architecture_design_document.docx` for system design
- **Assumptions**: See `documents/assumptions.md` for project assumptions and requirements
