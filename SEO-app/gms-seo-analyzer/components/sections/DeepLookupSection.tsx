'use client';

import { useState, useEffect, useRef } from 'react';
import type { DeepLookupPreview, DeepLookupRequest } from '@/types';

interface DeepLookupSectionProps {
    preview: DeepLookupPreview | null;
    request: DeepLookupRequest | null;
    loading: boolean;
    error?: string;
    onPreview: (query: string, options: { country?: string; city?: string; category?: string }) => void;
    onPollPreview: (previewId: string) => void;
    onRequest: (query: string, options: { country?: string; city?: string; category?: string }) => void;
    onDownload: (requestId: string) => void;
}

export default function DeepLookupSection({
    preview, request, loading, error,
    onPreview, onPollPreview, onRequest, onDownload,
}: DeepLookupSectionProps) {
    const [query, setQuery] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-poll preview
    useEffect(() => {
        if (preview?.status === 'pending' && preview.id) {
            pollRef.current = setInterval(() => onPollPreview(preview.id), 4000);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [preview?.status, preview?.id, onPollPreview]);

    // Auto-poll request results
    useEffect(() => {
        if (request?.status === 'running' && request.id) {
            const timer = setInterval(() => onDownload(request.id), 5000);
            return () => clearInterval(timer);
        }
    }, [request?.status, request?.id, onDownload]);

    const handlePreviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        onPreview(query.trim(), {
            country: country || undefined,
            city: city || undefined,
            category: category || undefined,
        });
    };

    const handleConfirmRequest = () => {
        onRequest(query.trim(), {
            country: country || undefined,
            city: city || undefined,
            category: category || undefined,
        });
    };

    return (
        <section id="deep-lookup" className="space-y-6">
            {/* Header */}
            <div className="section-heading">
                <div className="icon">🔎</div>
                <div>
                    <h2 className="text-xl font-bold text-white">Deep Lookup</h2>
                    <p className="text-sm text-slate-400 font-normal">
                        Entity &amp; competitor discovery by geography
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="glass-card p-6">
                <form onSubmit={handlePreviewSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Search Query <span className="text-slate-500">(auto-prefixed with &quot;Find all&quot;)</span>
                        </label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., surgeon marketing agencies in Miami"
                            className="input-field"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="e.g., US"
                                className="input-field"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g., Miami"
                                className="input-field"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="optional"
                                className="input-field"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading…
                            </>
                        ) : (
                            <>🔎 Get Preview</>
                        )}
                    </button>
                </form>
            </div>

            {/* Preview pending */}
            {preview?.status === 'pending' && (
                <div className="glass-card p-4 border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                    <div>
                        <p className="text-amber-400 font-medium text-sm">Preview generating…</p>
                        <p className="text-amber-300/60 text-xs mt-0.5">Polling every 4s</p>
                    </div>
                </div>
            )}

            {/* Preview ready */}
            {preview?.status === 'ready' && !request && (
                <div className="glass-card p-6 border-electric/30 bg-electric/5 space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold text-white">📋 Preview Results</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {preview.estimatedRecords !== undefined && (
                            <div className="metric-card">
                                <p className="text-xs text-slate-500 mb-1">Est. Records</p>
                                <p className="text-xl font-bold text-electric-400">{preview.estimatedRecords.toLocaleString()}</p>
                            </div>
                        )}
                        {preview.estimatedCost !== undefined && (
                            <div className="metric-card">
                                <p className="text-xs text-slate-500 mb-1">Est. Cost</p>
                                <p className="text-xl font-bold text-amber-400">${preview.estimatedCost.toFixed(2)}</p>
                            </div>
                        )}
                    </div>

                    {/* Sample data */}
                    {preview.data && preview.data.length > 0 && (
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Sample data ({preview.data.length} items)</p>
                            <div className="bg-navy-900/50 rounded-lg p-3 max-h-48 overflow-y-auto text-xs">
                                {preview.data.slice(0, 5).map((item, i) => (
                                    <div key={i} className="py-1 border-b border-slate-800 last:border-0">
                                        {Object.entries(item).slice(0, 4).map(([k, v]) => (
                                            <span key={k} className="mr-3">
                                                <span className="text-slate-500 font-mono">{k}:</span>{' '}
                                                <span className="text-slate-300">{String(v).slice(0, 60)}</span>
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleConfirmRequest}
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-3"
                    >
                        ✅ Confirm &amp; Run Full Request
                    </button>
                </div>
            )}

            {/* Request running */}
            {request?.status === 'running' && (
                <div className="glass-card p-4 border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                    <div>
                        <p className="text-amber-400 font-medium text-sm">Request in progress…</p>
                        <p className="text-amber-300/60 text-xs mt-0.5">Auto-polling every 5s</p>
                    </div>
                </div>
            )}

            {/* Request results */}
            {request?.status === 'ready' && request.data && request.data.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                    <div className="metric-card inline-block">
                        <p className="text-xs text-slate-500 mb-1">Total Records</p>
                        <p className="text-xl font-bold text-emerald-400">{request.data.length.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-4 overflow-x-auto">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3">📊 Results</h3>
                        <table className="data-table text-xs">
                            <thead>
                                <tr>
                                    {Object.keys(request.data[0]).slice(0, 6).map((key) => (
                                        <th key={key} className="font-mono">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {request.data.slice(0, 50).map((row, i) => (
                                    <tr key={i}>
                                        {Object.keys(request.data![0]).slice(0, 6).map((key) => (
                                            <td key={key} className="truncate max-w-[200px]">
                                                {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {request.data.length > 50 && (
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Showing first 50 of {request.data.length} records
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
                    <div className="flex items-start gap-3">
                        <span className="text-red-400 text-xl">⚠️</span>
                        <div>
                            <p className="text-red-400 font-medium text-sm">Deep Lookup Error</p>
                            <p className="text-red-300/70 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!preview && !request && !loading && !error && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🔎</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Deep Lookup</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Discover entities and competitors by location. Enter a search query with optional
                        geography filters to find businesses, organizations, and competitors.
                    </p>
                </div>
            )}
        </section>
    );
}
