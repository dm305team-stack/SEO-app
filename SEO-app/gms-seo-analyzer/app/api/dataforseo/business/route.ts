import { NextRequest, NextResponse } from 'next/server';
import { serpApiRequest } from '@/lib/serpapi';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';
import { isDemoMode } from '@/lib/demoMode';
import { getMockBusinessData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);

        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockBusinessData(cleanDomain), demo: true });
        }

        const cacheKey = cache.generateKey('business', cleanDomain);

        try {
            // Use SerpApi Google Maps engine
            const data = await serpApiRequest(
                {
                    engine: 'google_maps',
                    q: cleanDomain,
                    hl: 'en',
                    gl: 'us',
                },
                cacheKey
            );

            const rawData = data as Record<string, unknown>;
            const localResults = (rawData.local_results as Record<string, unknown>[]) || [];
            const placeResults = (rawData.place_results as Record<string, unknown>) || null;

            // Try place_results first (single business), then local_results
            const profile = placeResults || localResults[0];

            if (!profile) {
                return NextResponse.json({
                    success: true,
                    data: { hasProfile: false },
                });
            }

            // Extract reviews if available
            const reviews = ((profile.reviews as Record<string, unknown>[]) || [])
                .slice(0, 5)
                .map((r: Record<string, unknown>) => ({
                    author: (r.user as Record<string, unknown>)?.name as string || (r.author as string) || '',
                    rating: (r.rating as number) || 0,
                    text: (r.snippet as string) || (r.text as string) || '',
                }));

            return NextResponse.json({
                success: true,
                data: {
                    hasProfile: true,
                    name: (profile.title as string) || cleanDomain,
                    rating: (profile.rating as number) || 0,
                    reviewCount: (profile.reviews_count as number) || (profile.reviews as unknown[])?.length || 0,
                    category: (profile.type as string) || (profile.category as string) || '',
                    address: (profile.address as string) || '',
                    phone: (profile.phone as string) || '',
                    website: (profile.website as string) || `https://${cleanDomain}`,
                    reviews,
                },
            });
        } catch {
            return NextResponse.json({
                success: true,
                data: { hasProfile: false },
            });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch business data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
