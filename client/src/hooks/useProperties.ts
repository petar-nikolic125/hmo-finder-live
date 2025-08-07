import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, PropertySearchResponse } from '@/lib/api';
import { PropertySearchParams } from '@/lib/types';

export const useProperties = (params: PropertySearchParams) => {
  return useQuery<PropertySearchResponse>({
    queryKey: ['properties', params],
    queryFn: () => apiClient.getProperties(params),
    refetchInterval: 120_000, // Auto-poll every 2 minutes
    staleTime: 90_000,
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