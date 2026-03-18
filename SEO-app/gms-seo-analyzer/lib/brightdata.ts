import puppeteer, { type Browser, type Page } from 'puppeteer-core';

const SCRAPING_BROWSER_WSS = process.env.BRIGHTDATA_SCRAPING_BROWSER_WSS || '';
const BROWSER_WSS = process.env.BRIGHTDATA_BROWSER_WSS || '';

export interface PageAnalysisOptions {
    url: string;
    country?: string;
    city?: string;
    device?: 'desktop' | 'mobile';
    timeout?: number;
    zone?: 'scraping' | 'seo-geo';
}

export interface ExtractedMeta {
    name: string;
    content: string;
}

export interface ExtractedHeading {
    level: number;
    text: string;
}

export interface ExtractedLink {
    href: string;
    text: string;
    isExternal: boolean;
}

export interface PageAnalysisResult {
    url: string;
    finalUrl: string;
    statusCode: number;
    title: string;
    metaDescription: string;
    metas: ExtractedMeta[];
    headings: ExtractedHeading[];
    links: ExtractedLink[];
    internalLinks: number;
    externalLinks: number;
    wordCount: number;
    loadTimeMs: number;
    screenshot?: string; // base64 PNG
    htmlSize: number;
    canonicalUrl?: string;
    ogTags: ExtractedMeta[];
    hreflangTags: { lang: string; href: string }[];
    schemaMarkup: string[];
    performance: {
        domContentLoaded: number;
        loadComplete: number;
    };
    zone: string;
}

/**
 * Connect to Bright Data Scraping Browser via CDP WebSocket.
 * Tries scraping_browse zone first, falls back to seo_geo zone.
 */
async function connectBrowser(preferredZone?: 'scraping' | 'seo-geo'): Promise<{ browser: Browser; zone: string }> {
    const endpoints = preferredZone === 'seo-geo'
        ? [
            { wss: BROWSER_WSS, zone: 'seo-geo' },
            { wss: SCRAPING_BROWSER_WSS, zone: 'scraping' },
        ]
        : [
            { wss: SCRAPING_BROWSER_WSS, zone: 'scraping' },
            { wss: BROWSER_WSS, zone: 'seo-geo' },
        ];

    for (const ep of endpoints) {
        if (!ep.wss) continue;
        try {
            const browser = await puppeteer.connect({
                browserWSEndpoint: ep.wss,
            });
            return { browser, zone: ep.zone };
        } catch (err) {
            console.warn(`Failed to connect to zone "${ep.zone}":`, err instanceof Error ? err.message : err);
        }
    }

    throw new Error('No Bright Data browser endpoints are configured or reachable');
}

/**
 * Analyze a page using Bright Data's Scraping Browser.
 * Connects via CDP, navigates to the URL, and extracts SEO-relevant data.
 */
