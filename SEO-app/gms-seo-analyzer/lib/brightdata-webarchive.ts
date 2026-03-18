// ============================================
// Bright Data — Web Archive API Client
// ============================================
// Docs: https://docs.brightdata.com/api-reference/web-archive
// Create:  POST https://api.brightdata.com/webarchive/search
// Status:  GET  https://api.brightdata.com/webarchive/search/{search_id}
//
// Body format: { filters: { domain_whitelist: ["domain"], min_date, max_date } }

import type { WebArchiveResult } from '@/types';

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const BASE_URL = 'https://api.brightdata.com/webarchive';

function authHeaders(): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
    };
}

export interface SearchParams {
    url: string;
    fromDate?: string;   // YYYY-MM-DD
    toDate?: string;     // YYYY-MM-DD
}

/**
 * Extract the domain from a URL string.
 */
function extractDomain(url: string): string {
    try {
        const u = new URL(url.startsWith('http') ? url : `https://${url}`);
        return u.hostname;
    } catch {
        return url;
    }
}

/**
 * Step 1: Create a web archive search.
 */
export async function createSearch(params: SearchParams): Promise<WebArchiveResult> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const domain = extractDomain(params.url);
    console.log(`Web Archive: creating search for domain "${domain}"`);

    // Build the filters object
    const filters: Record<string, unknown> = {
        domain_whitelist: [domain],
    };

    if (params.fromDate) filters.min_date = params.fromDate;
    if (params.toDate) filters.max_date = params.toDate;

    const response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ filters }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Web Archive search failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const searchId = result.search_id || result.searchId || result.id;

    if (!searchId) {
        throw new Error('No search ID returned. Response: ' + JSON.stringify(result));
    }

    return {
        searchId,
        status: 'running',
        url: params.url,
    };
}

/**
 * Step 2: Check search status and retrieve results when ready.
 */
export async function getSearchStatus(searchId: string): Promise<WebArchiveResult> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const response = await fetch(`${BASE_URL}/search/${searchId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${BRIGHTDATA_API_KEY}` },
    });

    if (response.status === 202) {
        return { searchId, status: 'running' };
    }

    if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404 || errorText.includes('pending') || errorText.includes('processing')) {
            return { searchId, status: 'running' };
        }
        throw new Error(`Web Archive status check failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    // API may return results inline or flag as ready for delivery
    const snapshots = result.results || result.snapshots || result.data;
    const status = result.status || (snapshots ? 'ready' : 'running');

    return {
        searchId,
        status,
        url: result.url,
        results: Array.isArray(snapshots) ? snapshots : undefined,
        totalSnapshots: result.total_snapshots || result.totalSnapshots || (Array.isArray(snapshots) ? snapshots.length : undefined),
    };
}
