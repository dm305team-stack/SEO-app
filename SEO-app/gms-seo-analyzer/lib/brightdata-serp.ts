const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const SERP_ZONE = 'serp_api1';
const API_URL = 'https://api.brightdata.com/request';

export interface SerpSearchOptions {
    keyword: string;
    country?: string;      // e.g. 'us', 'mx', 'es'
    language?: string;      // e.g. 'en', 'es'
    device?: 'desktop' | 'mobile';
    numResults?: number;    // default 10
}

export interface SerpOrganicResult {
    position: number;
    title: string;
    url: string;
    displayUrl: string;
    description: string;
    domain: string;
}

export interface SerpAdResult {
    position: number;
    title: string;
    url: string;
    description: string;
    domain: string;
}

export interface SerpPeopleAlsoAsk {
    question: string;
}

export interface SerpRelatedSearch {
    query: string;
}

export interface SerpFeaturedSnippet {
    title: string;
    url: string;
    description: string;
}

export interface SerpSearchResult {
    keyword: string;
    country: string;
    language: string;
    device: string;
    totalResults: string;
    organic: SerpOrganicResult[];
    ads: SerpAdResult[];
    peopleAlsoAsk: SerpPeopleAlsoAsk[];
    relatedSearches: SerpRelatedSearch[];
    featuredSnippet?: SerpFeaturedSnippet;
    knowledgePanel?: {
        title: string;
        description: string;
        type: string;
    };
    searchTime: number;
}

function buildGoogleSearchUrl(options: SerpSearchOptions): string {
    const params = new URLSearchParams();
    params.set('q', options.keyword);
    if (options.numResults) params.set('num', String(options.numResults));
    if (options.language) params.set('hl', options.language);
    if (options.country) params.set('gl', options.country);
    return `https://www.google.com/search?${params.toString()}`;
}

/**
 * Search Google via Bright Data SERP API and get parsed results
 */
export async function searchSerp(options: SerpSearchOptions): Promise<SerpSearchResult> {
    if (!BRIGHTDATA_API_KEY) {
        throw new Error('BRIGHTDATA_API_KEY is not configured');
    }

    const searchUrl = buildGoogleSearchUrl(options);
    const startTime = Date.now();

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify({
            zone: SERP_ZONE,
            url: searchUrl,
            format: 'json',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SERP API responded with ${response.status}: ${errorText}`);
    }

    const searchTime = Date.now() - startTime;
    const rawData = await response.json();

    // Parse the Bright Data SERP JSON response
    return parseSerpResponse(rawData, options, searchTime);
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseSerpResponse(rawData: any, options: SerpSearchOptions, searchTime: number): SerpSearchResult {
    // Bright Data wraps results in: { status_code, headers, body: "<JSON string>" }
    // The body is a JSON-encoded string that contains the actual SERP data
    let data: any;

    if (rawData.body && typeof rawData.body === 'string') {
        try {
            data = JSON.parse(rawData.body);
        } catch {
            data = rawData;
        }
    } else if (rawData.body && typeof rawData.body === 'object') {
        data = rawData.body;
    } else {
        data = rawData;
    }

    const organic: SerpOrganicResult[] = [];
    const ads: SerpAdResult[] = [];
    const peopleAlsoAsk: SerpPeopleAlsoAsk[] = [];
    const relatedSearches: SerpRelatedSearch[] = [];
    let featuredSnippet: SerpFeaturedSnippet | undefined;
    let knowledgePanel: { title: string; description: string; type: string } | undefined;

    // General info
    const general = data.general || {};
    const totalResults = general.results_cnt ? String(general.results_cnt) : '';

    // Organic results — Bright Data uses: link, source, display_link, title, description, rank
    const organicList = data.organic || [];
    if (Array.isArray(organicList)) {
        organicList.forEach((item: any, idx: number) => {
            organic.push({
                position: item.rank || item.position || idx + 1,
                title: item.title || '',
                url: item.link || item.url || '',
                displayUrl: item.display_link || item.displayed_url || item.link || '',
                description: item.description || item.snippet || '',
                domain: item.source || extractDomain(item.link || item.url || ''),
            });
        });
    }

    // Ads
    const adsList = data.ads || data.paid || [];
    if (Array.isArray(adsList)) {
        adsList.forEach((item: any, idx: number) => {
            ads.push({
                position: item.rank || item.position || idx + 1,
                title: item.title || '',
                url: item.link || item.url || '',
                description: item.description || item.snippet || '',
                domain: item.source || extractDomain(item.link || item.url || ''),
            });
        });
    }

    // People Also Ask
    const paa = data.people_also_ask || data.related_questions || [];
    if (Array.isArray(paa)) {
        paa.forEach((item: any) => {
            const q = typeof item === 'string' ? item : (item.question || item.title || '');
            if (q) peopleAlsoAsk.push({ question: q });
        });
    }

    // Related Searches
    const related = data.related || data.related_searches || [];
    if (Array.isArray(related)) {
        related.forEach((item: any) => {
            const q = typeof item === 'string' ? item : (item.query || item.title || item.text || '');
            if (q) relatedSearches.push({ query: q });
        });
    }

    // Featured Snippet / Overview
    const fs = data.featured_snippet || data.answer_box || data.overview;
    if (fs) {
        featuredSnippet = {
            title: fs.title || '',
            url: fs.link || fs.url || '',
            description: fs.description || fs.snippet || fs.answer || fs.text || '',
        };
    }

    // Knowledge Panel
    const kp = data.knowledge || data.knowledge_panel || data.knowledge_graph;
    if (kp) {
        knowledgePanel = {
            title: kp.title || '',
            description: kp.description || kp.subtitle || '',
            type: kp.type || kp.entity_type || '',
        };
    }

    return {
        keyword: options.keyword,
        country: general.country_code?.toLowerCase() || options.country || 'us',
        language: general.language || options.language || 'en',
        device: general.mobile ? 'mobile' : (options.device || 'desktop'),
        totalResults,
        organic,
        ads,
        peopleAlsoAsk,
        relatedSearches,
        featuredSnippet,
        knowledgePanel,
        searchTime,
    };
}
