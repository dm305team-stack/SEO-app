'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CrawlSnapshotResult, CrawlPageData } from '@/lib/brightdata-crawl';

interface CrawlApiSectionProps {
    data: CrawlSnapshotResult | null;
    loading: boolean;
    error?: string;
    onTrigger: (urls: string[]) => void;
    onPollSnapshot: (snapshotId: string) => void;
    snapshotId?: string;
}

export default function CrawlApiSection({ data, loading, error, onTrigger, onPollSnapshot, snapshotId }: CrawlApiSectionProps) {
    const [urlsInput, setUrlsInput] = useState('');
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-poll while status is 'running'
    useEffect(() => {
        if (data?.status === 'running' && snapshotId) {
            pollRef.current = setInterval(() => {
                onPollSnapshot(snapshotId);
            }, 5000); // Poll every 5 seconds
        }

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [data?.status, snapshotId, onPollSnapshot]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!urlsInput.trim()) return;
        const urls = urlsInput
            .split('\n')
            .map((u) => u.trim())
            .filter(Boolean)
            .map((u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`));
        if (urls.length > 0) onTrigger(urls);
    }, [urlsInput, onTrigger]);

    return (
        <section id="crawl-api" className="space-y-6">
            {/* Header */}
            <div className="section-heading">
                <div className="icon">🕷️</div>
                <div>
                    <h2 className="text-xl font-bold text-white">Crawl API</h2>
                    <p className="text-sm text-slate-400 font-normal">
                        Large-scale URL crawling for SEO datasets
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            URLs to crawl <span className="text-slate-500">(one per line)</span>
                        </label>
                        <textarea
                            value={urlsInput}
                            onChange={(e) => setUrlsInput(e.target.value)}
                            placeholder={"https://example.com\nhttps://example.com/about\nhttps://example.com/blog"}
                            rows={4}
                            className="input-field resize-none font-mono text-sm"
                            disabled={loading || data?.status === 'running'}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !urlsInput.trim() || data?.status === 'running'}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || data?.status === 'running' ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {data?.status === 'running' ? 'Crawling… (auto-polling)' : 'Starting crawl…'}
                            </>
                        ) : (
                            <>🕷️ Start Crawl</>
                        )}
                    </button>
                </form>
            </div>

            {/* Snapshot Status */}
            {snapshotId && data?.status === 'running' && (
                <div className="glass-card p-4 border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                    <div>
                        <p className="text-amber-400 font-medium text-sm">Crawl in progress</p>
                        <p className="text-amber-300/60 text-xs mt-0.5">
                            Snapshot ID: <code className="bg-navy-900/50 px-1.5 py-0.5 rounded">{snapshotId}</code>
                            <span className="ml-2">— polling every 5s…</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
                    <div className="flex items-start gap-3">
                        <span className="text-red-400 text-xl">⚠️</span>
                        <div>
                            <p className="text-red-400 font-medium text-sm">Crawl Error</p>
                            <p className="text-red-300/70 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {data?.status === 'ready' && data.data && data.data.length > 0 && (
                <div className="space-y-6 animate-fade-in">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">Pages Crawled</p>
                            <p className="text-xl font-bold text-emerald-400">{data.data.length}</p>
                        </div>
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">Snapshot ID</p>
                            <p className="text-sm font-mono text-electric-400 truncate">{data.snapshotId}</p>
                        </div>
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">Status</p>
                            <p className="text-xl font-bold text-emerald-400">✓ Ready</p>
                        </div>
                    </div>

                    {/* Per-page results */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            📊 Crawl Results
                        </h3>
                        {data.data.map((page, i) => (
                            <CrawlPageCard key={i} page={page} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Ready but empty */}
            {data?.status === 'ready' && (!data.data || data.data.length === 0) && (
                <div className="glass-card p-8 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-slate-400 text-sm">Crawl completed but returned no results.</p>
                </div>
            )}

            {/* Empty state */}
            {!data && !loading && !error && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🕷️</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Crawl API</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Submit multiple URLs to crawl at scale. Results include page metadata, content metrics, and SEO data extracted from each page.
                    </p>
                </div>
            )}
        </section>
    );
}

function CrawlPageCard({ page, index }: { page: CrawlPageData; index: number }) {
    const [expanded, setExpanded] = useState(false);

    // Extract known keys vs extra keys
    const knownKeys = ['url', 'title', 'description', 'status_code', 'content_type', 'word_count', 'links_count', 'images_count', 'load_time'];
    const extraKeys = Object.keys(page).filter(
        (k) => !knownKeys.includes(k) && page[k] !== undefined && page[k] !== null && page[k] !== ''
    );

    return (
        <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-electric-400 bg-electric/10 px-2 py-0.5 rounded">#{index + 1}</span>
                        {page.status_code && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${page.status_code === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {page.status_code}
                            </span>
                        )}
                    </div>
                    <h4 className="text-white font-medium text-sm truncate">{page.title || page.url}</h4>
                    <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-xs text-electric-400 hover:underline truncate block">
                        {page.url}
                    </a>
                    {page.description && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{page.description}</p>
                    )}
                </div>
            </div>

            {/* Metrics row */}
            <div className="flex gap-4 mt-3 text-xs text-slate-500">
                {page.word_count && <span>📝 {page.word_count.toLocaleString()} words</span>}
                {page.links_count && <span>🔗 {page.links_count} links</span>}
                {page.images_count && <span>🖼️ {page.images_count} images</span>}
                {page.load_time && <span>⚡ {page.load_time}ms</span>}
            </div>

            {/* Expandable raw data */}
            {extraKeys.length > 0 && (
                <div className="mt-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-electric-400 hover:underline"
                    >
                        {expanded ? '▼ Hide' : '▶ Show'} {extraKeys.length} additional fields
                    </button>
                    {expanded && (
                        <div className="mt-2 bg-navy-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                            {extraKeys.map((key) => (
                                <div key={key} className="flex gap-2 py-0.5 text-xs">
                                    <span className="text-slate-500 font-mono shrink-0">{key}:</span>
                                    <span className="text-slate-300 truncate">
                                        {typeof page[key] === 'object' ? JSON.stringify(page[key]) : String(page[key])}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
