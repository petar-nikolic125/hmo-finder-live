#!/bin/bash
# Test script to verify Python scraper is working in production

echo "🔍 Testing HMO Property Scraper..."

# Test Python imports first
echo "📦 Testing Python imports..."
python3 -c "
import sys
try:
    import requests
    import bs4
    import lxml
    print('✅ All required packages imported successfully')
    print(f'📦 Python: {sys.version}')
    print(f'📦 requests: {requests.__version__}')
    print(f'📦 beautifulsoup4: {bs4.__version__}')
except ImportError as e:
    print(f'❌ Import error: {e}')
    print('💡 Run ./scripts/setup-python.sh to fix this')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Python imports failed. Run ./scripts/setup-python.sh first."
    exit 1
fi

# Test the scraper directly
echo ""
echo "🕷️ Testing scraper with Liverpool sample..."
cd server/scraper
timeout 30 python3 prime_scraper.py '{"city": "Liverpool", "minBedrooms": 4, "maxPrice": 500000, "keywords": "HMO", "count": 5}' --test

if [ $? -eq 0 ]; then
    echo "✅ Scraper test completed successfully!"
else
    echo "⚠️ Scraper test had issues (timeout or error)"
fi

echo ""
echo "🔧 If everything looks good, your production deployment should work!"
echo "💡 Test the full API at: /api/properties?city=Liverpool&count=5&minRooms=4&maxPrice=500000&keywords=HMO"