#!/bin/bash

# Marketplace Production Deployment Script
# This script is run on the production server to deploy updates

set -e

# Configuration
PROJECT_DIR="/opt/marketplace"
BACKUP_DIR="/opt/marketplace/backups"
LOG_FILE="/opt/marketplace/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S')"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup docker-compose file
    if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
        cp "$PROJECT_DIR/docker-compose.yml" "$BACKUP_PATH/"
    fi
    
    # Backup environment files
    if [ -f "$PROJECT_DIR/.env" ]; then
        cp "$PROJECT_DIR/.env" "$BACKUP_PATH/"
    fi
    
    # Backup database (if possible)
    if docker compose -f "$PROJECT_DIR/docker-compose.yml" ps marketplace-db | grep -q "Up"; then
        log "Creating database backup..."
        docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T marketplace-db \
            pg_dump -U marketplace_user marketplace_db > "$BACKUP_PATH/database_backup.sql" 2>/dev/null || \
            warn "Database backup failed, continuing..."
    fi
    
    log "Backup created at: $BACKUP_PATH"
}

# Function to deploy new version
deploy_new_version() {
    log "Starting deployment..."
    
    cd "$PROJECT_DIR" || error "Failed to change to project directory"
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker compose pull || error "Failed to pull Docker images"
    
    # Stop current services
    log "Stopping current services..."
    docker compose down || error "Failed to stop services"
    
    # Start new services
    log "Starting new services..."
    docker compose up -d || error "Failed to start services"
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 10
    
    # Check service health
    if ! docker compose ps | grep -q "healthy"; then
        warn "Some services may not be healthy, checking logs..."
        docker compose logs --tail=20
    fi
    
    log "Deployment completed successfully!"
}

# Function to rollback to previous version
rollback() {
    log "Rolling back to previous version..."
    
    # Find the most recent backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to: $LATEST_BACKUP"
    
    # Stop current services
    docker compose down || true
    
    # Restore from backup
    if [ -f "$BACKUP_DIR/$LATEST_BACKUP/docker-compose.yml" ]; then
        cp "$BACKUP_DIR/$LATEST_BACKUP/docker-compose.yml" "$PROJECT_DIR/"
    fi
    
    if [ -f "$BACKUP_DIR/$LATEST_BACKUP/.env" ]; then
        cp "$BACKUP_DIR/$LATEST_BACKUP/.env" "$PROJECT_DIR/"
    fi
    
    # Start services
    docker compose up -d || error "Failed to start services during rollback"
    
    log "Rollback completed successfully!"
}

# Function to check deployment status
check_status() {
    log "Checking deployment status..."
    
    cd "$PROJECT_DIR" || error "Failed to change to project directory"
    
    echo "=== Service Status ==="
    docker compose ps
    
    echo -e "\n=== Service Health ==="
    docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    
    echo -e "\n=== Recent Logs ==="
    docker compose logs --tail=10
}

# Function to clean up old backups
cleanup_backups() {
    log "Cleaning up old backups (keeping last 5)..."
    
    cd "$BACKUP_DIR" || return
    
    # Keep only the last 5 backups
    ls -t | tail -n +6 | xargs -r rm -rf
    
    log "Backup cleanup completed"
}

# Main execution
main() {
    log "=== Marketplace Deployment Script Started ==="
    
    case "${1:-deploy}" in
        "deploy")
            backup_current
            deploy_new_version
            cleanup_backups
            ;;
        "rollback")
            rollback
            ;;
        "status")
            check_status
            ;;
        "backup")
            backup_current
            ;;
        "cleanup")
            cleanup_backups
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|status|backup|cleanup}"
            echo "  deploy   - Deploy new version (default)"
            echo "  rollback - Rollback to previous version"
            echo "  status   - Check deployment status"
            echo "  backup   - Create backup only"
            echo "  cleanup  - Clean up old backups"
            exit 1
            ;;
    esac
    
    log "=== Marketplace Deployment Script Completed ==="
}

# Run main function with all arguments
main "$@"
