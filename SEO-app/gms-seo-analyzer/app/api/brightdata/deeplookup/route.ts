import { NextRequest, NextResponse } from 'next/server';
import { createPreview, getPreview, createRequest, downloadResults } from '@/lib/brightdata-deeplookup';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, query, country, city, category, previewId, requestId } = body;

        switch (action) {
            case 'preview': {
                if (!query) {
                    return NextResponse.json({ success: false, error: 'query is required' }, { status: 400 });
                }
                const preview = await createPreview(query, { country, city, category });
                return NextResponse.json({ success: true, data: { preview } });
            }

            case 'poll-preview': {
                if (!previewId) {
                    return NextResponse.json({ success: false, error: 'previewId is required' }, { status: 400 });
                }
                const preview = await getPreview(previewId);
                return NextResponse.json({ success: true, data: { preview } });
            }

            case 'request': {
                if (!query) {
                    return NextResponse.json({ success: false, error: 'query is required' }, { status: 400 });
                }
                const req = await createRequest(query, { country, city, category });
                return NextResponse.json({ success: true, data: { request: req } });
            }

            case 'download': {
                if (!requestId) {
                    return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 });
                }
                const result = await downloadResults(requestId);
                return NextResponse.json({ success: true, data: { request: result } });
            }

            default:
                return NextResponse.json(
                    { success: false, error: `Unknown action "${action}". Use: preview, poll-preview, request, download` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Deep Lookup API Error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
