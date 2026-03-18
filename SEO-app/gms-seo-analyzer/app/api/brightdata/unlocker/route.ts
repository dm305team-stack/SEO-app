import { NextResponse } from 'next/server';
import { unlockUrl } from '@/lib/brightdata-unlocker';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, country } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { success: false, error: 'A URL is required' },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        console.log(`Unlocker API: Fetching "${url}" (country: ${country || 'auto'})`);

        const data = await unlockUrl({ url, country: country || undefined });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Unlocker API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unlocker request failed',
            },
            { status: 500 }
        );
    }
}
