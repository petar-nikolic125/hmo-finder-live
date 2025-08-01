import { useState, useMemo, useEffect } from 'react';
import { useProperties, useRefreshProperties } from '@/hooks/useProperties';
import { PropertySearchParams } from '@/lib/types';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { SortSelect } from '@/components/SortSelect';
import { UpdateBadge } from '@/components/UpdateBadge';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyGridSkeleton } from '@/components/LoadingSkeletons';
import { RefreshFab } from '@/components/RefreshFab';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

export const Home = () => {
  const { toast } = useToast();
  const refresh = useRefreshProperties();
  
  // Search parameters
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({
    city: 'Birmingham',
    count: 12,
    minSize: 90,
    maxPrice: 500000,
    excludeArticle4: true,
    sortBy: 'profit',
  });
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  
  // Fetch properties
  const { data: properties = [], isLoading, isError, refetch } = useProperties(searchParams);
  
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
      />
      
      <HeroSection
        searchParams={searchParams}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <main className="container mx-auto px-4 py-8">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          minSize={searchParams.minSize || 90}
          onMinSizeChange={(minSize) => updateSearchParams({ minSize })}
          maxPrice={searchParams.maxPrice || 500000}
          onMaxPriceChange={(maxPrice) => updateSearchParams({ maxPrice })}
          excludeArticle4={searchParams.excludeArticle4 || false}
          onExcludeArticle4Change={(excludeArticle4) => updateSearchParams({ excludeArticle4 })}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <UpdateBadge lastUpdated={lastUpdated} />
            <span className="text-sm text-muted-foreground">
              {filteredProperties.length} properties found
            </span>
          </div>
          
          <SortSelect
            value={searchParams.sortBy || 'profit'}
            onValueChange={(sortBy) => updateSearchParams({ sortBy: sortBy as any })}
          />
        </div>

        {isLoading ? (
          <PropertyGridSkeleton count={12} />
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No properties found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <PropertyCard key={`${property.postcode}-${index}`} property={property} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <RefreshFab onRefresh={handleRefresh} isLoading={isLoading} />
    </div>
  );
};