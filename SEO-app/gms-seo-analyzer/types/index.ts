// ============================================
// TypeScript interfaces for the SEO Analyzer App
// ============================================

// ---- Generic API Response ----
export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error?: string;
    cached?: boolean;
    timestamp?: string;
}

// ---- Bright Data Module Types ----
export type BrightDataModuleName =
    | 'serp-api'
    | 'browser-api'
    | 'unlocker-api'
    | 'crawl-api'
    | 'web-scraper-api'
    | 'deep-lookup'
    | 'web-archive'
    | 'local-business';

export type BrightDataModuleStatus = 'idle' | 'loading' | 'success' | 'error' | 'coming-soon';

export interface BrowserApiData {
    url: string;
    finalUrl: string;
    statusCode: number;
    title: string;
    metaDescription: string;
    metas: { name: string; content: string }[];
    headings: { level: number; text: string }[];
    links: { href: string; text: string; isExternal: boolean }[];
    internalLinks: number;
    externalLinks: number;
    wordCount: number;
    loadTimeMs: number;
    screenshot?: string;
    htmlSize: number;
    canonicalUrl?: string;
    ogTags: { name: string; content: string }[];
    hreflangTags: { lang: string; href: string }[];
    schemaMarkup: string[];
    performance: {
        domContentLoaded: number;
        loadComplete: number;
    };
    zone: string;
}

// ---- Domain Input ----
export interface DomainInput {
    id: string;
    value: string;
}

// ---- Module Loading State ----
export type ModuleStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ModuleState {
    status: ModuleStatus;
    data: unknown;
    error?: string;
}

export type ModuleName =
    | 'serp'
    | 'keywords'
    | 'domain-analytics'
    | 'labs'
    | 'backlinks'
    | 'on-page'
    | 'content'
    | 'merchant'
    | 'app-data'
    | 'business'
    | 'appendix'
    | 'ai-optimization'
    | 'trends';

export type ModulesState = Record<ModuleName, ModuleState>;

// ---- SERP Data ----
export interface SerpResult {
    position: number;
    title: string;
    url: string;
    snippet: string;
    breadcrumb?: string;
}

export interface SerpFeature {
    type: string;
    present: boolean;
}

export interface SerpData {
    results: SerpResult[];
    features: SerpFeature[];
    totalResults?: number;
    keyword?: string;
}

// ---- Keywords Data ----
export interface KeywordData {
    keyword: string;
    searchVolume: number;
    cpc: number;
    competition: number;
    competitionLevel: string;
    keywordDifficulty?: number;
    position?: number;
    trafficShare?: number;
}

export interface KeywordsData {
    keywords: KeywordData[];
    totalKeywords: number;
    avgDifficulty?: number;
    topKeywords?: KeywordData[];
}

// ---- Domain Analytics ----
export interface DomainAnalyticsData {
    domainRank: number;
    organicTraffic: number;
    paidTraffic: number;
    organicKeywords: number;
    paidKeywords: number;
    backlinks: number;
    referringDomains: number;
    authorityScore?: number;
    trafficTrend?: { date: string; traffic: number }[];
}

// ---- Labs Data ----
export interface CompetitorData {
    domain: string;
    commonKeywords: number;
    organicTraffic: number;
    organicKeywords: number;
    rank: number;
}

export interface LabsData {
    estimatedTraffic: number;
    competitors: CompetitorData[];
    trafficBreakdown?: { source: string; value: number }[];
}

// ---- Backlinks ----
export interface BacklinksSummary {
    totalBacklinks: number;
    referringDomains: number;
    domainRank: number;
    dofollow: number;
    nofollow: number;
    topAnchors: { anchor: string; count: number }[];
    topReferringDomains: { domain: string; backlinks: number; rank: number }[];
}

// ---- On-Page SEO ----
export interface OnPageIssue {
    type: string;
    severity: 'critical' | 'warning' | 'notice';
    count: number;
    description: string;
}

export interface OnPageData {
    totalPages: number;
    crawledPages: number;
    issues: OnPageIssue[];
    onPageScore: number;
    criticalCount: number;
    warningCount: number;
    noticeCount: number;
    pages?: {
        url: string;
        statusCode: number;
        title: string;
        score: number;
    }[];
}

// ---- Content Analysis ----
export interface ContentData {
    contentScore?: number;
    totalContent: number;
    duplicateWarnings: number;
    readabilityScore?: number;
    topContent: {
        url: string;
        title: string;
        score?: number;
        wordCount?: number;
    }[];
    sentiment?: {
        positive: number;
        neutral: number;
        negative: number;
    };
}

// ---- Merchant (E-Commerce) ----
export interface MerchantData {
    hasPresence: boolean;
    products: {
        title: string;
        price?: string;
        seller?: string;
        url?: string;
    }[];
}

// ---- App Data ----
export interface AppData {
    hasApp: boolean;
    apps: {
        title: string;
        rating?: number;
        reviews?: number;
        installs?: string;
        url?: string;
    }[];
}

// ---- Business Data ----
export interface BusinessData {
    hasProfile: boolean;
    name?: string;
    rating?: number;
    reviewCount?: number;
    address?: string;
    phone?: string;
    website?: string;
    category?: string;
    reviews?: {
        author: string;
        rating: number;
        text: string;
        date?: string;
    }[];
}

