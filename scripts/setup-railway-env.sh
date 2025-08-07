#!/bin/bash

echo "🚂 Railway Environment Setup"
echo "============================="

# Set Railway-specific environment variables
export NODE_ENV="production"
export PORT="${PORT:-5000}"

# Check Node.js version
echo "📋 Environment Check:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Python: $(python3 --version 2>/dev/null || echo 'Not available')"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Check Python dependencies
echo "🐍 Checking Python dependencies..."
python3 -c "
try:
    import requests, bs4, lxml
    print('✅ Python dependencies available')
except ImportError as e:
    print(f'⚠️ Python import error: {e}')
    print('Consider installing: pip install requests beautifulsoup4 lxml')
" 2>/dev/null || echo "⚠️ Python check failed"

echo "✅ Railway environment setup complete"