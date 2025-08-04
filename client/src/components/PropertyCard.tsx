import { useState, useEffect } from 'react';
import { PropertyWithAnalytics } from '@/lib/api';
import { formatCurrency, formatPercentage } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Square, TrendingUp, Percent, ExternalLink } from 'lucide-react';

interface PropertyCardProps {
  property: PropertyWithAnalytics;
  delay?: number;
}

export const PropertyCard = ({ property, delay = 0 }: PropertyCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Portal selection logic (70% Rightmove, 25% Zoopla, 5% PrimeLocation)
  const getPortalUrl = () => {
    const rand = Math.random();
    if (rand < 0.70) return property.rightmoveUrl;
    if (rand < 0.95) return property.zooplaUrl;
    return property.primeLocationUrl;
  };

  const getPortalName = (url: string) => {
    if (url.includes('rightmove')) return 'Rightmove';
    if (url.includes('zoopla')) return 'Zoopla';
    return 'PrimeLocation';
  };

  const portalUrl = getPortalUrl();
  const portalName = getPortalName(portalUrl);
  
  // Extract hash/identifier from URL for display
  const getUrlIdentifier = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Show the hash if present, otherwise show a query param
      if (urlObj.hash) {
        const hash = urlObj.hash.substring(1); // Remove the # symbol
        return hash.length > 15 ? `${hash.substring(0, 15)}...` : hash;
      }
      const locationId = urlObj.searchParams.get('locationIdentifier') || 
                        urlObj.searchParams.get('location') || 
                        urlObj.searchParams.get('ref') || 'N/A';
      return locationId.length > 15 ? `${locationId.substring(0, 15)}...` : locationId;
    } catch {
      return 'N/A';
    }
  };

  const urlIdentifier = getUrlIdentifier(portalUrl);
  
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
        shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden
        ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}
      `}
      role="article"
      aria-label={`HMO property at ${property.address}`}
    >
      <div className="relative">
        <img
          src={property.imageUrl}
          alt="Property image not available - placeholder shown"
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Replace broken images with placeholder
            const target = e.target as HTMLImageElement;
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%236b7280' font-family='system-ui, sans-serif' font-size='14'%3EImage not available%3C/text%3E%3C/svg%3E";
            target.alt = "Image not available";
          }}
        />
        <div className="absolute top-2 left-2">
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            HMO's Found
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
            {property.address}
          </h3>
          {property.isArticle4 && (
            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
              Article 4
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          {property.postcode} • {property.description}
        </p>
        
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
          ID: {urlIdentifier}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <Bed className="h-3 w-3 text-gray-500" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3 w-3 text-gray-500" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-3 w-3 text-gray-500" />
            <span>{property.size}m²</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Price</span>
            <span className="font-medium">{formatCurrency(property.price)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Est. Net Yield
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatPercentage(property.netYield)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Est. ROI
            </span>
            <span className={`font-medium ${property.roi > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPercentage(property.roi)}
            </span>
          </div>
          {property.isArticle4 === false && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Article 4</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                Not restricted
              </span>
            </div>
          )}
        </div>

        <Button
          asChild
          variant="default"
          size="sm"
          className="w-full text-xs bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
        >
          <a 
            href={portalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
            aria-label={`View this HMO listing on ${portalName} - opens in new tab`}
          >
            View Listing
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
};