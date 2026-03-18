import { NextRequest, NextResponse } from 'next/server';
import { serpApiRequest } from '@/lib/serpapi';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';
import { isDemoMode } from '@/lib/demoMode';
import { getMockSerpData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);

        // Demo mode — return mock data
        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockSerpData(cleanDomain), demo: true });
        }

        const cacheKey = cache.generateKey('serp', cleanDomain);

        const data = await serpApiRequest(
            {
                engine: 'google',
                q: cleanDomain,
                location: 'United States',
                hl: 'en',
                gl: 'us',
                num: 10,
            },
            cacheKey
        );

        const organicResults = (data as Record<string, unknown>).organic_results as Record<string, unknown>[] || [];

        const serpResults = organicResults.map((item: Record<string, unknown>, index: number) => ({
            position: (item.position as number) || index + 1,
            title: (item.title as string) || '',
            url: (item.link as string) || '',
            snippet: (item.snippet as string) || '',
            breadcrumb: (item.displayed_link as string) || '',
        }));

        // Check for SERP features
        const rawData = data as Record<string, unknown>;
        const featureTypes = ['featured_snippet', 'people_also_ask', 'local_pack', 'knowledge_graph', 'video', 'image', 'shopping'];
        const featureMap: Record<string, string> = {
            featured_snippet: 'answer_box',
            people_also_ask: 'related_questions',
            local_pack: 'local_results',
            knowledge_graph: 'knowledge_graph',
            video: 'inline_videos',
            image: 'inline_images',
            shopping: 'shopping_results',
        };

        const features = featureTypes.map((type) => ({
            type,
            present: !!rawData[featureMap[type]],
        }));

        const searchInfo = rawData.search_information as Record<string, unknown> | undefined;

        return NextResponse.json({
            success: true,
            data: {
                results: serpResults,
                features,
                totalResults: (searchInfo?.total_results as number) || 0,
                keyword: cleanDomain,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch SERP data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
