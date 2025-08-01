import { QueryClient } from "@tanstack/react-query";

const defaultFetch = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => {
        const [url] = queryKey as [string];
        return defaultFetch(url);
      },
    },
  },
});

export const apiRequest = async (url: string, options?: RequestInit) => {
  return defaultFetch(url, options);
};