import { NextRequest, NextResponse } from 'next/server';
import { scrapeSync, scrapeAsync, getScraperSnapshot } from '@/lib/brightdata-scraper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, datasetId, items, snapshotId } = body;

        if (action === 'snapshot') {
            // Poll a running snapshot
            if (!snapshotId) {
                return NextResponse.json({ success: false, error: 'snapshotId is required' }, { status: 400 });
            }
            const result = await getScraperSnapshot(snapshotId);
            return NextResponse.json({ success: true, data: result });
        }

        // Default: scrape
        if (!datasetId) {
            return NextResponse.json({ success: false, error: 'datasetId is required' }, { status: 400 });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'items array is required' }, { status: 400 });
        }

        const mode = action === 'async' ? 'async' : 'sync';
        const result = mode === 'async'
            ? await scrapeAsync(datasetId, items)
            : await scrapeSync(datasetId, items);

        return NextResponse.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Web Scraper API Error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
