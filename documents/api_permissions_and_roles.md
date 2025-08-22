# Beauty Place - API Permissions & Role-Based Access Control (RBAC)

## 🎯 **Overview**
This document defines the complete permission structure for the Beauty Place API, specifying which endpoints are accessible to different user roles and what operations each role can perform.

## 👥 **User Roles & Permissions**

### **1. Client (Regular Users)**
**Purpose**: End customers seeking beauty services
**Permissions**: Read-only access to public data, manage own bookings and profile

### **2. Professional (Service Providers)**
**Purpose**: Beauty service providers (stylists, therapists, etc.)
**Permissions**: Manage own profile, services, availability, and bookings

### **3. Administrator (Platform Managers)**
**Purpose**: Platform management and support
**Permissions**: Full access to all endpoints and operations

## 🔐 **Authentication & Authorization**

### **Public Endpoints** (`@Public()`)
- No authentication required
- Accessible to all users (including unauthenticated)

### **Protected Endpoints** (`@UseGuards(JwtAuthGuard)`)
- Authentication required
- JWT token validation
- Role-based permission checks

### **Role-Specific Endpoints**
- Additional permission decorators for role validation
- Business logic validation in services

## 📋 **Complete API Endpoint Permissions**

### **🔐 Authentication Module** (`/auth`)

| Endpoint | Method | Access | Description | Permissions |
|-----------|--------|--------|-------------|-------------|
| `/auth/login` | POST | Public | User login | None required |
| `/auth/logout` | POST | Protected | User logout | Authenticated users |
| `/auth/profile` | GET | Protected | Get user profile | Authenticated users |

### **👤 Users Module** (`/users`)

| Endpoint | Method | Access | Description | Permissions |
|-----------|--------|--------|-------------|-------------|
| `/users` | POST | Public | User registration | None required |
| `/users` | GET | Protected | List all users | **Admin only** |
| `/users/:id` | GET | Protected | Get user by ID | **Admin only** or **own profile** |
| `/users/:id` | PATCH | Protected | Update user | **Admin only** or **own profile** |
| `/users/:id` | DELETE | Protected | Delete user | **Admin only** |
| `/users/:id/toggle-active` | PATCH | Protected | Toggle user status | **Admin only** |

### **💼 Professionals Module** (`/professionals`)

| Endpoint | Method | Access | Description | Permissions |
|-----------|--------|--------|-------------|-------------|
| `/professionals` | POST | Protected | Create professional profile | **Professional role only** |
| `/professionals` | GET | Public | List all professionals | None required |
| `/professionals/search` | GET | Public | Search professionals | None required |
| `/professionals/featured` | GET | Public | Get featured professionals | None required |
| `/professionals/:id` | GET | Public | Get professional by ID | None required |
| `/professionals/user/:userId` | GET | Protected | Get professional by user ID | **Admin only** or **own profile** |
| `/professionals/:id` | PATCH | Protected | Update professional | **Admin only** or **own profile** |
| `/professionals/:id` | DELETE | Protected | Delete professional | **Admin only** |
| `/professionals/:id/status` | PATCH | Protected | Update status | **Admin only** |
| `/professionals/:id/verification` | PATCH | Protected | Update verification | **Admin only** |
| `/professionals/:id/featured` | PATCH | Protected | Toggle featured status | **Admin only** |
| `/professionals/:id/premium` | PATCH | Protected | Toggle premium status | **Admin only** |
| `/professionals/:id/rating` | PATCH | Protected | Update rating | **Admin only** |
| `/professionals/:id/completion-rate` | PATCH | Protected | Update completion rate | **Admin only** |

### **🛠️ Services Module** (`/services`)

| Endpoint | Method | Access | Description | Permissions |
|-----------|--------|--------|-------------|-------------|
| `/services` | POST | Protected | Create new service | **Professional role only** |
| `/services` | GET | Public | List all services | None required |
| `/services/search` | GET | Public | Search services | None required |
| `/services/featured` | GET | Public | Get featured services | None required |
| `/services/professional/:professionalId` | GET | Public | Get services by professional | None required |
| `/services/:id` | GET | Public | Get service by ID | None required |
| `/services/:id` | PATCH | Protected | Update service | **Admin only** or **own service** |
| `/services/:id` | DELETE | Protected | Delete service | **Admin only** or **own service** |
| `/services/:id/status` | PATCH | Protected | Update service status | **Admin only** or **own service** |
| `/services/:id/featured` | PATCH | Protected | Toggle featured status | **Admin only** |
| `/services/:id/rating` | PATCH | Protected | Update rating | **Admin only** |
| `/services/:id/completion-rate` | PATCH | Protected | Update completion rate | **Admin only** |

### **📅 Availability Module** (`/availability`)

