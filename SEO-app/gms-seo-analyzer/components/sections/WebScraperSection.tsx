'use client';

import { useState, useEffect, useRef } from 'react';
import type { WebScraperResult } from '@/types';

interface WebScraperSectionProps {
    data: WebScraperResult | null;
    loading: boolean;
    error?: string;
    onScrape: (datasetId: string, items: { url: string }[], mode: 'sync' | 'async') => void;
    onPollSnapshot: (snapshotId: string) => void;
    snapshotId?: string;
}

export default function WebScraperSection({
    data, loading, error, onScrape, onPollSnapshot, snapshotId,
}: WebScraperSectionProps) {
    const [datasetId, setDatasetId] = useState('');
    const [urlsInput, setUrlsInput] = useState('');
    const [mode, setMode] = useState<'sync' | 'async'>('sync');
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-poll while status is 'running'
    useEffect(() => {
        if (data?.status === 'running' && snapshotId) {
            pollRef.current = setInterval(() => {
                onPollSnapshot(snapshotId);
            }, 5000);
        }
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [data?.status, snapshotId, onPollSnapshot]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!datasetId.trim() || !urlsInput.trim()) return;
        const items = urlsInput
            .split('\n')
            .map((u) => u.trim())
            .filter(Boolean)
            .map((u) => ({ url: /^https?:\/\//i.test(u) ? u : `https://${u}` }));
        if (items.length > 0) onScrape(datasetId.trim(), items, mode);
    };

    return (
        <section id="web-scraper-api" className="space-y-6">
            {/* Header */}
            <div className="section-heading">
                <div className="icon">📦</div>
                <div>
                    <h2 className="text-xl font-bold text-white">Web Scraper API</h2>
                    <p className="text-sm text-slate-400 font-normal">
                        Pre-built scrapers for structured data extraction
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Dataset ID <span className="text-slate-500">(from Bright Data scraper library)</span>
                        </label>
                        <input
                            type="text"
                            value={datasetId}
                            onChange={(e) => setDatasetId(e.target.value)}
                            placeholder="e.g., gd_abcdefgh12345678"
                            className="input-field font-mono text-sm"
                            disabled={loading || data?.status === 'running'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            URLs to scrape <span className="text-slate-500">(one per line)</span>
                        </label>
                        <textarea
                            value={urlsInput}
                            onChange={(e) => setUrlsInput(e.target.value)}
                            placeholder={"https://www.amazon.com/dp/B09V3KXJPB\nhttps://www.amazon.com/dp/B0BSHF7WHW"}
                            rows={4}
                            className="input-field resize-none font-mono text-sm"
                            disabled={loading || data?.status === 'running'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Mode</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setMode('sync')}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${mode === 'sync'
                                    ? 'bg-electric/20 text-electric-300 border border-electric/40'
                                    : 'bg-navy-600/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                ⚡ Sync
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('async')}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${mode === 'async'
                                    ? 'bg-electric/20 text-electric-300 border border-electric/40'
                                    : 'bg-navy-600/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                🔄 Async (Poll)
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !datasetId.trim() || !urlsInput.trim() || data?.status === 'running'}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || data?.status === 'running' ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {data?.status === 'running' ? 'Scraping… (polling)' : 'Starting scrape…'}
                            </>
                        ) : (
                            <>📦 Start Scrape</>
                        )}
                    </button>
                </form>
            </div>

            {/* Async status */}
            {snapshotId && data?.status === 'running' && (
                <div className="glass-card p-4 border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                    <div>
                        <p className="text-amber-400 font-medium text-sm">Scrape in progress</p>
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
                            <p className="text-red-400 font-medium text-sm">Scraper Error</p>
                            <p className="text-red-300/70 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {data?.status === 'ready' && data.data && data.data.length > 0 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">Items Scraped</p>
                            <p className="text-xl font-bold text-emerald-400">{data.data.length}</p>
                        </div>
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">Mode</p>
                            <p className="text-xl font-bold text-electric-400">{data.mode}</p>
                        </div>
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">Status</p>
                            <p className="text-xl font-bold text-emerald-400">✓ Ready</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300">📊 Scraped Data</h3>
                        {data.data.map((item, i) => (
                            <ScraperResultCard key={i} item={item} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!data && !loading && !error && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Web Scraper API</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Use pre-built scrapers from the Bright Data library. Provide a dataset ID and URLs
                        to extract structured data from any website.
                    </p>
                </div>
            )}
        </section>
    );
}

function ScraperResultCard({ item, index }: { item: Record<string, unknown>; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const keys = Object.keys(item).filter((k) => item[k] !== undefined && item[k] !== null && item[k] !== '');

    const title = (item.title || item.name || item.url || `Item ${index + 1}`) as string;

    return (
        <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-electric-400 bg-electric/10 px-2 py-0.5 rounded">#{index + 1}</span>
                    </div>
                    <h4 className="text-white font-medium text-sm truncate">{title}</h4>
                    {item.url != null && (
                        <a href={String(item.url)} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-electric-400 hover:underline truncate block">
                            {String(item.url)}
                        </a>
                    )}
                </div>
            </div>

            {keys.length > 0 && (
                <div className="mt-3">
                    <button onClick={() => setExpanded(!expanded)} className="text-xs text-electric-400 hover:underline">
                        {expanded ? '▼ Hide' : '▶ Show'} {keys.length} fields
                    </button>
                    {expanded && (
                        <div className="mt-2 bg-navy-900/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                            {keys.map((key) => (
                                <div key={key} className="flex gap-2 py-0.5 text-xs">
                                    <span className="text-slate-500 font-mono shrink-0">{key}:</span>
                                    <span className="text-slate-300 truncate">
                                        {typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key])}
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
