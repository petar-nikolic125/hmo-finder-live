import { useState, useMemo, useEffect } from 'react';
import { useProperties, useRefreshProperties } from '@/hooks/useProperties';
import { PropertySearchParams } from '@/lib/types';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';

import { SortSelect } from '@/components/SortSelect';
import { UpdateBadge } from '@/components/UpdateBadge';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyGridSkeleton } from '@/components/LoadingSkeletons';
import { IntelligentLoadingScreen } from '@/components/IntelligentLoadingScreen';
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
  const [showTutorial, setShowTutorial] = useState(true); // Show tutorial on launch
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  
  // Fetch properties with enhanced messaging
  const { data: searchResult, isLoading, isError, refetch } = useProperties(searchParams);
  const properties = searchResult?.properties || [];
  const expandedResultsMessage = searchResult?.message;
  const hasExpandedResults = searchResult?.hasExpandedResults || false;
  
  // Production: Removed debug logging for performance
  
  // Filter properties by search term (client-side)
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties;
    
    const term = searchTerm.toLowerCase();
    return properties.filter(property =>
      property.address.toLowerCase().includes(term) ||
      (property.postcode && property.postcode.toLowerCase().includes(term))
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
    setShowLoadingScreen(true);
    
    if (!hasSearched) {
      setShowPrivacyPopup(true);
      setHasSearched(true);
    }
    refetch();
    setLastUpdated(Date.now());
  };

  // Hide loading screen when data is loaded
  useEffect(() => {
    if (!isLoading && properties.length > 0 && showLoadingScreen) {
      // Allow a minimum display time then hide
      setTimeout(() => {
        setShowLoadingScreen(false);
      }, 1500);
    }
  }, [isLoading, properties.length, showLoadingScreen]);

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

        {/* Search results header with count */}

        {/* Professional message for expanded results */}
        {expandedResultsMessage && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Search Results Expanded
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  {expandedResultsMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {showLoadingScreen ? (
          <IntelligentLoadingScreen 
            isVisible={showLoadingScreen}
            city={searchParams.city}
            searchParams={{
              minRooms: searchParams.minRooms,
              maxPrice: searchParams.maxPrice
            }}
            onComplete={() => setShowLoadingScreen(false)}
          />
        ) : isLoading ? (
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