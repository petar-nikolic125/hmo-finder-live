import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatPrice, formatSize } from '@/lib/format';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  minRooms: number;
  onMinRoomsChange: (value: number) => void;
  maxPrice: number;
  onMaxPriceChange: (value: number) => void;
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  minRooms,
  onMinRoomsChange,
  maxPrice,
  onMaxPriceChange,
}: FilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search bar - always visible */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by postcode or street..."
              value={searchTerm}
              onChange={(e) => {
                console.log('🔍 FilterBar: Search term changed to:', e.target.value);
                onSearchChange(e.target.value);
              }}
              className="pl-10"
            />
          </div>

          {/* Collapsible filters */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Advanced Filters
                </span>
                <span className="text-xs text-muted-foreground">
                  {isOpen ? 'Hide' : 'Show'}
                </span>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-6 pt-6">
              {/* Bedrooms slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Minimum Bedrooms</Label>
                  <span className="text-sm font-medium text-primary">
                    {minRooms} {minRooms === 1 ? 'bedroom' : 'bedrooms'}
                  </span>
                </div>
                <Slider
                  value={[minRooms]}
                  onValueChange={(value) => {
                    console.log('🛏️ FilterBar: Min rooms changed to:', value[0]);
                    onMinRoomsChange(value[0]);
                  }}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 bed</span>
                  <span>5+ beds</span>
                </div>
              </div>

              {/* Price slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Maximum Price</Label>
                  <span className="text-sm font-medium text-primary">
                    {formatPrice(maxPrice)}
                  </span>
                </div>
                <Slider
                  value={[maxPrice]}
                  onValueChange={(value) => {
                    console.log('💰 FilterBar: Max price changed to:', value[0]);
                    onMaxPriceChange(value[0]);
                  }}
                  max={500000}
                  min={250000}
                  step={25000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>£250k</span>
                  <span>£500k</span>
                </div>
              </div>

              {/* HMO keywords info */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  🏠 Searching for HMO properties in {maxPrice >= 500000 ? 'premium' : 'budget'} range
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};