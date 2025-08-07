
import { useState, useMemo, useEffect } from 'react';
import { useProperties, useRefreshProperties } from '@/hooks/useProperties';
import { PropertySearchParams } from '@/lib/types';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { SortSelect } from '@/components/SortSelect';
import { UpdateBadge } from '@/components/UpdateBadge';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyGridSkeleton } from '@/components/LoadingSkeletons';
import { RefreshFab } from '@/components/RefreshFab';
import { Footer } from '@/components/Footer';
import { PrivacyNoticePopup } from '@/components/PrivacyNoticePopup';
import { SearchStatus } from '@/components/SearchStatus';
import { QuickTutorial } from '@/components/QuickTutorial';
import { useToast } from '@/hooks/use-toast';

export const Home = () => {
  const { toast } = useToast();
  const refresh = useRefreshProperties();

  // Search parameters
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({
    city: 'Liverpool',
    count: 50,
    minRooms: 4,
    maxPrice: 500000,
    keywords: 'HMO',
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // Fetch properties with enhanced messaging
  const { data: searchResult, isLoading, isError, refetch } = useProperties(searchParams);
  const properties = searchResult?.properties || [];
  const expandedResultsMessage = searchResult?.message;
  const hasExpandedResults = searchResult?.hasExpandedResults || false;

  // Filter properties by search term (client-side)
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties;

    const term = searchTerm.toLowerCase();
    return properties.filter(property =>
      property.address.toLowerCase().includes(term) ||
      (property.postcode && property.postcode.toLowerCase().includes(term))
    );
  }, [properties, searchTerm]);

  // Update updated time when properties change
  useEffect(() => {
    if (properties.length > 0) {
      setLastUpdated(Date.now());
    }
  }, [properties]);

  // Error handling with enhanced debugging
  useEffect(() => {
    if (isError) {
      console.error('🚨 Properties API Error:', isError);
      console.log('🌐 Current URL:', window.location.href);
      console.log('🏠 Search params:', searchParams);
      
      toast({
        variant: "destructive",
        title: "Error loading properties",
        description: `API Error: Please check console for details.`,
      });
    }
  }, [isError, toast]);

  // Debug logging for production
  useEffect(() => {
    console.log('🔍 Home component mounted');
    console.log('🌐 Environment:', {
      hostname: window.location.hostname,
      href: window.location.href,
      searchParams
    });
    
    // Production environment detection
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log('🌐 Production environment detected');
      console.log('💡 Tip: Check console for detailed API debug messages');
    }
  }, []);

  useEffect(() => {
    if (searchResult) {
      console.log('📊 Search result received:', {
        propertiesCount: searchResult.properties?.length || 0,
        hasMessage: !!searchResult.message,
        hasExpandedResults: searchResult.hasExpandedResults,
        rawResult: searchResult
      });
      console.log('🔍 Properties array details:', {
        isArray: Array.isArray(searchResult.properties),
        properties: searchResult.properties
      });
    }
  }, [searchResult]);

  const handleSearch = () => {
    if (!hasSearched) {
      setShowPrivacyPopup(true);
      setHasSearched(true);
    }
    refetch();
    setLastUpdated(Date.now());
  };

  const handleRefresh = () => {
    refresh();
    setLastUpdated(Date.now());
    toast({
      title: "Refreshing properties",
      description: "Loading latest HMO opportunities...",
    });
  };

  const updateSearchParams = (updates: Partial<PropertySearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedCity={searchParams.city || 'Birmingham'}
        onCityChange={(city) => updateSearchParams({ city })}
        onShowTutorial={() => setShowTutorial(true)}
      />

      <HeroSection
        searchParams={searchParams}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        onCityChange={(city) => updateSearchParams({ city })}
        onMaxPriceChange={(maxPrice) => updateSearchParams({ maxPrice })}
        onMinRoomsChange={(minRooms) => updateSearchParams({ minRooms })}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Search Status */}
        <SearchStatus 
          count={filteredProperties.length}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />

        {/* Professional expanded results message */}
        {hasExpandedResults && expandedResultsMessage && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {expandedResultsMessage}
            </p>
          </div>
        )}

        {/* Search results header with count and update badge */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Available HMO Properties
            {filteredProperties.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredProperties.length} found)
              </span>
            )}
          </h2>
          
          <div className="flex items-center gap-3">
            <UpdateBadge lastUpdated={lastUpdated} />
            <SortSelect />
          </div>
        </div>

        {/* Properties grid with enhanced loading states */}
        {isLoading ? (
          <PropertyGridSkeleton count={searchParams.count || 4} />
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No HMO properties found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search in a different city
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => {
              console.log(`🏡 Rendering property ${index + 1}:`, {
                hasProperty: !!property,
                address: property?.address,
                price: property?.price,
                postcode: property?.postcode,
                keys: property ? Object.keys(property) : 'no property'
              });
              
              return (
                <PropertyCard 
                  key={`${property.postcode}-${index}`} 
                  property={property}
                  delay={150 + (index * 200)}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <RefreshFab onRefresh={handleRefresh} isLoading={isLoading} />

      {/* Privacy Notice Popup */}
      {showPrivacyPopup && (
        <PrivacyNoticePopup onClose={() => setShowPrivacyPopup(false)} />
      )}

      {/* Quick Tutorial */}
      <QuickTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
};
