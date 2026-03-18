// ============================================
// Utility Functions
// ============================================

/**
 * Validates and normalizes a domain input.
 * Strips protocols and trailing slashes.
 */
export function parseDomain(input: string): string {
    let domain = input.trim().toLowerCase();
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
    domain = domain.replace(/\/+$/, '');
    domain = domain.split('/')[0]; // take only the host part
    return domain;
}

/**
 * Validates that a string is a valid domain.
 */
export function isValidDomain(input: string): boolean {
    const domain = parseDomain(input);
    const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    return pattern.test(domain);
}

/**
 * Format large numbers with abbreviations (1.2K, 3.4M, etc.)
 */
export function formatNumber(num: number | undefined | null): string {
    if (num === undefined || num === null) return '0';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
}

/**
 * Format a number as a percentage
 */
export function formatPercent(num: number | undefined | null): string {
    if (num === undefined || num === null) return '0%';
    return num.toFixed(1) + '%';
}

/**
 * Format currency
 */
export function formatCurrency(num: number | undefined | null): string {
    if (num === undefined || num === null) return '$0.00';
    return '$' + num.toFixed(2);
}

/**
 * Get a human-readable label for each module
 */
export function getModuleLabel(module: string): string {
    const labels: Record<string, string> = {
        serp: 'SERP Data',
        keywords: 'Keywords Data',
        'domain-analytics': 'Domain Analytics',
        labs: 'DataForSEO Labs',
        backlinks: 'Backlinks',
        'on-page': 'On-Page SEO',
        content: 'Content Analysis',
        merchant: 'Merchant (E-Commerce)',
        'app-data': 'App Data',
        business: 'Business Data',
        appendix: 'Technical Appendix',
        'ai-optimization': 'AI Optimization',
        trends: 'Google Trends',
    };
    return labels[module] || module;
}

/**
 * Get the loading message for each module
 */
export function getModuleLoadingMessage(module: string): string {
    const messages: Record<string, string> = {
        serp: 'Fetching SERP data…',
        keywords: 'Analyzing keyword rankings…',
        'domain-analytics': 'Pulling domain analytics…',
        labs: 'Running traffic estimation…',
        backlinks: 'Analyzing backlink profile…',
        'on-page': 'Crawling on-page elements…',
        content: 'Evaluating content quality…',
        merchant: 'Checking merchant presence…',
        'app-data': 'Looking up app data…',
        business: 'Fetching business data…',
        appendix: 'Compiling technical data…',
        'ai-optimization': 'Running AI optimization analysis…',
        trends: 'Analyzing Google Trends data…',
    };
    return messages[module] || 'Loading data…';
}

/**
 * Sleep utility for polling
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Classnames utility (simplified clsx)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '…';
}

/**
 * Get color class based on score
 */
export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
}

/**
 * Get background color class based on score
 */
export function getScoreBgColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500/10';
    if (score >= 50) return 'bg-amber-500/10';
    return 'bg-red-500/10';
}
