// ============================================
// Bright Data — Web Scraper API Client
// ============================================
// Docs: https://docs.brightdata.com/datasets/scrapers/scrapers-library/overview
// Sync:  POST https://api.brightdata.com/datasets/v3/scrape
// Async: POST https://api.brightdata.com/datasets/v3/trigger
// Poll:  GET  https://api.brightdata.com/datasets/v3/snapshot/{id}

import type { WebScraperResult, WebScraperItem } from '@/types';

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const BASE_URL = 'https://api.brightdata.com/datasets/v3';

function authHeaders(): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
    };
}

/**
 * Synchronous scrape — blocks until results are returned.
 */
export async function scrapeSync(
    datasetId: string,
    items: WebScraperItem[]
): Promise<WebScraperResult> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const url = `${BASE_URL}/scrape?dataset_id=${encodeURIComponent(datasetId)}&format=json&include_errors=true`;

    console.log(`Web Scraper (sync): scraping ${items.length} item(s) with dataset ${datasetId}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(items),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Web Scraper sync failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return {
        mode: 'sync',
        status: 'ready',
        data: Array.isArray(data) ? data : [data],
    };
}

/**
 * Asynchronous scrape — returns a snapshot ID for polling.
 */
export async function scrapeAsync(
    datasetId: string,
    items: WebScraperItem[]
): Promise<WebScraperResult> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const url = `${BASE_URL}/trigger?dataset_id=${encodeURIComponent(datasetId)}&format=json&include_errors=true`;

    console.log(`Web Scraper (async): triggering ${items.length} item(s) with dataset ${datasetId}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(items),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Web Scraper trigger failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const snapshotId = result.snapshot_id || result.snapshotId || result.id;

    if (!snapshotId) {
        throw new Error('No snapshot ID returned. Response: ' + JSON.stringify(result));
    }

    return {
        mode: 'async',
        snapshotId,
        status: 'running',
    };
}

/**
 * Poll a snapshot for results (used after scrapeAsync).
 */
export async function getScraperSnapshot(snapshotId: string): Promise<WebScraperResult> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const response = await fetch(`${BASE_URL}/snapshot/${snapshotId}?format=json`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${BRIGHTDATA_API_KEY}` },
    });

    // 202 = still processing
    if (response.status === 202) {
        return { mode: 'async', snapshotId, status: 'running' };
    }

    if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404 || errorText.includes('not ready') || errorText.includes('pending')) {
            return { mode: 'async', snapshotId, status: 'running' };
        }
        throw new Error(`Scraper snapshot failed (${response.status}): ${errorText}`);
    }

    const rawData = await response.json();
    const data: Record<string, unknown>[] = Array.isArray(rawData)
        ? rawData
        : rawData.data && Array.isArray(rawData.data)
            ? rawData.data
            : [rawData];

    return {
        mode: 'async',
        snapshotId,
        status: 'ready',
        data,
    };
}
