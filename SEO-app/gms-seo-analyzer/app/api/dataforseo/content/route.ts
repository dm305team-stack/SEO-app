import { NextRequest, NextResponse } from 'next/server';
import { serpApiRequest } from '@/lib/serpapi';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';
import { isDemoMode } from '@/lib/demoMode';
import { getMockContentData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);

        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockContentData(cleanDomain), demo: true });
        }

        const cacheKey = cache.generateKey('content', cleanDomain);

        // Search for content from this domain
        const data = await serpApiRequest(
            {
                engine: 'google',
                q: `site:${cleanDomain}`,
                location: 'United States',
                hl: 'en',
                gl: 'us',
                num: 10,
            },
            cacheKey
        );

        const rawData = data as Record<string, unknown>;
        const organicResults = (rawData.organic_results as Record<string, unknown>[]) || [];
        const searchInfo = rawData.search_information as Record<string, unknown> | undefined;
        const totalContent = (searchInfo?.total_results as number) || organicResults.length;

        // Check for duplicate titles
        const titles = organicResults.map((r) => (r.title as string) || '');
        const uniqueTitles = new Set(titles);
        const duplicateWarnings = titles.length - uniqueTitles.size;

        // Estimate content score from available metrics
        const avgSnippetLength = organicResults.reduce((sum, r) => {
            return sum + ((r.snippet as string) || '').length;
        }, 0) / (organicResults.length || 1);
        const contentScore = Math.min(100, Math.round(avgSnippetLength / 2));

        const topContent = organicResults.map((item: Record<string, unknown>, idx: number) => ({
            title: (item.title as string) || '',
            url: (item.link as string) || '',
            score: Math.max(50, 100 - idx * 5),
            wordCount: Math.round(((item.snippet as string) || '').length * 8), // Estimate from snippet
        }));

        return NextResponse.json({
            success: true,
            data: {
                contentScore,
                totalContent,
                duplicateWarnings,
                readabilityScore: Math.round(contentScore * 0.8),
                topContent,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch content data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
