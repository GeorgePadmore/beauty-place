# Beauty Place - Technical Architecture

## 🏗️ **System Overview**

Beauty Place is built as a **monolithic NestJS application** with a **PostgreSQL database**, designed for scalability and maintainability. The architecture follows **clean architecture principles** with clear separation of concerns and modular design.

## 🎯 **Architecture Principles**

### **1. Clean Architecture**
- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each module has one clear purpose
- **Open/Closed Principle**: Open for extension, closed for modification

### **2. Modular Design**
- **Feature-based Modules**: Each business domain is a separate module
- **Shared Common Module**: Reusable utilities, guards, and decorators
- **Loose Coupling**: Modules communicate through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together

### **3. Scalability First**
- **Horizontal Scaling**: Stateless application design
- **Database Optimization**: Proper indexing and query optimization
- **Caching Strategy**: Redis integration for performance
- **Microservices Ready**: Can be split into microservices later

## 🏛️ **Current Architecture**

### **Technology Stack**
```
Frontend (Future) ←→ Backend API ←→ Database
                ↓
            Authentication
                ↓
            Business Logic
                ↓
            Data Access Layer
                ↓
            PostgreSQL Database
```

### **Core Technologies**
- **Runtime**: Node.js 18+ LTS
- **Framework**: NestJS 10+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM 0.3+
- **Authentication**: JWT + Passport.js
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI 3.0

## 📁 **Project Structure**

```
src/
├── app.module.ts                 # Root application module
├── main.ts                      # Application entry point
├── app.controller.ts            # Health check endpoint
├── app.service.ts               # Application service
│
├── config/                      # Configuration management
│   ├── config.module.ts        # Environment variables
│   ├── database.config.ts      # Database configuration
│   └── database-sync.config.ts # Environment-based sync settings
│
├── database/                    # Database management
│   ├── database.module.ts      # TypeORM integration
│   ├── database-sync.service.ts # Schema sync and seeding
│   ├── migrations/             # Database migrations
│   └── seeds/                  # Seed data
│
├── common/                      # Shared utilities
│   ├── helpers/                # Helper functions
│   │   └── api-response.helper.ts # Standardized API responses
│   ├── interfaces/             # Shared interfaces
│   │   └── user-profile.interface.ts # User profile types
│   ├── decorators/             # Custom decorators
│   │   ├── public.decorator.ts # Public route marker
│   │   └── current-user.decorator.ts # User extraction
│   ├── guards/                 # Authentication guards
│   │   └── jwt-auth.guard.ts   # JWT authentication guard
│   └── strategies/             # Passport strategies
│       └── jwt.strategy.ts     # JWT validation strategy
│
├── users/                       # User management module
│   ├── users.module.ts         # Module definition
│   ├── users.controller.ts     # REST API endpoints
│   ├── users.service.ts        # Business logic
│   ├── entities/               # Database entities
│   │   └── user.entity.ts      # User data model
│   └── dto/                    # Data transfer objects
│       ├── create-user.dto.ts  # User creation
│       ├── update-user.dto.ts  # User updates
│       ├── login.dto.ts        # Login credentials
│       └── user-response.dto.ts # User responses
│
├── auth/                        # Authentication module
│   ├── auth.module.ts          # Module definition
│   ├── auth.controller.ts      # Auth endpoints
│   └── auth.service.ts         # Authentication logic
│
├── professionals/               # Professional profiles (planned)
├── services/                    # Service catalog (planned)
├── bookings/                    # Booking system (planned)
├── payments/                    # Payment processing (planned)
└── availability/                # Scheduling system (planned)
```

## 🔐 **Authentication Architecture**

### **JWT Token Flow**
```
1. User Login → 2. JWT Generation → 3. Cookie Storage → 4. Request Validation
     ↓              ↓                ↓                ↓
  Credentials   Token + Payload   HTTP-Only      Route Protection
  Validation    User Info        Secure Cookie   User Extraction
```

### **Security Features**
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Cookies**: HTTPS-only in production
- **SameSite Policy**: Prevents CSRF attacks
- **Token Expiration**: 24-hour session limit
- **Role-Based Access**: Different permissions per user type

### **Route Protection Strategy**
```typescript
// Public routes (no authentication required)
@Public()
@Post('login')
async login() { ... }

// Protected routes (authentication required)
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile() { ... }
```

## 🗄️ **Database Architecture**

### **Entity Relationships**
```
User (1) ←→ (1) Professional
  ↓              ↓
  ↓              ↓
  ↓              ↓
Booking ←→ (1) Service
  ↓              ↓
  ↓              ↓
Payment ←→ (1) ServiceAccount
```

