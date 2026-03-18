// ============================================
// In-Memory Cache (24-hour TTL)
// ============================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class MemoryCache {
    private store: Map<string, CacheEntry<unknown>> = new Map();
    private defaultTTL = 24 * 60 * 60 * 1000; // 24 hours in ms

    set<T>(key: string, data: T, ttlMs?: number): void {
        this.store.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs ?? this.defaultTTL,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.store.delete(key);
            return null;
        }
        return entry.data as T;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }

    generateKey(module: string, domain: string): string {
        return `${module}:${domain.toLowerCase().trim()}`;
    }
}

// Singleton instance
export const cache = new MemoryCache();
