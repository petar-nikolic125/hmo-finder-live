import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PropertyCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Skeleton className="w-full h-48" />
        <div className="absolute top-3 left-3">
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="grid grid-cols-2 gap-2 py-2">
          <div className="p-2 bg-muted rounded-lg space-y-1">
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-5 w-12 mx-auto" />
          </div>
          <div className="p-2 bg-muted rounded-lg space-y-1">
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-5 w-12 mx-auto" />
          </div>
        </div>

        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
};

export const PropertyGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};