#!/bin/bash

# Database Setup Script for Beauty Place
# This script sets up the PostgreSQL database and runs the initial migration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Beauty Place Database...${NC}"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running. Please start PostgreSQL first.${NC}"
    echo -e "${YELLOW}💡 On macOS: brew services start postgresql${NC}"
    echo -e "${YELLOW}💡 On Ubuntu: sudo systemctl start postgresql${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Database configuration
DB_NAME="beauty_place"
DB_USER="beauty_user"
DB_PASSWORD="beauty_password_123"

# Create database and user
echo -e "${YELLOW}📝 Creating database and user...${NC}"

psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo -e "${YELLOW}⚠️  Database $DB_NAME already exists${NC}"
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo -e "${YELLOW}⚠️  User $DB_USER already exists${NC}"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || echo -e "${YELLOW}⚠️  Privileges already granted${NC}"

echo -e "${GREEN}✅ Database and user created${NC}"

# Run the initial migration
echo -e "${YELLOW}📝 Running initial migration...${NC}"

psql -U $DB_USER -d $DB_NAME -f src/database/migrations/001-initial-schema.sql

echo -e "${GREEN}✅ Database schema created successfully!${NC}"

# Update .env file with database credentials
echo -e "${YELLOW}📝 Updating .env file...${NC}"

# Check if .env exists
if [ -f .env ]; then
    # Update DATABASE_URL in .env
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME|" .env
    echo -e "${GREEN}✅ .env file updated with database credentials${NC}"
else
    echo -e "${RED}❌ .env file not found. Please create it manually.${NC}"
fi

echo -e "${GREEN}🎉 Database setup complete!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Update your .env file with the database credentials above"
echo -e "   2. Run: npm run start:dev"
echo -e "   3. Check the application logs for any connection issues"
