import { PropertyWithAnalytics } from '@/lib/api';
import { formatPrice, formatSize, formatProfit, formatPercentage } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Bed, Bath, TrendingUp, Calculator } from 'lucide-react';

interface PropertyCardProps {
  property: PropertyWithAnalytics;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <div className="relative">
        <img
          src={property.imageUrl}
          alt={property.address}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {formatPrice(property.price)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="default" className="bg-success text-success-foreground">
            {formatPercentage(property.roi)} ROI
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {property.address}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            {property.postcode}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1 text-muted-foreground" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1 text-muted-foreground" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Calculator className="w-4 h-4 mr-1 text-muted-foreground" />
            <span>{formatSize(property.size)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 py-2">
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Yearly Profit</div>
            <div className="font-semibold text-success">
              {formatProfit(property.yearlyProfit)}
            </div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Net Yield</div>
            <div className="font-semibold text-info">
              {formatPercentage(property.netYield)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <a 
            href={property.primeLocationUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap rounded-md text-sm font-medium w-full"
          >
            <TrendingUp className="w-4 h-4" />
            {property.primeLocationUrl.includes('rightmove') ? 'Rightmove' : 
             property.primeLocationUrl.includes('zoopla') ? 'Zoopla' : 
             'PrimeLocation'} →
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <a 
            href={property.rightmoveUrl !== property.primeLocationUrl ? property.rightmoveUrl : property.zooplaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap rounded-md text-sm font-medium w-full"
          >
            {property.rightmoveUrl !== property.primeLocationUrl ? 'See more on Rightmove' : 'See more on Zoopla'}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};