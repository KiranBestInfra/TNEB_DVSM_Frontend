import { API_HEADERS, API_TIMEOUT, HTTP_STATUS, baseURL } from './config';

class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

class CacheItem {
    constructor(data, expiresAt) {
        this.data = data;
        this.expiresAt = expiresAt;
    }

    isExpired() {
        return this.expiresAt <= Date.now();
    }
}

class ApiClient {
    constructor() {
        this.baseURL = baseURL();
        this.defaultHeaders = API_HEADERS;
        this.cache = new Map();
        this.defaultCacheOptions = {
            enabled: true,
            ttl: 5 * 60 * 1000,
            useLocalStorage: false,
            storageKey: 'api_cache',
        };
    }

    _generateCacheKey(endpoint, options) {
        const { method, body } = options;
        if (method !== 'GET') return null;

        const url = `${this.baseURL}${endpoint}`;
        return `${method}:${url}${body ? `:${JSON.stringify(body)}` : ''}`;
    }

    _setCacheItem(key, data, ttl) {
        if (!key) return;

        const expiresAt = Date.now() + ttl;
        const cacheItem = new CacheItem(data, expiresAt);

        if (this.defaultCacheOptions.useLocalStorage) {
            try {
                const cache = JSON.parse(
                    localStorage.getItem(this.defaultCacheOptions.storageKey) ||
                        '{}'
                );
                cache[key] = {
                    data,
                    expiresAt,
                };
                localStorage.setItem(
                    this.defaultCacheOptions.storageKey,
                    JSON.stringify(cache)
                );
            } catch (error) {
                console.warn('Failed to store in localStorage:', error);
                this.cache.set(key, cacheItem);
            }
        } else {
            this.cache.set(key, cacheItem);
        }
    }

    _getCacheItem(key) {
        if (!key) return null;

        let cacheItem;

        if (this.defaultCacheOptions.useLocalStorage) {
            try {
                const cache = JSON.parse(
                    localStorage.getItem(this.defaultCacheOptions.storageKey) ||
                        '{}'
                );
                const item = cache[key];
                if (item) {
                    cacheItem = new CacheItem(item.data, item.expiresAt);
                }
            } catch (error) {
                console.warn('Failed to retrieve from localStorage:', error);
                cacheItem = this.cache.get(key);
            }
        } else {
            cacheItem = this.cache.get(key);
        }

        if (!cacheItem) return null;
        if (cacheItem.isExpired()) {
            this._removeCacheItem(key);
            return null;
        }

        return cacheItem.data;
    }

    _removeCacheItem(key) {
        if (!key) return;

        if (this.defaultCacheOptions.useLocalStorage) {
            try {
                const cache = JSON.parse(
                    localStorage.getItem(this.defaultCacheOptions.storageKey) ||
                        '{}'
                );
                delete cache[key];
                localStorage.setItem(
                    this.defaultCacheOptions.storageKey,
                    JSON.stringify(cache)
                );
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
            }
        }

        this.cache.delete(key);
    }

    configureCaching(options = {}) {
        this.defaultCacheOptions = {
            ...this.defaultCacheOptions,
            ...options,
        };

        // Initialize localStorage if needed
        if (this.defaultCacheOptions.useLocalStorage) {
            try {
                if (
                    !localStorage.getItem(this.defaultCacheOptions.storageKey)
                ) {
                    localStorage.setItem(
                        this.defaultCacheOptions.storageKey,
                        '{}'
                    );
                }
            } catch (_) {
                console.warn(
                    'localStorage is not available, falling back to in-memory cache'
                );
                this.defaultCacheOptions.useLocalStorage = false;
            }
        }

        return this;
    }

    clearCache(endpointPattern = null) {
        if (this.defaultCacheOptions.useLocalStorage) {
            try {
                if (!endpointPattern) {
                    localStorage.setItem(
                        this.defaultCacheOptions.storageKey,
                        '{}'
                    );
                } else {
                    const cache = JSON.parse(
                        localStorage.getItem(
                            this.defaultCacheOptions.storageKey
                        ) || '{}'
                    );
                    const pattern = new RegExp(endpointPattern);

                    Object.keys(cache).forEach((key) => {
                        if (pattern.test(key)) {
                            delete cache[key];
                        }
                    });

                    localStorage.setItem(
                        this.defaultCacheOptions.storageKey,
                        JSON.stringify(cache)
                    );
                }
            } catch (error) {
                console.warn('Failed to clear localStorage cache:', error);
            }
        }

        if (!endpointPattern) {
            this.cache.clear();
        } else {
            const pattern = new RegExp(endpointPattern);
            for (const key of this.cache.keys()) {
                if (pattern.test(key)) {
                    this.cache.delete(key);
                }
            }
        }
    }

    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            headers = {},
            body,
            signal,
            cache: cacheOptions = {},
            ...customConfig
        } = options;

        const requestOptions = {
            method,
            headers: {
                ...this.defaultHeaders,
                ...headers,
            },
            credentials: 'include',
            signal: signal || AbortSignal.timeout(API_TIMEOUT),
            ...customConfig,
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        const finalCacheOptions = {
            ...this.defaultCacheOptions,
            ...cacheOptions,
        };

        const cacheKey = finalCacheOptions.enabled
            ? this._generateCacheKey(endpoint, { method, body })
            : null;

        if (cacheKey) {
            const cachedData = this._getCacheItem(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }

        try {
            this.baseURL = baseURL();
            const response = await fetch(
                `${this.baseURL}${endpoint}`,
                requestOptions
            );
            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(
                    data.message || 'An error occurred',
                    response.status,
                    data
                );
            }

            if (cacheKey) {
                this._setCacheItem(cacheKey, data, finalCacheOptions.ttl);
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408);
            }

            throw new ApiError(
                error.message || 'Network error',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    async patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
export { ApiError };
