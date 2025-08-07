#!/bin/bash

# Fix build output for production deployment
# The vite config builds to dist/public but server expects server/public

echo "🔧 Fixing build output paths for production deployment..."

# Check if dist/public exists (vite build output)
if [ -d "dist/public" ]; then
    echo "✅ Found vite build output in dist/public"
    
    # Create server/public directory
    mkdir -p server/public
    
    # Copy all files from dist/public to server/public
    cp -r dist/public/* server/public/
    
    echo "✅ Copied build files to server/public for production"
    
    # List copied files for verification
    echo "📁 Files in server/public:"
    ls -la server/public/
else
    echo "❌ dist/public not found. Make sure to run 'vite build' first"
    exit 1
fi

echo "🎉 Build paths fixed for production deployment!"