/**
 * Performance optimization utilities
 */

// ==================
// SIMPLE CACHE
// ==================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();

  set(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

export const apiCache = new Cache();

// ==================
// REQUEST DEDUPLICATION
// ==================
const pendingRequests = new Map<string, Promise<any>>();

export const deduplicateRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = requestFn();
  pendingRequests.set(key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
};

// ==================
// LAZY LOADING
// ==================
export const lazyLoadImage = (
  img: HTMLImageElement,
  options?: IntersectionObserverInit
): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    img.src = img.dataset.src || '';
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.add('lazy-loaded');
        observer.unobserve(img);
      }
    });
  }, options);

  observer.observe(img);
};

// ==================
// DEBOUNCE
// ==================
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// ==================
// THROTTLE
// ==================
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// ==================
// MEMOIZATION
// ==================
export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// ==================
// BATCH UPDATES
// ==================
export const batchUpdates = (callback: () => void): void => {
  if ('unstable_batchedUpdates' in window) {
    (window as any).unstable_batchedUpdates(callback);
  } else {
    callback();
  }
};

// ==================
// PERFORMANCE MONITORING
// ==================
export const measurePerformance = async <T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    console.log(`[Performance] ${label}: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`[Performance] ${label} failed after ${(endTime - startTime).toFixed(2)}ms`);
    throw error;
  }
};

// ==================
// LOCAL STORAGE HELPERS
// ==================
export const localStorageWithExpiry = {
  setItem: (key: string, value: any, expiryMs?: number): void => {
    const item = {
      value,
      expiry: expiryMs ? Date.now() + expiryMs : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getItem: (key: string): any => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
};

// ==================
// NETWORK STATUS
// ==================
export const useNetworkStatus = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
};

export const onNetworkStatusChange = (
  callback: (isOnline: boolean) => void
): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// ==================
// VIEWPORT SIZE
// ==================
export const useViewportSize = (): {
  width: number;
  height: number;
} => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};
