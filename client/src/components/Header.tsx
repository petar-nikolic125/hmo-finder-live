import { Home, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCities } from '@/hooks/useProperties';

interface HeaderProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export const Header = ({ selectedCity, onCityChange }: HeaderProps) => {
  const { data: cities = [] } = useCities();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-hero-gradient">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-hero-gradient bg-clip-text text-transparent">
                HMO HUNTER
              </h1>
              <p className="text-sm text-muted-foreground">
                Discover profitable HMO opportunities under £500k
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCity} onValueChange={onCityChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};