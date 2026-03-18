import { NextRequest, NextResponse } from 'next/server';
import { serpApiRequest } from '@/lib/serpapi';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';
import { isDemoMode } from '@/lib/demoMode';
import { getMockDomainAnalyticsData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);

        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockDomainAnalyticsData(cleanDomain), demo: true });
        }

        const cacheKey = cache.generateKey('domain-analytics', cleanDomain);

        // Use site: search to estimate domain metrics
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
        const searchInfo = rawData.search_information as Record<string, unknown> | undefined;
        const totalIndexed = (searchInfo?.total_results as number) || 0;
        const organicResults = (rawData.organic_results as Record<string, unknown>[]) || [];

        // Estimate metrics based on indexed pages
        const estimatedTraffic = Math.round(totalIndexed * 15); // ~15 visits per indexed page estimate
        const estimatedKeywords = Math.round(totalIndexed * 2.5);
        const domainRank = Math.min(100, Math.round(Math.log10(Math.max(totalIndexed, 1)) * 20));

        return NextResponse.json({
            success: true,
            data: {
                domainRank,
                organicTraffic: estimatedTraffic,
                paidTraffic: 0,
                organicKeywords: estimatedKeywords,
                paidKeywords: 0,
                backlinks: 0, // Can't determine from SerpApi
                referringDomains: organicResults.length,
                authorityScore: domainRank,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch domain analytics';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