export async function analyzePage(options: PageAnalysisOptions): Promise<PageAnalysisResult> {
    const { url, device = 'desktop', timeout = 30000, zone: preferredZone } = options;
    let browser: Browser | null = null;
    let usedZone = 'unknown';

    try {
        const connection = await connectBrowser(preferredZone);
        browser = connection.browser;
        usedZone = connection.zone;
        const page: Page = await browser.newPage();

        // Set viewport based on device
        if (device === 'mobile') {
            await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 3 });
            await page.setUserAgent(
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            );
        } else {
            await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
        }

        // Navigate and measure performance
        const startTime = Date.now();

        const response = await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout,
        });

        const loadTimeMs = Date.now() - startTime;
        const statusCode = response?.status() || 0;
        const finalUrl = page.url();

        // Get performance metrics
        const performanceMetrics = await page.evaluate(() => {
            const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return {
                domContentLoaded: Math.round(perf?.domContentLoadedEventEnd || 0),
                loadComplete: Math.round(perf?.loadEventEnd || 0),
            };
        });

        // Extract all SEO data in one evaluate call for efficiency
        const seoData = await page.evaluate(() => {
            // Title
            const title = document.title || '';

            // Meta description
            const metaDesc = document.querySelector('meta[name="description"]');
            const metaDescription = metaDesc?.getAttribute('content') || '';

            // All meta tags
            const metaElements = document.querySelectorAll('meta[name], meta[property]');
            const metas: { name: string; content: string }[] = [];
            metaElements.forEach((el) => {
                const name = el.getAttribute('name') || el.getAttribute('property') || '';
                const content = el.getAttribute('content') || '';
                if (name && content) metas.push({ name, content });
            });

            // OG tags
            const ogElements = document.querySelectorAll('meta[property^="og:"]');
            const ogTags: { name: string; content: string }[] = [];
            ogElements.forEach((el) => {
                const name = el.getAttribute('property') || '';
                const content = el.getAttribute('content') || '';
                if (name && content) ogTags.push({ name, content });
            });

            // Headings
            const headings: { level: number; text: string }[] = [];
            for (let i = 1; i <= 6; i++) {
                document.querySelectorAll(`h${i}`).forEach((h) => {
                    const text = (h.textContent || '').trim();
                    if (text) headings.push({ level: i, text });
                });
            }

            // Links
            const linkElements = document.querySelectorAll('a[href]');
            const currentHost = window.location.hostname;
            const links: { href: string; text: string; isExternal: boolean }[] = [];
            linkElements.forEach((a) => {
                const href = a.getAttribute('href') || '';
                const text = (a.textContent || '').trim().slice(0, 100);
                try {
                    const linkUrl = new URL(href, window.location.href);
                    const isExternal = linkUrl.hostname !== currentHost;
                    links.push({ href: linkUrl.href, text, isExternal });
                } catch {
                    // relative or invalid URL
                    links.push({ href, text, isExternal: false });
                }
            });

            // Canonical
            const canonicalEl = document.querySelector('link[rel="canonical"]');
            const canonicalUrl = canonicalEl?.getAttribute('href') || undefined;

            // Hreflang
            const hreflangElements = document.querySelectorAll('link[rel="alternate"][hreflang]');
            const hreflangTags: { lang: string; href: string }[] = [];
            hreflangElements.forEach((el) => {
                const lang = el.getAttribute('hreflang') || '';
                const href = el.getAttribute('href') || '';
                if (lang && href) hreflangTags.push({ lang, href });
            });

            // Schema markup
            const schemaElements = document.querySelectorAll('script[type="application/ld+json"]');
            const schemaMarkup: string[] = [];
            schemaElements.forEach((el) => {
                const text = (el.textContent || '').trim();
                if (text) schemaMarkup.push(text);
            });

            // Word count
            const bodyText = document.body?.innerText || '';
            const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

            // HTML size
            const htmlSize = new Blob([document.documentElement.outerHTML]).size;

            return {
                title,
                metaDescription,
                metas,
                ogTags,
                headings,
                links,
                canonicalUrl,
                hreflangTags,
                schemaMarkup,
                wordCount,
                htmlSize,
            };
        });

        // Take screenshot
        const screenshotBuffer = await page.screenshot({
            type: 'png',
            fullPage: false,
            encoding: 'base64',
        });

        const internalLinks = seoData.links.filter((l) => !l.isExternal).length;
        const externalLinks = seoData.links.filter((l) => l.isExternal).length;

        await page.close();

        return {
            url,
            finalUrl,
            statusCode,
            title: seoData.title,
            metaDescription: seoData.metaDescription,
            metas: seoData.metas,
            headings: seoData.headings,
            links: seoData.links.slice(0, 100), // limit to first 100 links
            internalLinks,
            externalLinks,
            wordCount: seoData.wordCount,
            loadTimeMs,
            screenshot: screenshotBuffer as string,
            htmlSize: seoData.htmlSize,
            canonicalUrl: seoData.canonicalUrl,
            ogTags: seoData.ogTags,
            hreflangTags: seoData.hreflangTags,
            schemaMarkup: seoData.schemaMarkup,
            performance: performanceMetrics,
            zone: usedZone,
        };
    } catch (error) {
        throw new Error(`Browser API analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch {
                // ignore close errors
            }
        }
    }
}
