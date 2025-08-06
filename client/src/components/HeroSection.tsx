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
import { getAvailableCities } from '@/lib/generator';

interface HeroSectionProps {
  searchParams: PropertySearchParams;
  onSearch: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onCityChange: (city: string) => void;
  onMaxPriceChange: (maxPrice: number) => void;
  onMinRoomsChange: (minRooms: number) => void;
}

export const HeroSection = ({ 
  searchParams, 
  onSearch, 
  onRefresh, 
  isLoading,
  onCityChange,
  onMaxPriceChange,
  onMinRoomsChange
}: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient py-20 min-h-[60vh] flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
      </div>
      
      <div className="relative container mx-auto px-4 z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300">
            <Download className="w-4 h-4 animate-pulse" />
            Live HMO Property Finder
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Find Your Next
            <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text animate-gradient">
              HMO Investment
            </span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Search Rightmove, Zoopla & PrimeLocation for profitable HMO opportunities
            <span className="block mt-2 text-white/70 text-base">
              Real-time property data • Investment analysis • ROI calculations
            </span>
          </p>
        </div>

        <div className="max-w-5xl mx-auto animate-slide-up">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Location
                </label>
                <Select 
                  value={searchParams.city || 'Birmingham'}
                  onValueChange={(value) => {
                    console.log('🏙️ HeroSection: City changed to:', value);
                    onCityChange(value);
                  }}
                >
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-xl">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {getAvailableCities().map((city) => (
                      <SelectItem key={city} value={city} className="text-base py-3">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Max Price (£)
                </label>
                <Select 
                  value={searchParams.maxPrice?.toString() || '500000'}
                  onValueChange={(value) => {
                    console.log('💰 HeroSection: Max price changed to:', parseInt(value));
                    onMaxPriceChange(parseInt(value));
                  }}
                >
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-colors rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="800000" className="text-base py-3">£800k</SelectItem>
                    <SelectItem value="700000" className="text-base py-3">£700k</SelectItem>
                    <SelectItem value="600000" className="text-base py-3">£600k</SelectItem>
                    <SelectItem value="500000" className="text-base py-3">£500k</SelectItem>
                    <SelectItem value="400000" className="text-base py-3">£400k</SelectItem>
                    <SelectItem value="300000" className="text-base py-3">£300k</SelectItem>
                    <SelectItem value="250000" className="text-base py-3">£250k</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Min Bedrooms
                </label>
                <Select 
                  value={searchParams.minRooms?.toString() || '1'}
                  onValueChange={(value) => {
                    console.log('🛏️ HeroSection: Min rooms changed to:', parseInt(value));
                    onMinRoomsChange(parseInt(value));
                  }}
                >
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-colors rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1" className="text-base py-3">1 bedroom</SelectItem>
                    <SelectItem value="2" className="text-base py-3">2 bedrooms</SelectItem>
                    <SelectItem value="3" className="text-base py-3">3 bedrooms</SelectItem>
                    <SelectItem value="4" className="text-base py-3">4 bedrooms</SelectItem>
                    <SelectItem value="5" className="text-base py-3">5+ bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={() => {
                  console.log('🔍 HeroSection: Search button clicked');
                  onSearch();
                }}
                size="lg" 
                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                disabled={isLoading}
              >
                <Search className={`w-5 h-5 mr-3 ${isLoading ? 'animate-pulse' : ''}`} />
                {isLoading ? 'Searching Properties...' : 'Find HMO Properties'}
              </Button>
              
              <Button 
                onClick={() => {
                  console.log('🔄 HeroSection: Refresh button clicked');
                  onRefresh();
                }}
                variant="outline" 
                size="lg"
                className="h-14 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-300 rounded-xl px-6"
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
            </div>

            <div className="mt-6 text-center space-y-2">
              <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Article 4 Filtered
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  HMO Suitable Only
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  Live Data Feed
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()} • UK property data compliance
              </p>
              <p className="text-xs text-amber-600 font-medium">
                ⚖️ All property URLs comply with UK data protection laws
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};