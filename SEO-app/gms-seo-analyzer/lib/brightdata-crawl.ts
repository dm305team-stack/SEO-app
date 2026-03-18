const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const DATASET_ID = 'gd_m6gjtfmeh43we6cqc';
const TRIGGER_URL = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${DATASET_ID}`;
const SNAPSHOT_URL = 'https://api.brightdata.com/datasets/v3/snapshot';

export interface CrawlTriggerOptions {
    urls: string[];
}

export interface CrawlTriggerResult {
    snapshotId: string;
    status: string;
}

export interface CrawlSnapshotResult {
    snapshotId: string;
    status: 'running' | 'ready' | 'failed';
    data?: CrawlPageData[];
    progress?: number;
    error?: string;
}

export interface CrawlPageData {
    url: string;
    title?: string;
    description?: string;
    status_code?: number;
    content_type?: string;
    word_count?: number;
    links_count?: number;
    images_count?: number;
    load_time?: number;
    // Raw fields from Bright Data
    [key: string]: unknown;
}

/**
 * Trigger a crawl job — sends URLs to Bright Data and returns a snapshot ID for polling
 */
export async function triggerCrawl(options: CrawlTriggerOptions): Promise<CrawlTriggerResult> {
    if (!BRIGHTDATA_API_KEY) {
        throw new Error('BRIGHTDATA_API_KEY is not configured');
    }

    if (!options.urls.length) {
        throw new Error('At least one URL is required');
    }

    // Bright Data datasets API expects an array of objects with "url" key
    const payload = options.urls.map((url) => ({ url }));

    console.log(`Crawl API: Triggering crawl for ${options.urls.length} URL(s)`);

    const response = await fetch(TRIGGER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Crawl trigger failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('Crawl API: Trigger response:', JSON.stringify(result));

    // Bright Data returns { snapshot_id: "..." } on success
    const snapshotId = result.snapshot_id || result.snapshotId || result.id;

    if (!snapshotId) {
        throw new Error('No snapshot ID returned from trigger. Response: ' + JSON.stringify(result));
    }

    return {
        snapshotId,
        status: 'running',
    };
}

/**
 * Check snapshot status and retrieve results when ready
 */
export async function getSnapshot(snapshotId: string): Promise<CrawlSnapshotResult> {
    if (!BRIGHTDATA_API_KEY) {
        throw new Error('BRIGHTDATA_API_KEY is not configured');
    }

    const response = await fetch(`${SNAPSHOT_URL}/${snapshotId}?format=json`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
    });

    // 202 = still processing
    if (response.status === 202) {
        return {
            snapshotId,
            status: 'running',
            progress: 0,
        };
    }

    if (!response.ok) {
        const errorText = await response.text();
        // Check if it's a "not ready" response
        if (response.status === 404 || errorText.includes('not ready') || errorText.includes('pending')) {
            return {
                snapshotId,
                status: 'running',
                progress: 0,
            };
        }
        throw new Error(`Snapshot fetch failed (${response.status}): ${errorText}`);
    }

    const rawData = await response.json();
    console.log('Crawl API: Snapshot response type:', typeof rawData, Array.isArray(rawData) ? `array[${rawData.length}]` : '');

    // Parse the response into our format
    let data: CrawlPageData[] = [];

    if (Array.isArray(rawData)) {
        data = rawData.map(normalizeCrawlResult);
    } else if (rawData.data && Array.isArray(rawData.data)) {
        data = rawData.data.map(normalizeCrawlResult);
    } else if (rawData.results && Array.isArray(rawData.results)) {
        data = rawData.results.map(normalizeCrawlResult);
    } else if (typeof rawData === 'object' && rawData.url) {
        // Single result
        data = [normalizeCrawlResult(rawData)];
    }

    return {
        snapshotId,
        status: 'ready',
        data,
    };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeCrawlResult(item: any): CrawlPageData {
    return {
        url: item.url || item.input?.url || '',
        title: item.title || item.page_title || '',
        description: item.description || item.meta_description || '',
        status_code: item.status_code || item.statusCode || item.http_status,
        content_type: item.content_type || item.contentType || '',
        word_count: item.word_count || item.wordCount || item.words,
        links_count: item.links_count || item.linksCount || item.total_links,
        images_count: item.images_count || item.imagesCount || item.total_images,
        load_time: item.load_time || item.loadTime || item.response_time,
        ...item,
    };
}
