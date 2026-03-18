import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { parseDomain } from '@/lib/utils';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export interface PageSpeedData {
    url: string;
    strategy: 'mobile' | 'desktop';
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
    coreWebVitals: {
        lcp: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
        fid: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
        cls: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
        fcp: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
        ttfb: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
        tbt: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
        si: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
    };
    opportunities: { title: string; description: string; savings?: string }[];
    diagnostics: { title: string; description: string; score: number | null }[];
    screenshot?: string;
}

type Rating = 'good' | 'needs-improvement' | 'poor';

function lcpRating(ms: number): Rating {
    if (ms <= 2500) return 'good';
    if (ms <= 4000) return 'needs-improvement';
    return 'poor';
}

function clsRating(score: number): Rating {
    if (score <= 0.1) return 'good';
    if (score <= 0.25) return 'needs-improvement';
    return 'poor';
}

function fcpRating(ms: number): Rating {
    if (ms <= 1800) return 'good';
    if (ms <= 3000) return 'needs-improvement';
    return 'poor';
}

function ttfbRating(ms: number): Rating {
    if (ms <= 800) return 'good';
    if (ms <= 1800) return 'needs-improvement';
    return 'poor';
}

function tbtRating(ms: number): Rating {
    if (ms <= 200) return 'good';
    if (ms <= 600) return 'needs-improvement';
    return 'poor';
}

function siRating(ms: number): Rating {
    if (ms <= 3400) return 'good';
    if (ms <= 5800) return 'needs-improvement';
    return 'poor';
}

export async function POST(req: NextRequest) {
    try {
        const { domain, strategy = 'mobile' } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const cleanDomain = parseDomain(domain);
        const url = `https://${cleanDomain}`;
        const cacheKey = cache.generateKey(`pagespeed-${strategy}`, cleanDomain);

        // Check cache
        if (cache.has(cacheKey)) {
            return NextResponse.json({ success: true, data: cache.get(cacheKey), cached: true });
        }

        if (!GOOGLE_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'GOOGLE_API_KEY not configured' },
                { status: 400 }
            );
        }

        const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
        apiUrl.searchParams.set('url', url);
        apiUrl.searchParams.set('strategy', strategy);
        apiUrl.searchParams.set('key', GOOGLE_API_KEY);
        apiUrl.searchParams.set('category', 'performance');
        apiUrl.searchParams.set('category', 'accessibility');
        apiUrl.searchParams.set('category', 'best-practices');
        apiUrl.searchParams.set('category', 'seo');

        // PageSpeed takes multiple categories, use append
        const finalUrl = `${apiUrl.origin}${apiUrl.pathname}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${GOOGLE_API_KEY}&category=performance&category=accessibility&category=best-practices&category=seo`;

        const res = await fetch(finalUrl, { signal: AbortSignal.timeout(60000) });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ success: false, error: `PageSpeed API error: ${errText}` }, { status: res.status });
        }

        const raw = await res.json();
        const cats = raw.lighthouseResult?.categories ?? {};
        const audits = raw.lighthouseResult?.audits ?? {};

        const score = (cat: string) => Math.round((cats[cat]?.score ?? 0) * 100);
        const numericValue = (id: string): number => audits[id]?.numericValue ?? 0;

        const lcpMs = numericValue('largest-contentful-paint');
        const clsVal = numericValue('cumulative-layout-shift');
        const fcpMs = numericValue('first-contentful-paint');
        const ttfbMs = numericValue('server-response-time');
        const tbtMs = numericValue('total-blocking-time');
        const siMs = numericValue('speed-index');

        // Opportunities (audits with savings)
        const opportunities = Object.values(audits as Record<string, {
            score: number | null;
            details?: { type: string };
            title: string;
            description: string;
            displayValue?: string;
        }>)
            .filter((a) => a.score !== null && a.score < 0.9 && a.details?.type === 'opportunity')
            .slice(0, 8)
            .map((a) => ({
                title: a.title,
                description: a.description,
                savings: a.displayValue,
            }));

        // Diagnostics
        const diagnostics = Object.values(audits as Record<string, {
            score: number | null;
            details?: { type: string };
            title: string;
            description: string;
        }>)
            .filter((a) => a.score !== null && a.score < 0.9 && a.details?.type === 'table')
            .slice(0, 6)
            .map((a) => ({
                title: a.title,
                description: a.description,
                score: a.score,
            }));

        // Screenshot
        const screenshot = raw.lighthouseResult?.audits?.['final-screenshot']?.details?.data as string | undefined;

        const data: PageSpeedData = {
            url,
            strategy: strategy as 'mobile' | 'desktop',
            performanceScore: score('performance'),
            accessibilityScore: score('accessibility'),
            bestPracticesScore: score('best-practices'),
            seoScore: score('seo'),
            coreWebVitals: {
                lcp: { value: Math.round(lcpMs), unit: 'ms', rating: lcpRating(lcpMs) },
                fid: { value: 0, unit: 'ms', rating: 'good' }, // FID requires field data
                cls: { value: parseFloat(clsVal.toFixed(3)), unit: '', rating: clsRating(clsVal) },
                fcp: { value: Math.round(fcpMs), unit: 'ms', rating: fcpRating(fcpMs) },
                ttfb: { value: Math.round(ttfbMs), unit: 'ms', rating: ttfbRating(ttfbMs) },
                tbt: { value: Math.round(tbtMs), unit: 'ms', rating: tbtRating(tbtMs) },
                si: { value: Math.round(siMs), unit: 'ms', rating: siRating(siMs) },
            },
            opportunities,
            diagnostics,
            screenshot,
        };

        cache.set(cacheKey, data);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'PageSpeed analysis failed';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
