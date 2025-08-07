#!/bin/bash

# Deployment script for HMO Property Search Application
# This script builds the application and sets up the correct directory structure for production

echo "🚀 Starting deployment build process..."

# Build the frontend and backend
echo "📦 Building frontend and backend..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create the server/public directory if it doesn't exist
echo "📁 Setting up static file directory..."
mkdir -p server/public

# Copy the built frontend files to the location the server expects
echo "📋 Copying built frontend files..."
cp -r dist/public/* server/public/

# Check if copy was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment build completed successfully!"
    echo "📂 Static files are ready in server/public/"
    echo "🚀 Ready for production deployment!"
else
    echo "❌ Failed to copy static files!"
    exit 1
fi