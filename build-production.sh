#!/bin/bash

# Production build script for Render deployment
echo "🚀 Starting production build for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Fix the build path issue
echo "🔧 Fixing build paths..."
if [ -d "dist/public" ]; then
    echo "✅ Found dist/public, copying to server/public..."
    mkdir -p server/public
    cp -r dist/public/* server/public/
    echo "✅ Files copied successfully"
    
    # Verify critical files exist
    if [ -f "server/public/index.html" ] && [ -d "server/public/assets" ]; then
        echo "✅ Build verification passed"
    else
        echo "❌ Build verification failed - missing critical files"
        exit 1
    fi
else
    echo "❌ dist/public not found - build failed"
    exit 1
fi

echo "🎉 Production build completed successfully!"