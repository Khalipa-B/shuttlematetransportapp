import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { 
  getOfflineData, 
  saveOfflineData, 
  isOnline, 
  savePendingSync 
} from "./offlineStorage";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Check if device is online
  if (!isOnline()) {
    // If this is a write operation, save it for later sync
    if (method !== 'GET') {
      try {
        const storeName = url.replace('/api/', '').split('/')[0];
        
        // Save the request for later processing
        await savePendingSync(storeName, {
          url,
          method,
          body: data,
        });
        
        // Return a mock response
        return new Response(JSON.stringify({ success: true, offlineSaved: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Failed to save offline request:', error);
        throw new Error('You are offline and we could not save your request for later. Please try again when online.');
      }
    }
    
    // For GET requests, try to return cached data
    try {
      const storeName = url.replace('/api/', '').split('/')[0];
      const cachedData = await getOfflineData(storeName);
      
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      throw new Error('No cached data available while offline');
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      throw new Error('You are offline and we could not retrieve the requested data');
    }
  }
  
  // Online case - proceed with normal request
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // If it's a successful GET request, cache the response
  if (res.ok && method === 'GET') {
    try {
      const clonedRes = res.clone();
      const responseData = await clonedRes.json();
      
      const storeName = url.replace('/api/', '').split('/')[0];
      
      // Only cache if we have data
      if (responseData) {
        await saveOfflineData(storeName, responseData);
      }
    } catch (error) {
      console.error('Failed to cache response:', error);
      // Continue even if caching fails
    }
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const url = queryKey[0] as string;
      
      // If offline, try to get data from cache
      if (!isOnline()) {
        try {
          const storeName = url.replace('/api/', '').split('/')[0];
          const cachedData = await getOfflineData(storeName);
          
          if (cachedData) {
            return cachedData;
          }
          
          throw new Error('No offline data available');
        } catch (offlineError) {
          console.error('Failed to retrieve offline data:', offlineError);
          throw new Error('You are offline and no cached data is available');
        }
      }
      
      // Online flow
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      // Cache the successful response
      try {
        const clonedRes = res.clone();
        const responseData = await clonedRes.json();
        
        const storeName = url.replace('/api/', '').split('/')[0];
        
        // Only cache if we have data
        if (responseData) {
          await saveOfflineData(storeName, responseData);
        }
        
        return responseData;
      } catch (error) {
        // If caching fails, still try to return the response
        return await res.json();
      }
    } catch (error) {
      // If this is a network error and we're offline, try to use cached data as fallback
      if (!isOnline()) {
        try {
          const url = queryKey[0] as string;
          const storeName = url.replace('/api/', '').split('/')[0];
          const cachedData = await getOfflineData(storeName);
          
          if (cachedData) {
            return cachedData;
          }
        } catch (offlineError) {
          // Ignore additional errors in offline fallback
        }
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
