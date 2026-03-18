import { NextRequest, NextResponse } from 'next/server';
import { serpApiRequest } from '@/lib/serpapi';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';
import { isDemoMode } from '@/lib/demoMode';
import { getMockTrendsData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);

        if (isDemoMode()) {
            const mockData = getMockTrendsData(cleanDomain);
            return NextResponse.json({ success: true, data: mockData, demo: true });
        }

        // Extract brand keyword from domain
        const keyword = cleanDomain.replace(/\.(com|net|org|io|co)$/i, '');
        const cacheKey = cache.generateKey('trends', cleanDomain);

        // Use SerpApi Google Trends engine
        const data = await serpApiRequest(
            {
                engine: 'google_trends',
                q: keyword,
                data_type: 'TIMESERIES',
                date: 'today 12-m',
                hl: 'en',
                gl: 'us',
            },
            cacheKey
        );

        const rawData = data as Record<string, unknown>;

        // Parse interest over time from SerpApi response
        const interestOverTime: { date: string; value: number }[] = [];
        const timelineData = (rawData.interest_over_time as Record<string, unknown>)?.timeline_data as Record<string, unknown>[] || [];

        for (const item of timelineData) {
            const date = (item.date as string) || '';
            const values = (item.values as Record<string, unknown>[]) || [];
            const value = (values[0]?.extracted_value as number) || 0;
            if (date) {
                interestOverTime.push({ date: date.split(' – ')[0], value });
            }
        }

        // Fetch related queries
        let relatedQueries: { query: string; value: number }[] = [];
        let risingQueries: { query: string; value: number; rising: boolean }[] = [];

        try {
            const relatedData = await serpApiRequest(
                {
                    engine: 'google_trends',
                    q: keyword,
                    data_type: 'RELATED_QUERIES',
                    date: 'today 12-m',
                    hl: 'en',
                    gl: 'us',
                },
                cacheKey + '_related'
            );

            const relRaw = relatedData as Record<string, unknown>;
            const topQueries = (relRaw.related_queries as Record<string, unknown>)?.top as Record<string, unknown>[] || [];
            const risQueries = (relRaw.related_queries as Record<string, unknown>)?.rising as Record<string, unknown>[] || [];

            relatedQueries = topQueries.slice(0, 10).map((q: Record<string, unknown>) => ({
                query: (q.query as string) || '',
                value: (q.extracted_value as number) || (q.value as number) || 0,
            }));

            risingQueries = risQueries.slice(0, 10).map((q: Record<string, unknown>) => ({
                query: (q.query as string) || '',
                value: (q.extracted_value as number) || (q.value as number) || 0,
                rising: true,
            }));
        } catch {
            // Related queries may fail for some terms, that's OK
        }

        // Calculate metrics
        const values = interestOverTime.map(i => i.value);
        const avgInterest = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
        const peakIdx = values.length > 0 ? values.indexOf(Math.max(...values)) : 0;
        const recentAvg = values.slice(-4).reduce((a, b) => a + b, 0) / Math.max(values.slice(-4).length, 1);
        const olderAvg = values.slice(0, 4).reduce((a, b) => a + b, 0) / Math.max(values.slice(0, 4).length, 1);
        const trendDirection = recentAvg > olderAvg * 1.1 ? 'rising' : recentAvg < olderAvg * 0.9 ? 'declining' : 'stable';

        return NextResponse.json({
            success: true,
            data: {
                keyword,
                interestOverTime,
                interestByRegion: [],
                relatedQueries,
                risingQueries,
                relatedTopics: [],
                averageInterest: avgInterest,
                peakInterest: interestOverTime[peakIdx] || { date: '', value: 0 },
                trendDirection,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Trends API failed';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