| Endpoint | Method | Access | Description | Permissions |
|-----------|--------|--------|-------------|-------------|
| `/availability` | POST | Protected | Create availability | **Professional role only** |
| `/availability` | GET | Protected | List all availability | **Admin only** |
| `/availability/professional/:professionalId` | GET | Public | Get professional availability | None required |
| `/availability/professional/:professionalId/weekly` | GET | Public | Get weekly schedule | None required |
| `/availability/professional/:professionalId/available-slots` | GET | Public | Get available time slots | None required |
| `/availability/professional/:professionalId/date-range` | GET | Public | Get availability for date range | None required |
| `/availability/:id` | GET | Protected | Get availability by ID | **Admin only** or **own availability** |
| `/availability/:id` | PATCH | Protected | Update availability | **Admin only** or **own availability** |
| `/availability/:id/status` | PATCH | Protected | Update status | **Admin only** or **own availability** |
| `/availability/:id/toggle-active` | PATCH | Protected | Toggle active status | **Admin only** or **own availability** |
| `/availability/:id/current-bookings` | PATCH | Protected | Update current bookings | **Admin only** or **own availability** |
| `/availability/:id` | DELETE | Protected | Delete availability | **Admin only** or **own availability** |

### **📋 Bookings Module** (`/bookings`)

| Endpoint | Method | Access | Description | Permissions |
|-----------|--------|--------|-------------|-------------|
| `/bookings` | POST | Protected | Create new booking | **Client role only** |
| `/bookings` | GET | Protected | List all bookings | **Admin only** |
| `/bookings/my-bookings` | GET | Protected | Get user's own bookings | **Authenticated users** |
| `/bookings/professional/:professionalId` | GET | Protected | Get professional's bookings | **Admin only** or **own professional profile** |
| `/bookings/upcoming` | GET | Protected | Get upcoming bookings | **Authenticated users** |
| `/bookings/today` | GET | Protected | Get today's bookings | **Authenticated users** |
| `/bookings/:id` | GET | Protected | Get booking by ID | **Admin only** or **related to user** |
| `/bookings/:id` | PATCH | Protected | Update booking | **Admin only** or **related to user** |
| `/bookings/:id/status` | PATCH | Protected | Update booking status | **Admin only** or **related to user** |
| `/bookings/:id/reschedule` | PATCH | Protected | Reschedule booking | **Admin only** or **related to user** |
| `/bookings/:id/review` | PATCH | Protected | Add review/rating | **Client role only** (own completed bookings) |
| `/bookings/:id` | DELETE | Protected | Delete booking | **Admin only** or **related to user** |

## 🚫 **Permission Restrictions by Role**

### **Client Restrictions**
- ❌ Cannot create/update/delete professional profiles
- ❌ Cannot create/update/delete services
- ❌ Cannot create/update/delete availability
- ❌ Cannot access admin-only endpoints
- ❌ Cannot modify other users' data

### **Professional Restrictions**
- ❌ Cannot create/update/delete other professionals' profiles
- ❌ Cannot create/update/delete other professionals' services
- ❌ Cannot create/update/delete other professionals' availability
- ❌ Cannot access admin-only endpoints
- ❌ Cannot modify other users' data

### **Admin Restrictions**
- ❌ Cannot access client-specific features (e.g., create bookings)
- ❌ Cannot access professional-specific features (e.g., manage own services)
- ❌ Should use admin-specific endpoints for management tasks

## 🔒 **Security Implementation**

### **1. Route-Level Protection**
```typescript
// Public endpoint
@Public()
@Get()
async getPublicData() { ... }

// Protected endpoint
@UseGuards(JwtAuthGuard)
@Get()
async getProtectedData() { ... }
```

### **2. Role-Based Guards (Future Implementation)**
```typescript
// Professional-only endpoint
@UseGuards(JwtAuthGuard, ProfessionalGuard)
@Post()
async createService() { ... }

// Admin-only endpoint
@UseGuards(JwtAuthGuard, AdminGuard)
@Delete(':id')
async deleteUser() { ... }
```

### **3. Business Logic Validation**
```typescript
// In services - validate ownership
async updateService(id: string, userId: string, dto: UpdateServiceDto) {
  const service = await this.serviceRepository.findOne({ where: { id } });
  
  // Check if user owns the service or is admin
  if (service.professionalId !== userId && user.role !== 'admin') {
    throw new ForbiddenException('Access denied');
  }
  
  // Continue with update...
}
```

## 📊 **Permission Matrix Summary**

| Module | Client | Professional | Admin |
|--------|--------|--------------|-------|
| **Authentication** | ✅ Login/Logout | ✅ Login/Logout | ✅ Login/Logout |
| **Users** | ✅ Own profile | ✅ Own profile | ✅ All operations |
| **Professionals** | ✅ View only | ✅ Own profile + View others | ✅ All operations |
| **Services** | ✅ View only | ✅ Own services + View others | ✅ All operations |
| **Availability** | ✅ View only | ✅ Own availability + View others | ✅ All operations |
| **Bookings** | ✅ Own bookings + Create | ✅ Own bookings + View clients | ✅ All operations |

## 🚀 **Implementation Priority**

### **Phase 1: Basic RBAC (Current)**
- ✅ JWT authentication
- ✅ Route-level protection
- ✅ Basic role validation

### **Phase 2: Enhanced RBAC (Next)**
- 🔄 Role-specific guards
- 🔄 Permission decorators
- 🔄 Ownership validation

### **Phase 3: Advanced Security**
- 📊 Audit logging
- 📊 Rate limiting
- 📊 Advanced permission system

## 📝 **Notes**

1. **Public endpoints** are accessible to all users without authentication
2. **Protected endpoints** require valid JWT token
3. **Role validation** happens at both route and service levels
4. **Ownership validation** ensures users can only modify their own data
5. **Admin override** allows administrators to access and modify all data
6. **Future enhancements** will include more granular permissions and role hierarchies
