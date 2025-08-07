// Production debugging helper for deployment issues
// This script can be run in production to check API endpoints

const checkEndpoints = async () => {
  console.log('🔍 Production Debug Check');
  console.log('========================');
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const endpoints = [
    '/api/ping',
    '/api/cities', 
    '/api/properties?city=Liverpool&count=10&minRooms=4&maxPrice=500000&keywords=HMO'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${baseUrl}${endpoint}`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`📡 Status: ${response.status} ${response.statusText}`);
      console.log(`🌐 URL: ${response.url}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success - Data size: ${JSON.stringify(data).length} chars`);
        
        if (endpoint.includes('properties')) {
          console.log(`🏠 Properties count: ${data.properties?.length || 0}`);
          console.log(`💾 Has properties array: ${!!data.properties}`);
          if (data.properties && data.properties.length > 0) {
            console.log(`🏡 First property:`, {
              address: data.properties[0].address,
              price: data.properties[0].price,
              keys: Object.keys(data.properties[0])
            });
          }
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`🚨 Request failed: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Debug check complete');
};

// Export for use in browser console or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = checkEndpoints;
} else if (typeof window !== 'undefined') {
  window.debugProduction = checkEndpoints;
}

// Auto-run if loaded as script
if (typeof window !== 'undefined') {
  console.log('🔧 Production debug helper loaded. Run debugProduction() to check endpoints.');
}