// ============================================
// Bright Data — Deep Lookup API Client
// ============================================
// Docs: https://docs.brightdata.com/api-reference/deep-lookup/overview
// Flow: POST /preview → GET /preview/{id} → POST /requests → GET /requests/{id}/download
// Body format: [{ "query": "Find all ..." }]

import type { DeepLookupPreview, DeepLookupRequest } from '@/types';

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const BASE_URL = 'https://api.brightdata.com/datasets/deep_lookup/v1';

function authHeaders(): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
    };
}

/**
 * Build a natural-language prompt from the user's inputs.
 * The API requires the query to start with "Find all".
 */
function buildPrompt(query: string, options?: { country?: string; city?: string; category?: string }): string {
    let prompt = query.trim();

    // Ensure it starts with "Find all"
    if (!prompt.toLowerCase().startsWith('find all')) {
        prompt = `Find all ${prompt}`;
    }

    // Append location if provided
    const locationParts: string[] = [];
    if (options?.city) locationParts.push(options.city);
    if (options?.country) locationParts.push(options.country);

    if (locationParts.length > 0 && !prompt.toLowerCase().includes(locationParts[0].toLowerCase())) {
        prompt += ` in ${locationParts.join(', ')}`;
    }

    return prompt;
}

/**
 * Step 1: Create a preview — shows sample results before committing.
 */
export async function createPreview(
    query: string,
    options?: { country?: string; city?: string; category?: string }
): Promise<DeepLookupPreview> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const prompt = buildPrompt(query, options);
    console.log(`Deep Lookup: creating preview with prompt: "${prompt}"`);

    const response = await fetch(`${BASE_URL}/preview`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ query: prompt }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deep Lookup preview failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    return {
        id: result.preview_id || result.id,
        status: result.preview_id ? 'pending' : (result.status || 'pending'),
        estimatedRecords: result.estimated_records || result.estimatedRecords,
        estimatedCost: result.estimated_cost || result.estimatedCost,
        data: result.columns || result.data || result.sample || undefined,
    };
}

/**
 * Step 2: Poll preview status until ready.
 */
export async function getPreview(previewId: string): Promise<DeepLookupPreview> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const response = await fetch(`${BASE_URL}/preview/${previewId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${BRIGHTDATA_API_KEY}` },
    });

    if (response.status === 202) {
        return { id: previewId, status: 'pending' };
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deep Lookup get preview failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    return {
        id: previewId,
        status: result.status || 'ready',
        estimatedRecords: result.estimated_records || result.estimatedRecords,
        estimatedCost: result.estimated_cost || result.estimatedCost,
        data: result.columns || result.data || result.sample || undefined,
    };
}

/**
 * Step 3: Trigger a full request based on a preview.
 */
export async function createRequest(
    query: string,
    options?: { country?: string; city?: string; category?: string }
): Promise<DeepLookupRequest> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const prompt = buildPrompt(query, options);
    console.log(`Deep Lookup: creating request with prompt: "${prompt}"`);

    const response = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ query: prompt }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deep Lookup request failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    return {
        id: result.id || result.request_id,
        status: result.status || 'running',
    };
}

/**
 * Step 4: Download results for a completed request.
 */
export async function downloadResults(requestId: string): Promise<DeepLookupRequest> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY is not configured');

    const response = await fetch(`${BASE_URL}/requests/${requestId}/download`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${BRIGHTDATA_API_KEY}` },
    });

    if (response.status === 202) {
        return { id: requestId, status: 'running' };
    }

    if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404 || errorText.includes('pending') || errorText.includes('running')) {
            return { id: requestId, status: 'running' };
        }
        throw new Error(`Deep Lookup download failed (${response.status}): ${errorText}`);
    }

    const rawData = await response.json();
    const data = Array.isArray(rawData) ? rawData : rawData.data ? rawData.data : [rawData];

    return {
        id: requestId,
        status: 'ready',
        data,
    };
}
