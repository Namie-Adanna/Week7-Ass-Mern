#!/bin/bash

# Database backup script for MERN Blog application
# This script creates backups of MongoDB database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mern-blog-backup-${DATE}"

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo -e "${BLUE}🗄️  Starting database backup...${NC}"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# MongoDB backup
if [ -n "$MONGODB_URI" ]; then
    echo -e "${BLUE}📦 Creating MongoDB backup...${NC}"
    
    # Extract database name from URI
    DB_NAME=$(echo $MONGODB_URI | sed 's/.*\/\([^?]*\).*/\1/')
    
    # Create backup
    mongodump --uri="$MONGODB_URI" --out="${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Compress backup
    cd ${BACKUP_DIR}
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    rm -rf "${BACKUP_NAME}"
    cd ..
    
    echo -e "${GREEN}✅ MongoDB backup created: ${BACKUP_NAME}.tar.gz${NC}"
else
    echo -e "${YELLOW}⚠️  MONGODB_URI not found, skipping database backup${NC}"
fi

# Cleanup old backups (keep last 7 days)
echo -e "${BLUE}🧹 Cleaning up old backups...${NC}"
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +7 -delete

echo -e "${GREEN}🎉 Backup completed successfully!${NC}"