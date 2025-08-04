interface PropertySkeletonCardProps {
  delay?: number;
}

export const PropertySkeletonCard = ({ delay = 0 }: PropertySkeletonCardProps) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      role="presentation"
      aria-label="Loading property information"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse bg-[length:200%_100%]"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* HMO Badge skeleton */}
        <div className="h-5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800 rounded w-20 animate-pulse"></div>
        
        {/* Address skeleton */}
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/4 animate-pulse"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/2 animate-pulse"></div>
        
        {/* Property specs skeleton */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Financial metrics skeleton */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/3 animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-green-200 via-green-300 to-green-200 dark:from-green-800 dark:via-green-700 dark:to-green-800 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-2/5 animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-green-200 via-green-300 to-green-200 dark:from-green-800 dark:via-green-700 dark:to-green-800 rounded w-1/5 animate-pulse"></div>
          </div>
        </div>
        
        {/* Button skeleton */}
        <div className="pt-3">
          <div className="h-9 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 dark:from-gray-200 dark:via-gray-300 dark:to-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const PropertyGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <PropertySkeletonCard 
          key={i} 
          delay={i * 150} // Staggered delay between 150-300ms
        />
      ))}
    </div>
  );
};