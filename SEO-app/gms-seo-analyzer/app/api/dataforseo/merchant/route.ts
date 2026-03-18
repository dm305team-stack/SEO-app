import { NextRequest, NextResponse } from 'next/server';
import { serpApiRequest } from '@/lib/serpapi';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';
import { isDemoMode } from '@/lib/demoMode';
import { getMockMerchantData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);

        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockMerchantData(), demo: true });
        }

        const cacheKey = cache.generateKey('merchant', cleanDomain);

        try {
            // Use SerpApi Google Shopping engine
            const data = await serpApiRequest(
                {
                    engine: 'google_shopping',
                    q: cleanDomain,
                    hl: 'en',
                    gl: 'us',
                },
                cacheKey
            );

            const rawData = data as Record<string, unknown>;
            const shoppingResults = (rawData.shopping_results as Record<string, unknown>[]) || [];

            if (shoppingResults.length === 0) {
                return NextResponse.json({
                    success: true,
                    data: { hasPresence: false, products: [] },
                });
            }

            const products = shoppingResults.slice(0, 10).map((item: Record<string, unknown>) => ({
                title: (item.title as string) || '',
                price: (item.price as string) || (item.extracted_price as number)?.toString() || '',
                source: (item.source as string) || '',
                link: (item.link as string) || '',
                thumbnail: (item.thumbnail as string) || '',
                rating: (item.rating as number) || 0,
                reviews: (item.reviews as number) || 0,
            }));

            return NextResponse.json({
                success: true,
                data: {
                    hasPresence: true,
                    totalProducts: shoppingResults.length,
                    products,
                },
            });
        } catch {
            return NextResponse.json({
                success: true,
                data: { hasPresence: false, products: [] },
            });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch merchant data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
