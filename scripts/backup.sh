#!/bin/bash

# Backup configuration and data

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/broadcast-webui_backup_$TIMESTAMP.tar.gz"

echo "📦 Creating backup..."

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_FILE" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=dist \
  .env.local \
  config/ \
  src/ \
  public/ \
  package.json \
  package-lock.json \
  2>/dev/null || true

echo "✅ Backup created: $BACKUP_FILE"
echo "📊 Size: $(du -h "$BACKUP_FILE" | cut -f1)"