// ---- Appendix ----
export interface AppendixData {
    totalApiCalls: number;
    responseTimes: { module: string; timeMs: number }[];
    dataTimestamps: { module: string; timestamp: string }[];
    rawData: Record<string, unknown>;
}

// ---- AI Optimization ----
export interface AiOptimizationData {
    keywordSuggestions: {
        keyword: string;
        searchVolume: number;
        difficulty?: number;
        relevance?: number;
    }[];
    sentimentAnalysis?: {
        overall: string;
        score: number;
        breakdown: { aspect: string; sentiment: string; score: number }[];
    };
    optimizationTips: string[];
}

// ---- Google Trends ----
export interface TrendPoint {
    date: string;
    value: number;
}

export interface TrendQuery {
    query: string;
    value: number;
    rising?: boolean;
}

export interface TrendRegion {
    region: string;
    value: number;
    geoCode?: string;
}

export interface TrendsData {
    keyword: string;
    interestOverTime: TrendPoint[];
    interestByRegion: TrendRegion[];
    relatedQueries: TrendQuery[];
    risingQueries: TrendQuery[];
    relatedTopics: TrendQuery[];
    averageInterest: number;
    peakInterest: { date: string; value: number };
    trendDirection: 'rising' | 'stable' | 'declining';
}

// ---- Local Business (Google My Business) ----
export interface LocalBusinessHours {
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

export interface LocalBusinessPhoto {
    url: string;
    width?: number;
    height?: number;
}

export interface LocalBusinessReview {
    author: string;
    rating: number;
    text: string;
    date: string;
    profilePhoto?: string;
}

export interface LocalBusinessMetrics {
    viewsSearch: number;
    viewsMaps: number;
    actionsWebsite: number;
    actionsPhone: number;
    actionsDirections: number;
    searchKeywords: { keyword: string; impressions: number }[];
    periodDays: number;
}

export interface LocalBusinessData {
    placeId: string;
    name: string;
    address: string;
    phone?: string;
    website?: string;
    rating: number;
    reviewCount: number;
    categories: string[];
    hours: LocalBusinessHours[];
    photos: LocalBusinessPhoto[];
    reviews: LocalBusinessReview[];
    isOpen?: boolean;
    priceLevel?: number;
    coordinates?: { lat: number; lng: number };
    metrics?: LocalBusinessMetrics;
    metricsError?: string;
}

// ---- Web Scraper API ----
export interface WebScraperItem {
    url: string;
    [key: string]: unknown;
}

export interface WebScraperResult {
    mode: 'sync' | 'async';
    snapshotId?: string;
    status: 'ready' | 'running' | 'failed';
    data?: Record<string, unknown>[];
    error?: string;
}

// ---- Deep Lookup ----
export interface DeepLookupPreview {
    id: string;
    status: 'pending' | 'ready' | 'failed';
    estimatedRecords?: number;
    estimatedCost?: number;
    data?: Record<string, unknown>[];
}

export interface DeepLookupRequest {
    id: string;
    status: 'pending' | 'running' | 'ready' | 'failed';
    data?: Record<string, unknown>[];
}

export interface DeepLookupResult {
    preview?: DeepLookupPreview;
    request?: DeepLookupRequest;
}

// ---- Web Archive ----
export interface WebArchiveSnapshot {
    timestamp: string;
    url: string;
    status_code?: number;
    content_type?: string;
    [key: string]: unknown;
}

export interface WebArchiveResult {
    searchId: string;
    status: 'pending' | 'running' | 'ready' | 'failed' | 'delivered';
    url?: string;
    results?: WebArchiveSnapshot[];
    totalSnapshots?: number;
    error?: string;
}

// ---- AI Report ----
export interface AiReportData {
    report: string;
    sections: {
        title: string;
        content: string;
    }[];
}

// ---- Aggregated Analysis Data (for a single domain) ----
export interface AnalysisData {
    domain: string;
    serp: SerpData | null;
    keywords: KeywordsData | null;
    domainAnalytics: DomainAnalyticsData | null;
    labs: LabsData | null;
    backlinks: BacklinksSummary | null;
    onPage: OnPageData | null;
    content: ContentData | null;
    merchant: MerchantData | null;
    appData: AppData | null;
    business: BusinessData | null;
    appendix: AppendixData | null;
    aiOptimization: AiOptimizationData | null;
    trends: TrendsData | null;
    aiReport: AiReportData | null;
}

// ---- Comparison Dimensions (for radar chart) ----
export interface ComparisonDimensions {
    domainAuthority: number;
    organicTraffic: number;
    backlinkProfile: number;
    onPageScore: number;
    contentScore: number;
    technicalHealth: number;
}

export interface DomainComparison {
    domain: string;
    dimensions: ComparisonDimensions;
    analysisData: AnalysisData;
}

// ---- Status Types ----
export type SeverityLevel = 'good' | 'warning' | 'critical';

export function getSeverityLevel(score: number, thresholds: { good: number; warning: number }): SeverityLevel {
    if (score >= thresholds.good) return 'good';
    if (score >= thresholds.warning) return 'warning';
    return 'critical';
}

export function getSeverityColor(severity: SeverityLevel): string {
    switch (severity) {
        case 'good': return '#10B981';
        case 'warning': return '#F59E0B';
        case 'critical': return '#EF4444';
    }
}

export function getSeverityLabel(severity: SeverityLevel): string {
    switch (severity) {
        case 'good': return 'Good';
        case 'warning': return 'Needs Work';
        case 'critical': return 'Critical';
    }
}
