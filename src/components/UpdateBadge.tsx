import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Wifi } from 'lucide-react';
import { formatTimeAgo } from '@/lib/format';

interface UpdateBadgeProps {
  lastUpdated: number;
}

export const UpdateBadge = ({ lastUpdated }: UpdateBadgeProps) => {
  const [minutesAgo, setMinutesAgo] = useState(0);

  useEffect(() => {
    const updateMinutes = () => {
      const now = Date.now();
      const diffMinutes = Math.floor((now - lastUpdated) / 60000);
      setMinutesAgo(diffMinutes);
    };

    updateMinutes();
    const interval = setInterval(updateMinutes, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const isFresh = minutesAgo < 1;

  return (
    <Badge 
      variant={isFresh ? "default" : "secondary"}
      className={`
        flex items-center gap-1.5 px-3 py-1 transition-all duration-300
        ${isFresh ? 'animate-pulse-glow bg-success text-success-foreground' : ''}
      `}
    >
      {isFresh ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      <span className="text-xs font-medium">
        Updated {formatTimeAgo(minutesAgo)}
      </span>
    </Badge>
  );
};