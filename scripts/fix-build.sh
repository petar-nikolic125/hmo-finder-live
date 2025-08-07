#!/bin/bash

# Fix build output for production deployment
# The vite config builds to dist/public but server expects server/public

echo "🔧 Fixing build output paths for production deployment..."

# Check if dist/public exists (vite build output)
if [ -d "dist/public" ]; then
    echo "✅ Found vite build output in dist/public"
    
    # Remove any existing server/public directory and recreate
    rm -rf server/public
    mkdir -p server/public
    
    # Copy all files from dist/public to server/public
    cp -r dist/public/* server/public/
    
    echo "✅ Copied build files to server/public for production"
    
    # Set proper permissions
    chmod -R 755 server/public/
    
    # List copied files for verification
    echo "📁 Files in server/public:"
    ls -la server/public/ | head -10
    
    # Verify key files exist
    if [ -f "server/public/index.html" ]; then
        echo "✅ index.html found"
    else
        echo "❌ index.html missing!"
        exit 1
    fi
    
    if [ -d "server/public/assets" ]; then
        echo "✅ assets directory found"
    else
        echo "❌ assets directory missing!"
        exit 1
    fi
    
else
    echo "❌ dist/public not found. Make sure to run 'vite build' first"
    exit 1
fi

echo "🎉 Build paths fixed for production deployment!"