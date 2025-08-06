import { useState, useMemo, useEffect } from 'react';
import { useProperties, useRefreshProperties } from '@/hooks/useProperties';
import { PropertySearchParams } from '@/lib/types';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { SortSelect } from '@/components/SortSelect';
import { UpdateBadge } from '@/components/UpdateBadge';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyGridSkeleton } from '@/components/PropertySkeletonCard';
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
    count: 12,
    minRooms: 1,
    maxPrice: 500000,
    keywords: 'HMO',
  });
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true); // Show tutorial on launch
  
  // Fetch properties
  const { data: properties = [], isLoading, isError, refetch } = useProperties(searchParams);
  
  // Add console logging to track data flow
  useEffect(() => {
    console.log('🏠 Home: Properties data updated:', properties.length, 'properties');
    if (properties.length > 0) {
      console.log('🏠 Home: First property sample:', properties[0]);
      console.log('🏠 Home: Are these scraped properties?', properties[0]?.address?.includes('Zoopla') ? 'No - Generated' : 'Maybe - Check address format');
    }
  }, [properties]);
  
  // Filter properties by search term (client-side)
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties;
    
    const term = searchTerm.toLowerCase();
    return properties.filter(property =>
      property.address.toLowerCase().includes(term) ||
      property.postcode.toLowerCase().includes(term)
    );
  }, [properties, searchTerm]);

  // Update last updated time when properties change
  useEffect(() => {
    if (properties.length > 0) {
      setLastUpdated(Date.now());
    }
  }, [properties]);

  // Error handling
  useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Error loading properties",
        description: "Please try again.",
      });
    }
  }, [isError, toast]);

  const handleSearch = () => {
    console.log('🔍 Home: Search triggered with params:', searchParams);
    
    // Show privacy popup on first search
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
      />

      <main className="container mx-auto px-4 py-8">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          minRooms={searchParams.minRooms || 1}
          onMinRoomsChange={(minRooms) => updateSearchParams({ minRooms })}
          maxPrice={searchParams.maxPrice || 500000}
          onMaxPriceChange={(maxPrice) => updateSearchParams({ maxPrice })}
        />

        {/* Search Status */}
        <SearchStatus 
          count={filteredProperties.length}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />

        {/* Search results header with count */}

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
            {filteredProperties.map((property, index) => (
              <PropertyCard 
                key={`${property.postcode}-${index}`} 
                property={property}
                delay={150 + (index * 200)} // Staggered reveal: 150-300ms range
              />
            ))}
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