#!/bin/bash

# Broadcast WebUI Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENV=${1:-"staging"}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
DOCKER_IMAGE="broadcast-webui"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"

echo "🚀 Deploying Broadcast WebUI to $ENV"
echo "📁 Project root: $PROJECT_ROOT"

# Load environment
if [ -f "$PROJECT_ROOT/.env.$ENV" ]; then
  export $(cat "$PROJECT_ROOT/.env.$ENV" | grep -v '^#' | xargs)
  echo "✅ Loaded .env.$ENV"
else
  echo "⚠️  .env.$ENV not found, using .env.example"
  export $(cat "$PROJECT_ROOT/.env.example" | grep -v '^#' | xargs)
fi

# Build Docker image
echo "🔨 Building Docker image..."
cd "$PROJECT_ROOT"
docker build -t "$DOCKER_IMAGE:latest" .
docker tag "$DOCKER_IMAGE:latest" "$DOCKER_REGISTRY/$DOCKER_IMAGE:latest"

if [ "$ENV" = "production" ]; then
  echo "📦 Pushing to registry..."
  docker push "$DOCKER_REGISTRY/$DOCKER_IMAGE:latest"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f "$PROJECT_ROOT/docker-compose.yml" down || true

# Start services
echo "⬆️  Starting services..."
docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d

# Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 5

# Check health
echo "🏥 Health check..."
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Service is ready!"
  echo "🌐 Access at http://localhost:3000"
else
  echo "❌ Service health check failed"
  exit 1
fi

echo "✨ Deployment complete!"
