#!/bin/bash

# Initial setup script for Broadcast WebUI

set -e

echo "🚀 Setting up Broadcast WebUI"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed."
  echo "📥 Install from https://nodejs.org/"
  exit 1
fi
echo "✅ Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
  echo "❌ npm is required but not installed."
  exit 1
fi
echo "✅ npm $(npm -v)"

if ! command -v ffmpeg &> /dev/null; then
  echo "⚠️  FFmpeg not found in PATH"
  echo "📥 Install FFmpeg: https://ffmpeg.org/download.html"
else
  echo "✅ FFmpeg $(ffmpeg -version | head -1)"
fi

if ! command -v docker &> /dev/null; then
  echo "⚠️  Docker not found (optional for containerized deployment)"
else
  echo "✅ Docker $(docker --version)"
fi

echo ""
echo "📦 Installing dependencies..."
cd "$(dirname "${BASH_SOURCE[0]}")/.."
npm install

echo ""
echo "⚙️  Setting up environment files..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✅ Created .env.local from .env.example"
  echo "📝 Please edit .env.local with your camera and server settings"
else
  echo "✅ .env.local already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
