// ============================================
// SerpApi Client
// ============================================

import { cache } from './cache';

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

export type SerpApiEngine =
    | 'google'
    | 'google_trends'
    | 'google_maps'
    | 'google_shopping'
    | 'google_autocomplete'
    | 'google_maps_reviews';

export interface SerpApiParams {
    engine: SerpApiEngine;
    q?: string;
    location?: string;
    gl?: string;
    hl?: string;
    num?: number;
    start?: number;
    // Google Trends specific
    data_type?: string;
    date?: string;
    // Google Maps specific
    type?: string;
    ll?: string;
    // General
    [key: string]: unknown;
}

function getApiKey(): string {
    const key = process.env.SERPAPI_API_KEY;
    if (!key) {
        throw new Error('SerpApi API key not configured. Set SERPAPI_API_KEY in .env.local');
    }
    return key;
}

/**
 * Makes a SerpApi request with caching support.
 */
export async function serpApiRequest<T = Record<string, unknown>>(
    params: SerpApiParams,
    cacheKey?: string
): Promise<T> {
    // Check cache first
    if (cacheKey) {
        const cached = cache.get<T>(cacheKey);
        if (cached) return cached;
    }

    const apiKey = getApiKey();

    const searchParams = new URLSearchParams();
    searchParams.set('api_key', apiKey);
    searchParams.set('output', 'json');

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            searchParams.set(key, String(value));
        }
    }

    const url = `${SERPAPI_BASE_URL}?${searchParams.toString()}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                if (response.status < 500) {
                    throw new Error(`SerpApi error (${response.status}): ${errorBody}`);
                }
                throw new Error(`SerpApi server error (${response.status})`);
            }

            const data = (await response.json()) as T;

            if (cacheKey) cache.set(cacheKey, data);
            return data;
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            // Don't retry client errors
            if (lastError.message.includes('SerpApi error')) {
                throw lastError;
            }

            if (attempt < 2) {
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    throw lastError || new Error('SerpApi request failed after retries');
}
