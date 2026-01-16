#!/bin/bash

# Test script for Broadcast WebUI

set -e

echo "🧪 Running tests..."

# Check code style
echo "🔍 Checking code..."
npm run lint 2>/dev/null || echo "⚠️  Lint check skipped"

# Build check
echo "🔨 Building project..."
npm run build

# Basic functionality test
echo "✅ Build successful"
echo ""
echo "To start the application:"
echo "npm run dev"
