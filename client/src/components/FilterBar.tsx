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
  minSize: number;
  onMinSizeChange: (value: number) => void;
  maxPrice: number;
  onMaxPriceChange: (value: number) => void;
  excludeArticle4: boolean;
  onExcludeArticle4Change: (value: boolean) => void;
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  minSize,
  onMinSizeChange,
  maxPrice,
  onMaxPriceChange,
  excludeArticle4,
  onExcludeArticle4Change,
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
              onChange={(e) => onSearchChange(e.target.value)}
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
              {/* Size slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Minimum Size</Label>
                  <span className="text-sm font-medium text-primary">
                    {formatSize(minSize)}
                  </span>
                </div>
                <Slider
                  value={[minSize]}
                  onValueChange={(value) => onMinSizeChange(value[0])}
                  max={150}
                  min={90}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>90 sqm</span>
                  <span>150 sqm</span>
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
                  onValueChange={(value) => onMaxPriceChange(value[0])}
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

              {/* Article 4 toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="exclude-article4">Exclude Article 4 Areas</Label>
                  <p className="text-xs text-muted-foreground">
                    Filter out properties in HMO-restricted zones
                  </p>
                </div>
                <Switch
                  id="exclude-article4"
                  checked={excludeArticle4}
                  onCheckedChange={onExcludeArticle4Change}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};