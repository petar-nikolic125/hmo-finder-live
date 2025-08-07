import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, PropertySearchResponse } from '@/lib/api';
import { PropertySearchParams } from '@/lib/types';

export const useProperties = (params: PropertySearchParams, enabled = false) => {
  return useQuery<PropertySearchResponse>({
    queryKey: ['properties', params],
    queryFn: () => apiClient.getProperties(params),
    enabled: enabled, // Samo kad se eksplicitno pozove
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    staleTime: 60_000, // 1 minute
    gcTime: 300_000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Ne učitavaj automatski
    // Note: onSuccess and onError are deprecated in TanStack Query v5
    // Using useEffect in component instead
  });
};

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => apiClient.getCities(),
    staleTime: Infinity, // Cities don't change
  });
};

export const useRefreshProperties = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  };
};