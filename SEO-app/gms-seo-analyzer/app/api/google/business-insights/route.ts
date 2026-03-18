import { NextRequest, NextResponse } from 'next/server';

// Business Profile Performance API — requires OAuth 2.0 access token
// Scopes needed: https://www.googleapis.com/auth/business.manage

export async function POST(req: NextRequest) {
    try {
        const { locationId, accessToken } = await req.json();

        if (!accessToken) {
            return NextResponse.json(
                { success: false, error: 'Google OAuth access token required. Generate one at https://developers.google.com/oauthplayground with scope: https://www.googleapis.com/auth/business.manage' },
                { status: 401 }
            );
        }

        if (!locationId) {
            return NextResponse.json(
                { success: false, error: 'Location ID required. Format: locations/XXXXXXXXXXXXXXXXX' },
                { status: 400 }
            );
        }

        // Last 90 days range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        const fmt = (d: Date) => ({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() });

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        // Fetch daily metrics
        const metricsBody = {
            dailyMetrics: [
                'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
                'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
                'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
                'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
                'CALL_CLICKS',
                'WEBSITE_CLICKS',
                'BUSINESS_DIRECTION_REQUESTS',
            ],
            dailyRange: {
                startDate: fmt(startDate),
                endDate: fmt(endDate),
            },
        };

        const [metricsRes, keywordsRes] = await Promise.all([
            fetch(
                `https://businessprofileperformance.googleapis.com/v1/${locationId}:fetchMultiDailyMetricsTimeSeries`,
                { method: 'POST', headers, body: JSON.stringify(metricsBody) }
            ),
            fetch(
                `https://businessprofileperformance.googleapis.com/v1/${locationId}/searchkeywords/impressions/monthly` +
                `?monthlyRange.startMonth.year=${startDate.getFullYear()}&monthlyRange.startMonth.month=${startDate.getMonth() + 1}` +
                `&monthlyRange.endMonth.year=${endDate.getFullYear()}&monthlyRange.endMonth.month=${endDate.getMonth() + 1}`,
                { headers }
            ),
        ]);

        if (!metricsRes.ok) {
            const errText = await metricsRes.text();
            return NextResponse.json({ success: false, error: `Google API error: ${errText}` }, { status: metricsRes.status });
        }

        const metricsData = await metricsRes.json();
        const keywordsData = keywordsRes.ok ? await keywordsRes.json() : {};

        // Helper: sum all values in a time series
        const sumSeries = (series: { dailySubEntityData?: { timeSeries?: { datedValues?: { value?: number }[] } }[]; timeSeries?: { datedValues?: { value?: number }[] } } | null) => {
            if (!series) return 0;
            const datedValues = series.dailySubEntityData?.[0]?.timeSeries?.datedValues
                ?? series.timeSeries?.datedValues
                ?? [];
            return datedValues.reduce((acc: number, v: { value?: number }) => acc + (Number(v.value) || 0), 0);
        };

        const multiSeries: { dailyMetric: string; dailySubEntityData?: { timeSeries?: { datedValues?: { value?: number }[] } }[]; timeSeries?: { datedValues?: { value?: number }[] } }[] = metricsData.multiDailyMetricTimeSeries ?? [];
        const getMetric = (name: string) => sumSeries(multiSeries.find((m) => m.dailyMetric === name) ?? null);

        const metrics = {
            viewsSearch:
                getMetric('BUSINESS_IMPRESSIONS_DESKTOP_SEARCH') +
                getMetric('BUSINESS_IMPRESSIONS_MOBILE_SEARCH'),
            viewsMaps:
                getMetric('BUSINESS_IMPRESSIONS_DESKTOP_MAPS') +
                getMetric('BUSINESS_IMPRESSIONS_MOBILE_MAPS'),
            actionsWebsite: getMetric('WEBSITE_CLICKS'),
            actionsPhone: getMetric('CALL_CLICKS'),
            actionsDirections: getMetric('BUSINESS_DIRECTION_REQUESTS'),
            searchKeywords: ((keywordsData.searchKeywordsCounts ?? []) as { searchKeyword: string; insightsValue?: { value?: number } }[])
                .slice(0, 20)
                .map((k) => ({
                    keyword: k.searchKeyword,
                    impressions: Number(k.insightsValue?.value) || 0,
                }))
                .sort((a, b) => b.impressions - a.impressions),
            periodDays: 90,
        };

        return NextResponse.json({ success: true, data: metrics });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch business insights';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
