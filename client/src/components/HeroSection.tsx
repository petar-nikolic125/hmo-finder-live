import { PropertySearchParams } from '@/lib/types';
import { formatPrice, formatSize } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, Download } from 'lucide-react';

interface HeroSectionProps {
  searchParams: PropertySearchParams;
  onSearch: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const HeroSection = ({ 
  searchParams, 
  onSearch, 
  onRefresh, 
  isLoading 
}: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient py-16">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
            <Download className="w-4 h-4" />
            Live HMO Property Finder
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Search Rightmove, Zoopla & other sites for HMO investments
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Real-time HMO opportunity feed · data refreshed continuously
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  placeholder="e.g. Birmingham, Manchester, Leeds"
                  defaultValue={searchParams.city || ''}
                  readOnly
                  className="w-full bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (£)
                </label>
                <Select value={searchParams.maxPrice?.toString() || '500000'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500000">£500k</SelectItem>
                    <SelectItem value="400000">£400k</SelectItem>
                    <SelectItem value="300000">£300k</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Area (sqm)
                </label>
                <Select value={searchParams.minSize?.toString() || '90'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 sqm</SelectItem>
                    <SelectItem value="100">100 sqm</SelectItem>
                    <SelectItem value="120">120 sqm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={onSearch}
                size="lg" 
                className="flex-1 bg-primary hover:bg-primary-glow text-white"
                disabled={isLoading}
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Searching...' : 'Find Properties'}
              </Button>
              
              <Button 
                onClick={onRefresh}
                variant="outline" 
                size="lg"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Filter: Article 4 areas excluded · HMO-suitable only
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Properties auto-refresh every 5 minutes · Last updated: 1:33:36 AM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};