import { NextRequest, NextResponse } from 'next/server';
import { createSearch, getSearchStatus } from '@/lib/brightdata-webarchive';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, url, fromDate, toDate, searchId } = body;

        switch (action) {
            case 'search': {
                if (!url) {
                    return NextResponse.json({ success: false, error: 'url is required' }, { status: 400 });
                }
                const result = await createSearch({ url, fromDate, toDate });
                return NextResponse.json({ success: true, data: result });
            }

            case 'status': {
                if (!searchId) {
                    return NextResponse.json({ success: false, error: 'searchId is required' }, { status: 400 });
                }
                const result = await getSearchStatus(searchId);
                return NextResponse.json({ success: true, data: result });
            }

            default:
                return NextResponse.json(
                    { success: false, error: `Unknown action "${action}". Use: search, status` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Web Archive API Error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
