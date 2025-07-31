import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface SortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const SortSelect = ({ value, onValueChange }: SortSelectProps) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="profit">Profit £ (High to Low)</SelectItem>
          <SelectItem value="price">Price £ (Low to High)</SelectItem>
          <SelectItem value="size">Size sqm (High to Low)</SelectItem>
          <SelectItem value="recent">Recently Added</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};