import { QueryClient } from "@tanstack/react-query";

const defaultFetch = async (url: string, options?: RequestInit) => {
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API attempt ${attempt}/${maxRetries}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        timeout: 30000, // 30 second timeout
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API success on attempt ${attempt}: ${url}`);
      return data;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ API attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
      queryFn: ({ queryKey }) => {
        const [url] = queryKey as [string];
        return defaultFetch(url);
      },
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const apiRequest = async (url: string, options?: RequestInit) => {
  return defaultFetch(url, options);
};