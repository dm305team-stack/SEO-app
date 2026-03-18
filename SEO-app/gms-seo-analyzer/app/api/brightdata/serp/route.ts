import { NextResponse } from 'next/server';
import { searchSerp, type SerpSearchOptions } from '@/lib/brightdata-serp';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { keyword, country, language, device, numResults } = body;

        if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'A keyword is required' },
                { status: 400 }
            );
        }

        const options: SerpSearchOptions = {
            keyword: keyword.trim(),
            country: country || undefined,
            language: language || undefined,
            device: device || 'desktop',
            numResults: numResults || 10,
        };

        console.log(`SERP API: Searching for "${options.keyword}" (${options.country || 'us'}, ${options.device})`);

        const data = await searchSerp(options);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('SERP API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'SERP analysis failed',
            },
            { status: 500 }
        );
    }
}
