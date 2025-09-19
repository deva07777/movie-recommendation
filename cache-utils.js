class MovieCache {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.maxCacheSize = 100;
        this.loadFromStorage();
    }

    generateKey(url) {
        return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
    }

    set(url, data) {
        const key = this.generateKey(url);
        const item = {
            data,
            timestamp: Date.now(),
            url
        };
        
        this.cache.set(key, item);
        
        // Limit cache size
        if (this.cache.size > this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.saveToStorage();
    }

    get(url) {
        const key = this.generateKey(url);
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Check if expired
        if (Date.now() - item.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            this.saveToStorage();
            return null;
        }
        
        return item.data;
    }

    saveToStorage() {
        try {
            const cacheArray = Array.from(this.cache.entries());
            localStorage.setItem('movieCache', JSON.stringify(cacheArray));
        } catch (e) {
            console.warn('Failed to save cache to localStorage');
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('movieCache');
            if (stored) {
                const cacheArray = JSON.parse(stored);
                this.cache = new Map(cacheArray);
                
                // Clean expired items
                const now = Date.now();
                for (const [key, item] of this.cache.entries()) {
                    if (now - item.timestamp > this.cacheTimeout) {
                        this.cache.delete(key);
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load cache from localStorage');
            this.cache = new Map();
        }
    }

    clear() {
        this.cache.clear();
        localStorage.removeItem('movieCache');
    }
}

class CachedFetch {
    constructor() {
        this.cache = new MovieCache();
        this.pendingRequests = new Map();
    }

    async fetch(url, options = {}) {
        // Check cache first
        const cached = this.cache.get(url);
        if (cached) {
            return { 
                json: () => Promise.resolve(cached),
                ok: true 
            };
        }

        // Check if request is already pending
        if (this.pendingRequests.has(url)) {
            return this.pendingRequests.get(url);
        }

        // Create new request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const requestPromise = fetch(url, {
            ...options,
            signal: controller.signal
        }).then(async response => {
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                this.cache.set(url, data);
                return {
                    json: () => Promise.resolve(data),
                    ok: true
                };
            }
            throw new Error(`HTTP ${response.status}`);
        }).catch(error => {
            clearTimeout(timeoutId);
            throw error;
        }).finally(() => {
            this.pendingRequests.delete(url);
        });

        this.pendingRequests.set(url, requestPromise);
        return requestPromise;
    }

    async fetchWithFallback(urls, options = {}) {
        for (const url of urls) {
            try {
                return await this.fetch(url, options);
            } catch (error) {
                console.warn(`Failed to fetch ${url}:`, error);
                continue;
            }
        }
        throw new Error('All fetch attempts failed');
    }
}

// Global cached fetch instance
const cachedFetch = new CachedFetch();