#!/bin/bash

# Test Database Setup Script for Beauty Place
# This script sets up the test PostgreSQL database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Setting up Beauty Place Test Database...${NC}"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running. Please start PostgreSQL first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Test database configuration
DB_NAME="beauty_place_test"
DB_USER="beauty_user"
DB_PASSWORD="beauty_password_123"

# Create test database
echo -e "${YELLOW}📝 Creating test database...${NC}"

psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo -e "${YELLOW}⚠️  Test database $DB_NAME already exists${NC}"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || echo -e "${YELLOW}⚠️  Privileges already granted${NC}"

echo -e "${GREEN}✅ Test database created${NC}"

# Run the initial migration on test database
echo -e "${YELLOW}📝 Running initial migration on test database...${NC}"

psql -U $DB_USER -d $DB_NAME -f src/database/migrations/001-initial-schema.sql

echo -e "${GREEN}✅ Test database schema created successfully!${NC}"

# Create .env.test file
echo -e "${YELLOW}📝 Creating .env.test file...${NC}"

cat > .env.test << EOF
# Test Environment Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET=test-jwt-secret-key-for-testing-purposes-only
JWT_REFRESH_SECRET=test-refresh-secret-key-for-testing-purposes-only
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
PORT=3001
NODE_ENV=test
LOG_LEVEL=debug
BCRYPT_ROUNDS=4
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=1000
EOF

echo -e "${GREEN}✅ .env.test file created${NC}"

echo -e "${GREEN}🎉 Test database setup complete!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Run tests: npm run test"
echo -e "   2. Run E2E tests: npm run test:e2e"
echo -e "   3. The test database is ready for testing"
