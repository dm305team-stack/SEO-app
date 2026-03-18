'use client';

import { useState } from 'react';
import type { UnlockerResult } from '@/lib/brightdata-unlocker';

interface UnlockerApiSectionProps {
    data: UnlockerResult | null;
    loading: boolean;
    error?: string;
    onUnlock: (url: string, options: { country?: string }) => void;
}

export default function UnlockerApiSection({ data, loading, error, onUnlock }: UnlockerApiSectionProps) {
    const [url, setUrl] = useState('');
    const [country, setCountry] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
        let finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
        onUnlock(finalUrl, { country: country || undefined });
    };

    return (
        <section id="unlocker-api" className="space-y-6">
            {/* Header */}
            <div className="section-heading">
                <div className="icon">🔓</div>
                <div>
                    <h2 className="text-xl font-bold text-white">Unlocker API</h2>
                    <p className="text-sm text-slate-400 font-normal">
                        Bypass anti-bot protections & CAPTCHAs to access any page
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">URL to unlock</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="e.g. https://example.com/protected-page"
                                className="input-field pl-12"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Country (optional)</label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="input-field"
                                disabled={loading}
                            >
                                <option value="">🌍 Auto-detect best</option>
                                <option value="us">🇺🇸 United States</option>
                                <option value="mx">🇲🇽 Mexico</option>
                                <option value="gb">🇬🇧 United Kingdom</option>
                                <option value="de">🇩🇪 Germany</option>
                                <option value="fr">🇫🇷 France</option>
                                <option value="es">🇪🇸 Spain</option>
                                <option value="br">🇧🇷 Brazil</option>
                                <option value="jp">🇯🇵 Japan</option>
                                <option value="in">🇮🇳 India</option>
                                <option value="au">🇦🇺 Australia</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={loading || !url.trim()}
                                className="btn-primary w-full flex items-center justify-center gap-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Unlocking…
                                    </>
                                ) : (
                                    <>🔓 Unlock URL</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
                    <div className="flex items-start gap-3">
                        <span className="text-red-400 text-xl">⚠️</span>
                        <div>
                            <p className="text-red-400 font-medium text-sm">Unlocker Error</p>
                            <p className="text-red-300/70 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {data && (
                <div className="space-y-6 animate-fade-in">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard label="Status" value={String(data.statusCode)} color={data.statusCode === 200 ? 'emerald' : 'red'} />
                        <MetricCard label="Response Time" value={`${(data.responseTime / 1000).toFixed(2)}s`} color={data.responseTime < 3000 ? 'emerald' : 'amber'} />
                        <MetricCard label="Content Size" value={formatBytes(data.contentLength)} color="electric" />
                        <MetricCard label="Country" value={data.country.toUpperCase()} color="electric" />
                    </div>

                    {/* Content Type */}
                    <div className="glass-card p-4 flex items-center gap-3">
                        <span className="text-lg">{data.isHtml ? '📄' : '📜'}</span>
                        <div>
                            <p className="text-sm text-slate-400">Content Type</p>
                            <p className="text-white font-mono text-sm">{data.contentType || 'unknown'}</p>
                        </div>
                    </div>

                    {/* HTML Analysis */}
                    {data.isHtml && (
                        <>
                            {/* Title & Meta */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-semibold text-slate-300 mb-4">🏷️ Page Metadata</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-4">
                                        <span className="text-xs text-slate-500 w-32 shrink-0">Title</span>
                                        <span className="text-sm text-white">{data.title || '(not set)'}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-xs text-slate-500 w-32 shrink-0">Meta Description</span>
                                        <span className="text-sm text-slate-300">{data.metaDescription || '(not set)'}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-xs text-slate-500 w-32 shrink-0">Word Count</span>
                                        <span className="text-sm text-white">{data.wordCount?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Headings */}
                            {data.headings && data.headings.length > 0 && (
                                <div className="glass-card p-6">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">📑 Heading Structure ({data.headings.length})</h3>
                                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                        {data.headings.map((h, i) => (
                                            <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(h.level - 1) * 16}px` }}>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${h.level === 1 ? 'bg-emerald-500/20 text-emerald-400' : h.level === 2 ? 'bg-electric/20 text-electric-400' : 'bg-slate-700 text-slate-400'}`}>
                                                    H{h.level}
                                                </span>
                                                <span className="text-sm text-slate-300 truncate">{h.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Links */}
                            {data.links && data.links.length > 0 && (
                                <div className="glass-card p-6">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">🔗 Links ({data.links.length})</h3>
                                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                        {data.links.map((link, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${link.isExternal ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {link.isExternal ? 'EXT' : 'INT'}
                                                </span>
                                                <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-electric-400 hover:underline truncate">
                                                    {link.text || link.href}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Raw text for non-HTML */}
                    {!data.isHtml && data.rawText && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">📜 Response Content</h3>
                            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono bg-navy-900/50 rounded-xl p-4 max-h-96 overflow-y-auto">
                                {data.rawText}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!data && !loading && !error && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🔓</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Web Unlocker</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Access any URL bypassing anti-bot protections, CAPTCHAs, and geo-restrictions. Extracts page metadata, headings, and links for SEO analysis.
                    </p>
                </div>
            )}
        </section>
    );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
    const colorClass = { emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', electric: 'text-electric-400' }[color] || 'text-white';
    return (
        <div className="metric-card">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
