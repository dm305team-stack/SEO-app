import { NextRequest, NextResponse } from 'next/server';
import { serpApiRequest } from '@/lib/serpapi';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';
import { isDemoMode } from '@/lib/demoMode';
import { getMockOnPageData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);

        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockOnPageData(cleanDomain), demo: true });
        }

        const cacheKey = cache.generateKey('onpage', cleanDomain);

        // Analyze on-page SEO by examining SERP results for the domain
        const data = await serpApiRequest(
            {
                engine: 'google',
                q: `site:${cleanDomain}`,
                location: 'United States',
                hl: 'en',
                gl: 'us',
                num: 20,
            },
            cacheKey
        );

        const rawData = data as Record<string, unknown>;
        const organicResults = (rawData.organic_results as Record<string, unknown>[]) || [];
        const searchInfo = rawData.search_information as Record<string, unknown> | undefined;
        const totalIndexed = (searchInfo?.total_results as number) || 0;

        // Analyze on-page issues from SERP data
        const issues: { type: string; count: number; severity: 'critical' | 'warning' | 'info' }[] = [];

        // Check for missing/short titles
        const shortTitles = organicResults.filter((r) => {
            const title = (r.title as string) || '';
            return title.length < 30;
        }).length;
        if (shortTitles > 0) {
            issues.push({ type: 'Short Title Tags', count: shortTitles, severity: shortTitles > 5 ? 'critical' : 'warning' });
        }

        // Check for missing/short descriptions
        const shortSnippets = organicResults.filter((r) => {
            const snippet = (r.snippet as string) || '';
            return snippet.length < 50;
        }).length;
        if (shortSnippets > 0) {
            issues.push({ type: 'Short Meta Descriptions', count: shortSnippets, severity: shortSnippets > 5 ? 'critical' : 'warning' });
        }

        // Check for duplicate titles
        const titles = organicResults.map((r) => (r.title as string) || '');
        const duplicateTitles = titles.filter((t, i) => titles.indexOf(t) !== i).length;
        if (duplicateTitles > 0) {
            issues.push({ type: 'Duplicate Title Tags', count: duplicateTitles, severity: 'critical' });
        }

        // Check for missing HTTPS
        const httpPages = organicResults.filter((r) => {
            const link = (r.link as string) || '';
            return link.startsWith('http://');
        }).length;
        if (httpPages > 0) {
            issues.push({ type: 'Pages Without HTTPS', count: httpPages, severity: 'critical' });
        }

        // Add informational items
        if (totalIndexed > 0) {
            issues.push({ type: 'Total Pages Indexed', count: totalIndexed, severity: 'info' });
        }

        // Calculate on-page score
        const criticalCount = issues.filter((i) => i.severity === 'critical').length;
        const warningCount = issues.filter((i) => i.severity === 'warning').length;
        const onPageScore = Math.max(0, 100 - criticalCount * 15 - warningCount * 5);

        return NextResponse.json({
            success: true,
            data: {
                onPageScore,
                criticalCount,
                warningCount,
                crawledPages: organicResults.length,
                issues,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch on-page data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
