const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const UNLOCKER_ZONE = 'web_unlocker_feb';
const API_URL = 'https://api.brightdata.com/request';

export interface UnlockerOptions {
    url: string;
    country?: string;
    format?: 'raw' | 'json';
}

export interface UnlockerResult {
    url: string;
    statusCode: number;
    country: string;
    responseTime: number;
    contentType: string;
    contentLength: number;
    headers: Record<string, string>;
    // Extracted page data (when HTML)
    title?: string;
    metaDescription?: string;
    headings?: { level: number; text: string }[];
    links?: { href: string; text: string; isExternal: boolean }[];
    wordCount?: number;
    rawHtml?: string;
    rawText?: string;
    isHtml: boolean;
}

/**
 * Fetch a URL through Bright Data Web Unlocker — bypasses anti-bot, CAPTCHAs, etc.
 */
export async function unlockUrl(options: UnlockerOptions): Promise<UnlockerResult> {
    if (!BRIGHTDATA_API_KEY) {
        throw new Error('BRIGHTDATA_API_KEY is not configured');
    }

    const startTime = Date.now();

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify({
            zone: UNLOCKER_ZONE,
            url: options.url,
            country: options.country || undefined,
            format: 'raw',
        }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unlocker API responded with ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();
    const isHtml = contentType.includes('html') || rawText.trim().startsWith('<!') || rawText.trim().startsWith('<html');

    const result: UnlockerResult = {
        url: options.url,
        statusCode: response.status,
        country: options.country || 'auto',
        responseTime,
        contentType,
        contentLength: rawText.length,
        headers: Object.fromEntries(response.headers.entries()),
        isHtml,
        rawText: isHtml ? undefined : rawText.slice(0, 5000),
    };

    if (isHtml) {
        // Parse HTML to extract SEO data
        const parsed = parseHtml(rawText, options.url);
        result.title = parsed.title;
        result.metaDescription = parsed.metaDescription;
        result.headings = parsed.headings;
        result.links = parsed.links;
        result.wordCount = parsed.wordCount;
    }

    return result;
}

function parseHtml(html: string, baseUrl: string) {
    // Simple regex-based parser (runs on server, no DOM available)
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || '';

    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
        || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    const metaDescription = metaDescMatch?.[1]?.trim() || '';

    // Headings
    const headings: { level: number; text: string }[] = [];
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    let match;
    while ((match = headingRegex.exec(html)) !== null && headings.length < 50) {
        const text = match[2].replace(/<[^>]*>/g, '').trim();
        if (text) headings.push({ level: parseInt(match[1]), text: text.slice(0, 200) });
    }

    // Links
    const links: { href: string; text: string; isExternal: boolean }[] = [];
    const linkRegex = /<a\s[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let baseHost = '';
    try { baseHost = new URL(baseUrl).hostname; } catch { /* ignore */ }

    while ((match = linkRegex.exec(html)) !== null && links.length < 50) {
        const href = match[1];
        const text = match[2].replace(/<[^>]*>/g, '').trim().slice(0, 100);
        let isExternal = false;
        try {
            const linkUrl = new URL(href, baseUrl);
            isExternal = linkUrl.hostname !== baseHost;
        } catch { /* relative */ }
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            links.push({ href, text, isExternal });
        }
    }

    // Word count (strip all tags, count words)
    const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;

    return { title, metaDescription, headings, links, wordCount };
}
