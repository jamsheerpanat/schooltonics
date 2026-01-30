#!/bin/bash
set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

echo "Deploying OctoSchoolEngine from $ROOT_DIR..."

# 1. Update Code - Check if .git exists to avoid error if not a git repo
if [ -d "$ROOT_DIR/.git" ]; then
    echo "Step 1: Pulling latest code..."
    cd "$ROOT_DIR"
    git pull origin main
else
    echo "This is not a git repository. Skipping git pull."
fi

# 2. Build Images
echo "Step 2: Building Docker images..."
# The docker compose file has context relative to its location unless overridden.
# We will execute docker compose command from the SCRIPT_DIR to be safe.
cd "$SCRIPT_DIR"
docker compose build

# 3. Start Services
echo "Step 3: Starting services..."
docker compose up -d --remove-orphans

# 4. Wait for Database
echo "Step 4: Waiting for database..."
sleep 15

# 5. Run Migrations
echo "Step 5: Running database migrations..."
docker compose exec -T app php artisan migrate --force

# 6. Health Check
echo "Step 6: Verifying health..."
sleep 5
HEALTH_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health || echo "failed")

if [ "$HEALTH_HTTP_CODE" -eq 200 ]; then
  echo "✅ Deployment Successful! Check: http://localhost/api/v1/health"
else
  echo "⚠️Warning: Health check returned HTTP $HEALTH_HTTP_CODE"
  echo "You may need to wait longer or check 'docker compose logs'"
fi
