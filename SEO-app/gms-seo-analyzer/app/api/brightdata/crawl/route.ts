import { NextResponse } from 'next/server';
import { triggerCrawl, getSnapshot } from '@/lib/brightdata-crawl';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, urls, snapshotId } = body;

        // Two actions: "trigger" to start a crawl, "snapshot" to check results
        if (action === 'trigger') {
            if (!urls || !Array.isArray(urls) || urls.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'At least one URL is required' },
                    { status: 400 }
                );
            }

            // Validate URLs
            const validUrls: string[] = [];
            for (const url of urls) {
                try {
                    new URL(url);
                    validUrls.push(url);
                } catch {
                    // Add https:// if missing
                    try {
                        new URL(`https://${url}`);
                        validUrls.push(`https://${url}`);
                    } catch {
                        // skip invalid
                    }
                }
            }

            if (validUrls.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'No valid URLs provided' },
                    { status: 400 }
                );
            }

            const result = await triggerCrawl({ urls: validUrls });
            return NextResponse.json({ success: true, data: result });

        } else if (action === 'snapshot') {
            if (!snapshotId || typeof snapshotId !== 'string') {
                return NextResponse.json(
                    { success: false, error: 'Snapshot ID is required' },
                    { status: 400 }
                );
            }

            const result = await getSnapshot(snapshotId);
            return NextResponse.json({ success: true, data: result });

        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid action. Use "trigger" or "snapshot"' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Crawl API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Crawl request failed',
            },
            { status: 500 }
        );
    }
}
