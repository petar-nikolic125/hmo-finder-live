import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RefreshFabProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const RefreshFab = ({ onRefresh, isLoading }: RefreshFabProps) => {
  return (
    <Button
      onClick={onRefresh}
      disabled={isLoading}
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-primary hover:bg-primary-glow z-40"
    >
      <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
      <span className="sr-only">Refresh properties</span>
    </Button>
  );
};