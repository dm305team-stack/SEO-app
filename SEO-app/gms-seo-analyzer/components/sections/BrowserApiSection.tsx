'use client';

import { useState } from 'react';
import type { BrowserApiData } from '@/types';

interface BrowserApiSectionProps {
    data: BrowserApiData | null;
    loading: boolean;
    error?: string;
    onAnalyze: (url: string, options: { country?: string; device?: string }) => void;
    initialUrl?: string;
    initialCountry?: string;
    initialDevice?: 'desktop' | 'mobile';
}

export default function BrowserApiSection({ data, loading, error, onAnalyze, initialUrl, initialCountry, initialDevice }: BrowserApiSectionProps) {
    const [url, setUrl] = useState(initialUrl || '');
    const [device, setDevice] = useState<'desktop' | 'mobile'>(initialDevice || 'desktop');
    const [country, setCountry] = useState(initialCountry || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
        onAnalyze(url.trim(), { country: country || undefined, device });
    };

    return (
        <section id="browser-api" className="space-y-6">
            {/* Header */}
            <div className="section-heading">
                <div className="icon">🌐</div>
                <div>
                    <h2 className="text-xl font-bold text-white">Browser API</h2>
                    <p className="text-sm text-slate-400 font-normal">
                        Live page analysis with JavaScript rendering
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            URL to analyze
                        </label>
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
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Device
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDevice('desktop')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${device === 'desktop'
                                        ? 'bg-electric/20 text-electric-300 border border-electric/40'
                                        : 'bg-navy-600/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    🖥️ Desktop
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDevice('mobile')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${device === 'mobile'
                                        ? 'bg-electric/20 text-electric-300 border border-electric/40'
                                        : 'bg-navy-600/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    📱 Mobile
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Country (optional)
                            </label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="e.g., US, MX, ES"
                                className="input-field"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing page…
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Analyze with Browser API
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
                    <div className="flex items-start gap-3">
                        <span className="text-red-400 text-xl">⚠️</span>
                        <div>
                            <p className="text-red-400 font-medium text-sm">Analysis Error</p>
                            <p className="text-red-300/70 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {data && (
                <div className="space-y-6 animate-fade-in">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard
                            label="Status"
                            value={String(data.statusCode)}
                            color={data.statusCode === 200 ? 'emerald' : 'red'}
                        />
                        <MetricCard
                            label="Load Time"
                            value={`${(data.loadTimeMs / 1000).toFixed(2)}s`}
                            color={data.loadTimeMs < 3000 ? 'emerald' : data.loadTimeMs < 5000 ? 'amber' : 'red'}
                        />
                        <MetricCard label="Word Count" value={data.wordCount.toLocaleString()} color="electric" />
                        <MetricCard label="HTML Size" value={formatBytes(data.htmlSize)} color="electric" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard label="Internal Links" value={String(data.internalLinks)} color="electric" />
                        <MetricCard label="External Links" value={String(data.externalLinks)} color="electric" />
                        <MetricCard label="Headings" value={String(data.headings.length)} color="electric" />
                        <MetricCard label="Schema Types" value={String(data.schemaMarkup.length)} color="electric" />
                    </div>

                    {/* Screenshot */}
                    {data.screenshot && (
                        <div className="glass-card p-4">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">📸 Page Screenshot</h3>
                            <div className="rounded-xl overflow-hidden border border-slate-700/50">
                                <img
                                    src={`data:image/png;base64,${data.screenshot}`}
                                    alt={`Screenshot of ${data.url}`}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    )}

                    {/* Title & Meta */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">🏷️ Title & Meta</h3>
                        <div className="space-y-3">
                            <InfoRow label="Title" value={data.title} />
                            <InfoRow label="Meta Description" value={data.metaDescription || '(not set)'} />
                            <InfoRow label="Canonical URL" value={data.canonicalUrl || '(not set)'} />
                            <InfoRow label="Final URL" value={data.finalUrl} />
                        </div>
                    </div>

                    {/* OG Tags */}
                    {data.ogTags.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">🔗 Open Graph Tags</h3>
                            <div className="space-y-2">
                                {data.ogTags.map((tag, i) => (
                                    <InfoRow key={i} label={tag.name} value={tag.content} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Headings */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">📑 Heading Structure</h3>
                        <div className="space-y-1.5">
                            {data.headings.map((h, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-2"
                                    style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
                                >
                                    <span className="text-xs font-mono text-electric-400 bg-electric/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                        H{h.level}
                                    </span>
                                    <span className="text-sm text-slate-300">{h.text}</span>
                                </div>
                            ))}
                            {data.headings.length === 0 && (
                                <p className="text-sm text-slate-500 italic">No headings found</p>
                            )}
                        </div>
                    </div>

                    {/* Hreflang Tags */}
                    {data.hreflangTags.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">🌍 Hreflang Tags</h3>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Language</th>
                                        <th>URL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.hreflangTags.map((tag, i) => (
                                        <tr key={i}>
                                            <td className="font-mono text-electric-400">{tag.lang}</td>
                                            <td className="truncate max-w-xs">{tag.href}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Top Links */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">🔗 Links (first 20)</h3>
                        <div className="space-y-1.5 max-h-80 overflow-y-auto">
                            {data.links.slice(0, 20).map((link, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${link.isExternal
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                        {link.isExternal ? 'EXT' : 'INT'}
                                    </span>
                                    <span className="text-slate-400 truncate flex-1">{link.href}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">⚡ Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">DOM Content Loaded</p>
                                <p className="text-lg font-bold text-white">
                                    {(data.performance.domContentLoaded / 1000).toFixed(2)}s
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Full Load</p>
                                <p className="text-lg font-bold text-white">
                                    {(data.performance.loadComplete / 1000).toFixed(2)}s
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state when no analysis has been run */}
            {!data && !loading && !error && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🌐</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Browser API Analysis</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Enter a URL above to analyze any page with a real browser. Get screenshots,
                        SEO metadata, heading structure, link analysis, and performance metrics.
                    </p>
                </div>
            )}
        </section>
    );
}

// Helper components
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
    const colorClass = {
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
        electric: 'text-electric-400',
    }[color] || 'text-white';

    return (
        <div className="metric-card">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1">
            <span className="text-xs font-medium text-slate-500 sm:w-36 flex-shrink-0">{label}</span>
            <span className="text-sm text-slate-300 break-all">{value}</span>
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
