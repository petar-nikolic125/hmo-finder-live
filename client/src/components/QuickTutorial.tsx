import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, HelpCircle, Search, MousePointer, Eye } from 'lucide-react';

interface QuickTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickTutorial = ({ isOpen, onClose }: QuickTutorialProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Quick Tutorial</CardTitle>
            <CardDescription>Learn how to use the HMO Property Search effectively</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close tutorial"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Search Properties</h3>
                <p className="text-sm text-muted-foreground">
                  Use the city dropdown in the hero section or navigation bar to select your target investment area. 
                  Adjust price range (£250k-£800k) and minimum area (90-130 sqm) to filter results.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <MousePointer className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">View Property Details</h3>
                <p className="text-sm text-muted-foreground">
                  Each property card shows key financial metrics including ROI, monthly cashflow, and yield calculations. 
                  Click "View Listing" to access the property on the original portal (Rightmove, Zoopla, or PrimeLocation).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Understand the Data</h3>
                <p className="text-sm text-muted-foreground">
                  Financial calculations are based on current LHA rates and realistic market assumptions. 
                  All properties exclude Article 4 restricted areas and focus on HMO-suitable investments.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-800 dark:text-amber-200">Important Notice</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Due to UK property data protection laws, we cannot link directly to live listings. 
              Generated URLs provide realistic search parameters but may not lead to the exact properties shown. 
              Use this tool for investment analysis and market research purposes.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Badge variant="secondary" className="text-xs">
              Accessibility: Screen reader compatible
            </Badge>
            <Button onClick={onClose} className="bg-primary hover:bg-primary-glow">
              Got it, let's start!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};