import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyNoticePopupProps {
  onClose: () => void;
}

export const PrivacyNoticePopup = ({ onClose }: PrivacyNoticePopupProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set focus to the popup for accessibility
    const focusElement = document.getElementById('privacy-notice-popup');
    if (focusElement) {
      focusElement.focus();
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow fade out animation
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-notice-title"
      onKeyDown={handleKeyDown}
    >
      <div 
        id="privacy-notice-popup"
        className={`
          bg-white dark:bg-gray-900 border-2 border-gray-800 dark:border-gray-200 
          rounded-lg shadow-2xl max-w-md mx-4 p-6 
          transition-all duration-300 transform
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 
            id="privacy-notice-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Legal & Privacy Notice
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close privacy notice"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
          <p>
            Due to UK privacy laws, we can't link directly to listings. We only provide you with 
            valid, up-to-date-looking search results that lead to the correct pages.
          </p>
          <p>
            The hashes in the links remain unaltered to ensure integrity and authenticity 
            of the search parameters.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleClose}
            className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
          >
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
};