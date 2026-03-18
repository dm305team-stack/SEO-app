import { NextRequest, NextResponse } from 'next/server';
import { serpApiRequest } from '@/lib/serpapi';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';
import { isDemoMode } from '@/lib/demoMode';
import { getMockBacklinksData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);

        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockBacklinksData(cleanDomain), demo: true });
        }

        const cacheKey = cache.generateKey('backlinks', cleanDomain);

        // Search for pages linking to this domain using "link:" operator
        const data = await serpApiRequest(
            {
                engine: 'google',
                q: `"${cleanDomain}" -site:${cleanDomain}`,
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
        const totalMentions = (searchInfo?.total_results as number) || 0;

        // Extract referring domains from results
        const domainMap = new Map<string, { backlinks: number; rank: number }>();
        organicResults.forEach((item: Record<string, unknown>, idx: number) => {
            const link = (item.link as string) || '';
            try {
                const url = new URL(link);
                const refDomain = url.hostname.replace('www.', '');
                if (refDomain !== cleanDomain) {
                    const existing = domainMap.get(refDomain);
                    if (existing) {
                        existing.backlinks++;
                    } else {
                        domainMap.set(refDomain, { backlinks: 1, rank: organicResults.length - idx });
                    }
                }
            } catch {
                // skip invalid URLs
            }
        });

        const referringDomains = Array.from(domainMap.entries()).map(([domain, info]) => ({
            domain,
            backlinks: info.backlinks,
            rank: info.rank,
        }));

        // Estimate totals from search result count
        const estimatedBacklinks = Math.round(totalMentions * 1.5);
        const estimatedDomains = Math.round(totalMentions * 0.6);
        const domainRank = Math.min(100, Math.round(Math.log10(Math.max(estimatedBacklinks, 1)) * 18));

        return NextResponse.json({
            success: true,
            data: {
                totalBacklinks: estimatedBacklinks,
                referringDomains: estimatedDomains,
                domainRank,
                dofollow: Math.round(estimatedBacklinks * 0.7),
                nofollow: Math.round(estimatedBacklinks * 0.3),
                topReferringDomains: referringDomains.slice(0, 10),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch backlinks data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
