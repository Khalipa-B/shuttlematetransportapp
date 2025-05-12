/**
 * Provides offline storage capabilities using IndexedDB
 * This allows the app to function without an internet connection
 */

// Simple cache for recent data
let memoryCache: Record<string, any> = {};

// Database name and version
const DB_NAME = 'ShuttleMateOfflineDB';
const DB_VERSION = 1;

// Define store names for different data types
const STORES = {
  MESSAGES: 'offlineMessages',
  ATTENDANCE: 'offlineAttendance',
  USER_DATA: 'userData',
  BUS_LOCATIONS: 'busLocations',
  NOTIFICATIONS: 'notifications',
  ROUTES: 'routes'
};

// IndexedDB instance
let db: IDBDatabase | null = null;

/**
 * Initialize the database
 */
export async function initOfflineStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Failed to open IndexedDB:', event);
      reject('Failed to open IndexedDB');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = request.result;

      // Create stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.MESSAGES)) {
        database.createObjectStore(STORES.MESSAGES, { keyPath: 'id', autoIncrement: true });
      }

      if (!database.objectStoreNames.contains(STORES.ATTENDANCE)) {
        database.createObjectStore(STORES.ATTENDANCE, { keyPath: 'id', autoIncrement: true });
      }

      if (!database.objectStoreNames.contains(STORES.USER_DATA)) {
        database.createObjectStore(STORES.USER_DATA, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORES.BUS_LOCATIONS)) {
        database.createObjectStore(STORES.BUS_LOCATIONS, { keyPath: 'busId' });
      }
      
      if (!database.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        database.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id', autoIncrement: true });
      }
      
      if (!database.objectStoreNames.contains(STORES.ROUTES)) {
        database.createObjectStore(STORES.ROUTES, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Helper function to perform a database operation
 */
async function dbOperation<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const database = await initOfflineStorage();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save data to offline storage
 */
export async function saveOfflineData<T>(storeName: string, data: T, key?: string | number): Promise<T> {
  try {
    // Update memory cache
    if (key) {
      memoryCache[`${storeName}_${key}`] = data;
    }
    
    // Save to IndexedDB
    return await dbOperation(storeName, 'readwrite', (store) => {
      return store.put(data);
    });
  } catch (error) {
    console.error(`Error saving offline data to ${storeName}:`, error);
    throw error;
  }
}

/**
 * Get data from offline storage
 */
export async function getOfflineData<T>(storeName: string, key?: string | number): Promise<T | undefined> {
  try {
    // Check memory cache first for recent data
    if (key && memoryCache[`${storeName}_${key}`]) {
      return memoryCache[`${storeName}_${key}`] as T;
    }
    
    // Otherwise get from IndexedDB
    if (key) {
      return await dbOperation<T>(storeName, 'readonly', (store) => {
        return store.get(key);
      });
    } else {
      const items = await dbOperation<T[]>(storeName, 'readonly', (store) => {
        return store.getAll();
      });
      return items as any;
    }
  } catch (error) {
    console.error(`Error getting offline data from ${storeName}:`, error);
    return undefined;
  }
}

/**
 * Delete data from offline storage
 */
export async function deleteOfflineData(storeName: string, key: string | number): Promise<void> {
  try {
    // Remove from memory cache
    delete memoryCache[`${storeName}_${key}`];
    
    // Remove from IndexedDB
    await dbOperation(storeName, 'readwrite', (store) => {
      return store.delete(key);
    });
  } catch (error) {
    console.error(`Error deleting offline data from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Clear all data from a store
 */
export async function clearOfflineStore(storeName: string): Promise<void> {
  try {
    // Clear memory cache entries for this store
    Object.keys(memoryCache).forEach(key => {
      if (key.startsWith(`${storeName}_`)) {
        delete memoryCache[key];
      }
    });
    
    // Clear IndexedDB store
    await dbOperation(storeName, 'readwrite', (store) => {
      return store.clear();
    });
  } catch (error) {
    console.error(`Error clearing offline store ${storeName}:`, error);
    throw error;
  }
}

/**
 * Save data to be synced later when online
 */
export async function savePendingSync(storeName: string, data: any): Promise<void> {
  try {
    // Add timestamp and sync status
    const itemToSync = {
      ...data,
      pendingSync: true,
      timestamp: new Date().toISOString()
    };
    
    await saveOfflineData(storeName, itemToSync);
    
    // Register for background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(`sync-${storeName}`);
    }
  } catch (error) {
    console.error(`Error saving pending sync for ${storeName}:`, error);
    throw error;
  }
}

/**
 * Get all items that need to be synced
 */
export async function getPendingSyncItems(storeName: string): Promise<any[]> {
  try {
    const allItems = await getOfflineData<any[]>(storeName) || [];
    return allItems.filter(item => item.pendingSync);
  } catch (error) {
    console.error(`Error getting pending sync items from ${storeName}:`, error);
    return [];
  }
}

/**
 * Check if the device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Utility to save current user data for offline access
 */
export async function saveCurrentUser(userData: any): Promise<void> {
  await saveOfflineData(STORES.USER_DATA, userData, 'currentUser');
}

/**
 * Utility to get current user data when offline
 */
export async function getCurrentUser(): Promise<any | undefined> {
  return await getOfflineData(STORES.USER_DATA, 'currentUser');
}

/**
 * Save a message for offline use or later sync
 */
export async function saveOfflineMessage(message: any): Promise<void> {
  if (isOnline()) {
    // If online, save as regular data
    await saveOfflineData(STORES.MESSAGES, message);
  } else {
    // If offline, mark for syncing when back online
    await savePendingSync(STORES.MESSAGES, message);
  }
}

/**
 * Save attendance record for offline use or later sync
 */
export async function saveOfflineAttendance(attendance: any): Promise<void> {
  if (isOnline()) {
    await saveOfflineData(STORES.ATTENDANCE, attendance);
  } else {
    await savePendingSync(STORES.ATTENDANCE, attendance);
  }
}

/**
 * Save bus location for offline access
 */
export async function saveBusLocation(busId: number, location: any): Promise<void> {
  const locationData = {
    busId,
    ...location,
    timestamp: new Date().toISOString()
  };
  
  await saveOfflineData(STORES.BUS_LOCATIONS, locationData, busId);
}

/**
 * Get the most recent bus location from offline storage
 */
export async function getBusLocation(busId: number): Promise<any | undefined> {
  return await getOfflineData(STORES.BUS_LOCATIONS, busId);
}

/**
 * Save a notification for offline access
 */
export async function saveNotification(notification: any): Promise<void> {
  await saveOfflineData(STORES.NOTIFICATIONS, notification);
}

/**
 * Get all notifications from offline storage
 */
export async function getNotifications(): Promise<any[]> {
  return await getOfflineData<any[]>(STORES.NOTIFICATIONS) || [];
}

/**
 * Save route data for offline access
 */
export async function saveRouteData(routeId: number, routeData: any): Promise<void> {
  await saveOfflineData(STORES.ROUTES, { id: routeId, ...routeData });
}

/**
 * Get route data from offline storage
 */
export async function getRouteData(routeId: number): Promise<any | undefined> {
  return await getOfflineData(STORES.ROUTES, routeId);
}

/**
 * Get all routes from offline storage
 */
export async function getAllRoutes(): Promise<any[]> {
  return await getOfflineData<any[]>(STORES.ROUTES) || [];
}