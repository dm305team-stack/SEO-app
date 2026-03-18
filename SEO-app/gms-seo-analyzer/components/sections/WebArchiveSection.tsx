'use client';

import { useState, useEffect, useRef } from 'react';
import type { WebArchiveResult } from '@/types';

interface WebArchiveSectionProps {
    data: WebArchiveResult | null;
    loading: boolean;
    error?: string;
    onSearch: (url: string, options: { fromDate?: string; toDate?: string; limit?: number }) => void;
    onPollStatus: (searchId: string) => void;
    searchId?: string;
}

export default function WebArchiveSection({
    data, loading, error, onSearch, onPollStatus, searchId,
}: WebArchiveSectionProps) {
    const [url, setUrl] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-poll while running
    useEffect(() => {
        if (data?.status === 'running' && searchId) {
            pollRef.current = setInterval(() => onPollStatus(searchId), 5000);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [data?.status, searchId, onPollStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
        const fullUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
        onSearch(fullUrl, {
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
        });
    };

    return (
        <section id="web-archive" className="space-y-6">
            {/* Header */}
            <div className="section-heading">
                <div className="icon">📚</div>
                <div>
                    <h2 className="text-xl font-bold text-white">Web Archive</h2>
                    <p className="text-sm text-slate-400 font-normal">
                        Historical snapshots of web pages
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">URL to search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="input-field pl-12"
                                disabled={loading || data?.status === 'running'}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                From Date <span className="text-slate-500">(optional)</span>
                            </label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="input-field"
                                disabled={loading || data?.status === 'running'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                To Date <span className="text-slate-500">(optional)</span>
                            </label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="input-field"
                                disabled={loading || data?.status === 'running'}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !url.trim() || data?.status === 'running'}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || data?.status === 'running' ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {data?.status === 'running' ? 'Searching archive… (polling)' : 'Starting search…'}
                            </>
                        ) : (
                            <>📚 Search Web Archive</>
                        )}
                    </button>
                </form>
            </div>

            {/* Search in progress */}
            {searchId && data?.status === 'running' && (
                <div className="glass-card p-4 border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                    <div>
                        <p className="text-amber-400 font-medium text-sm">Archive search in progress</p>
                        <p className="text-amber-300/60 text-xs mt-0.5">
                            Search ID: <code className="bg-navy-900/50 px-1.5 py-0.5 rounded">{searchId}</code>
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
                            <p className="text-red-400 font-medium text-sm">Archive Error</p>
                            <p className="text-red-300/70 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {data?.status === 'ready' && data.results && data.results.length > 0 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">Snapshots Found</p>
                            <p className="text-xl font-bold text-emerald-400">
                                {data.totalSnapshots || data.results.length}
                            </p>
                        </div>
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">URL</p>
                            <p className="text-sm font-mono text-electric-400 truncate">{data.url || url}</p>
                        </div>
                        <div className="metric-card">
                            <p className="text-xs text-slate-500 mb-1">Status</p>
                            <p className="text-xl font-bold text-emerald-400">✓ Ready</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">📅 Archive Timeline</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {data.results.map((snapshot, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-navy-900/30 hover:bg-navy-900/50 transition-colors">
                                    {/* Timeline dot */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-electric-400" />
                                        {i < data.results!.length - 1 && (
                                            <div className="w-px h-6 bg-slate-700 mt-1" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-medium text-white">
                                                {formatTimestamp(snapshot.timestamp)}
                                            </span>
                                            {snapshot.status_code && (
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${snapshot.status_code === 200
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {snapshot.status_code}
                                                </span>
                                            )}
                                            {snapshot.content_type && (
                                                <span className="text-xs text-slate-500">{snapshot.content_type}</span>
                                            )}
                                        </div>
                                        <a
                                            href={snapshot.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-electric-400 hover:underline truncate block"
                                        >
                                            {snapshot.url}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Ready but no results */}
            {data?.status === 'ready' && (!data.results || data.results.length === 0) && (
                <div className="glass-card p-8 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-slate-400 text-sm">Search completed but no archived snapshots were found for this URL.</p>
                </div>
            )}

            {/* Empty state */}
            {!data && !loading && !error && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Web Archive</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Search for historical snapshots of any URL. View how pages have changed over time
                        with archived versions from the web.
                    </p>
                </div>
            )}
        </section>
    );
}

function formatTimestamp(ts: string): string {
    try {
        return new Date(ts).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return ts;
    }
}
