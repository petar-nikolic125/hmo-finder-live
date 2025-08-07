#!/bin/bash
# Production Python setup script for HMO Property Search
# This ensures Python dependencies are installed in production environment

echo "🐍 Setting up Python environment for HMO Property Search..."

# Check if uv is installed, if not install it
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv package manager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

# Install dependencies from pyproject.toml
echo "📦 Installing Python dependencies..."
uv sync

echo "✅ Python environment setup complete!"
echo "🔧 Available packages:"
uv list

# Verify critical packages for scraping
python3 -c "
import requests
import bs4 
import lxml
print('✅ All scraping packages successfully imported!')
print(f'📦 requests: {requests.__version__}')
print(f'📦 beautifulsoup4: {bs4.__version__}')
"