### **Database Design Principles**
- **Normalization**: Proper 3NF design
- **Indexing Strategy**: Performance optimization
- **Foreign Key Constraints**: Data integrity
- **Soft Deletes**: Data preservation
- **Audit Trails**: Change tracking

### **Current Entities**
1. **User**: Core user information and authentication
2. **Professional**: Extended user profile for service providers
3. **Service**: Service definitions and pricing
4. **Availability**: Professional scheduling and time slots
5. **Booking**: Service appointments and status
6. **Payment**: Financial transactions and webhooks
7. **ServiceAccount**: Professional financial management
8. **ServiceAccountTransaction**: Financial transaction history
9. **WithdrawalRequest**: Professional payout requests
10. **PricingConfig**: Platform fee configuration

## 🔄 **API Response Architecture**

### **Standardized Response Format**
```typescript
interface ApiResponse<T> {
  success: boolean;           // Operation success status
  responseMessage: string;    // Human-readable message
  responseData?: T;          // Actual response data
  responseCode: string;      // Business logic codes
  timestamp: string;         // ISO 8601 timestamp
}
```

### **Response Codes**
- **000**: Success
- **001**: General error
- **400**: Validation error
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found
- **409**: Conflict
- **500**: Internal server error

### **Helper Functions**
```typescript
// Success responses
ApiResponseHelper.success(data, message, code)

// Error responses
ApiResponseHelper.error(message, code, details)
ApiResponseHelper.notFound(resource)
ApiResponseHelper.unauthorized()
ApiResponseHelper.forbidden()
ApiResponseHelper.conflict(message)
```

## 🚀 **Performance & Scalability**

### **Current Optimizations**
- **Database Indexing**: Proper indexes on frequently queried fields
- **Query Optimization**: Efficient TypeORM queries
- **Connection Pooling**: Database connection management
- **Response Caching**: Static response caching

### **Future Optimizations**
- **Redis Caching**: Session and data caching
- **CDN Integration**: Static asset delivery
- **Load Balancing**: Multiple application instances
- **Database Sharding**: Horizontal database scaling
- **Microservices**: Service decomposition

## 🔧 **Development & Deployment**

### **Environment Configuration**
```typescript
// Development
syncSchema: true,      // Auto-sync database schema
dropSchema: false,     // Don't drop existing data
runMigrations: false,  // Don't run migrations
runSeeds: true         // Run seed data

// Production
syncSchema: false,     // Never auto-sync
dropSchema: false,     // Never drop data
runMigrations: true,   // Always run migrations
runSeeds: false        // Never run seeds
```

### **Database Synchronization Strategy**
- **Development**: Auto-sync for rapid development
- **Staging**: Migration-based with optional sync
- **Production**: Migration-only for data safety

### **Testing Strategy**
- **Unit Tests**: Jest with >90% coverage
- **Integration Tests**: End-to-end API testing
- **Database Tests**: Isolated test database
- **Performance Tests**: Load and stress testing

## 📊 **Monitoring & Observability**

### **Current Monitoring**
- **Application Logs**: NestJS built-in logging
- **Database Queries**: TypeORM query logging
- **Error Tracking**: Exception handling and logging
- **Health Checks**: Application status endpoints

### **Future Monitoring**
- **Application Metrics**: Response times, error rates
- **Database Metrics**: Query performance, connection status
- **Business Metrics**: User activity, transaction volume
- **Infrastructure Metrics**: CPU, memory, disk usage

## 🔮 **Future Architecture Evolution**

### **Phase 1: Monolithic (Current)**
- Single application with modular structure
- Shared database and authentication
- Easy development and deployment

### **Phase 2: Modular Monolith**
- Enhanced module boundaries
- Internal service communication
- Shared infrastructure services

### **Phase 3: Microservices**
- Service decomposition
- API Gateway implementation
- Service mesh integration
- Distributed data management

### **Phase 4: Event-Driven Architecture**
- Event sourcing and CQRS
- Message queues and streaming
- Real-time data synchronization
- Advanced analytics and ML

## 🎯 **Architecture Benefits**

### **Current Benefits**
- **Rapid Development**: Fast iteration and feature delivery
- **Easy Deployment**: Single application deployment
- **Simple Testing**: Integrated testing environment
- **Cost Effective**: Lower infrastructure costs

### **Future Benefits**
- **Scalability**: Handle millions of users
- **Maintainability**: Clear service boundaries
- **Technology Diversity**: Different tech stacks per service
- **Team Autonomy**: Independent service development

This technical architecture provides a solid foundation for building a scalable, maintainable beauty services marketplace while maintaining flexibility for future growth and evolution.
