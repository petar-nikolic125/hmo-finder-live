import { useState, useEffect } from 'react';
import { Clock, Brain, Target, Database, Globe, MapPin, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchStatusProps {
  count: number;
  isLoading: boolean;
  lastUpdated: number;
  city?: string;
}

const aiThoughts = [
  { icon: Globe, text: "Scanning property portals..." },
  { icon: Database, text: "Accessing Zoopla database..." },
  { icon: MapPin, text: "Analyzing property locations..." },
  { icon: Brain, text: "Processing HMO listings..." },
  { icon: Target, text: "Filtering investment opportunities..." },
  { icon: Zap, text: "Calculating yields..." },
];

export const SearchStatus = ({ count, isLoading, lastUpdated, city }: SearchStatusProps) => {
  const [currentThought, setCurrentThought] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentThought(0);
      setProgress(0);
      return;
    }

    let thoughtInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    // Progress animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 8 + 3;
        return Math.min(newProgress, 95);
      });
    }, 400);

    // AI thoughts progression
    thoughtInterval = setInterval(() => {
      setCurrentThought(prev => (prev + 1) % aiThoughts.length);
    }, 2000);

    return () => {
      clearInterval(thoughtInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const CurrentIcon = aiThoughts[currentThought]?.icon || Brain;

  return (
    <div 
      className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mb-6"
      role="status"
      aria-live="polite"
      aria-label={isLoading ? "Searching for properties" : `Found ${count} properties`}
    >
      {isLoading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                rotateY: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <CurrentIcon className="w-4 h-4 text-white" />
            </motion.div>
            
            <div className="flex-1 space-y-1">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={`thought-${currentThought}`}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {aiThoughts[currentThought]?.text}
                  {city && <span className="text-blue-600 dark:text-blue-400">in {city}</span>}
                </motion.span>
              </AnimatePresence>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Fetched {count} HMO{count !== 1 ? "'s" : ""} matching your criteria
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formatTime(lastUpdated)}</span>
          </div>
        </div>
      )}
    </div>
  );
};