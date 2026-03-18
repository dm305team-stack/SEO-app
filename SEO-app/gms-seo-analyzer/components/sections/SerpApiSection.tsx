'use client';

import { useState } from 'react';
import type { SerpSearchResult, SerpOrganicResult } from '@/lib/brightdata-serp';

interface SerpApiSectionProps {
    data: SerpSearchResult | null;
    loading: boolean;
    error?: string;
    onSearch: (keyword: string, options: { country?: string; language?: string; device?: string }) => void;
}

export default function SerpApiSection({ data, loading, error, onSearch }: SerpApiSectionProps) {
    const [keyword, setKeyword] = useState('');
    const [country, setCountry] = useState('us');
    const [language, setLanguage] = useState('en');
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        onSearch(keyword.trim(), { country: country || undefined, language: language || undefined, device });
    };

    return (
        <section id="serp-api" className="space-y-6">
            {/* Header */}
            <div className="section-heading">
                <div className="icon">🔍</div>
                <div>
                    <h2 className="text-xl font-bold text-white">SERP API</h2>
                    <p className="text-sm text-slate-400 font-normal">
                        Search engine results & rankings by keyword
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Keyword</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="e.g. SEO agency Miami"
                                className="input-field pl-12"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="input-field"
                                disabled={loading}
                            >
                                <option value="us">🇺🇸 United States</option>
                                <option value="mx">🇲🇽 Mexico</option>
                                <option value="es">🇪🇸 Spain</option>
                                <option value="gb">🇬🇧 United Kingdom</option>
                                <option value="ca">🇨🇦 Canada</option>
                                <option value="br">🇧🇷 Brazil</option>
                                <option value="de">🇩🇪 Germany</option>
                                <option value="fr">🇫🇷 France</option>
                                <option value="ar">🇦🇷 Argentina</option>
                                <option value="co">🇨🇴 Colombia</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="input-field"
                                disabled={loading}
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="pt">Português</option>
                                <option value="de">Deutsch</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Device</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setDevice('desktop')}
                                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${device === 'desktop' ? 'bg-electric/20 text-electric-300 border border-electric/40' : 'bg-navy-600/50 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>
                                    🖥️ Desktop
                                </button>
                                <button type="button" onClick={() => setDevice('mobile')}
                                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${device === 'mobile' ? 'bg-electric/20 text-electric-300 border border-electric/40' : 'bg-navy-600/50 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>
                                    📱 Mobile
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading || !keyword.trim()}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Searching…
                            </>
                        ) : (
                            <>🔍 Search SERP</>
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
                            <p className="text-red-400 font-medium text-sm">Search Error</p>
                            <p className="text-red-300/70 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {data && (
                <div className="space-y-6 animate-fade-in">
                    {/* Search Info Bar */}
                    <div className="glass-card p-4 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Keyword:</span>
                            <span className="text-white font-semibold">{data.keyword}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Country:</span>
                            <span className="text-slate-300 uppercase">{data.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Results:</span>
                            <span className="text-slate-300">{data.organic.length} organic</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Time:</span>
                            <span className="text-slate-300">{(data.searchTime / 1000).toFixed(2)}s</span>
                        </div>
                    </div>

                    {/* Quick Counts */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard label="Organic Results" value={String(data.organic.length)} color="electric" />
                        <MetricCard label="Ads" value={String(data.ads.length)} color={data.ads.length > 0 ? 'amber' : 'electric'} />
                        <MetricCard label="People Also Ask" value={String(data.peopleAlsoAsk.length)} color="electric" />
                        <MetricCard label="Related Searches" value={String(data.relatedSearches.length)} color="electric" />
                    </div>

                    {/* Featured Snippet */}
                    {data.featuredSnippet && (
                        <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/5">
                            <h3 className="text-sm font-semibold text-emerald-400 mb-2">⭐ Featured Snippet</h3>
                            <a href={data.featuredSnippet.url} target="_blank" rel="noopener noreferrer"
                                className="text-sm font-medium text-electric-400 hover:underline">{data.featuredSnippet.title}</a>
                            <p className="text-sm text-slate-300 mt-1">{data.featuredSnippet.description}</p>
                        </div>
                    )}

                    {/* Knowledge Panel */}
                    {data.knowledgePanel && (
                        <div className="glass-card p-5 border-purple-500/20 bg-purple-500/5">
                            <h3 className="text-sm font-semibold text-purple-400 mb-2">📚 Knowledge Panel</h3>
                            <p className="text-white font-medium">{data.knowledgePanel.title}</p>
                            {data.knowledgePanel.type && <p className="text-xs text-purple-300 mt-0.5">{data.knowledgePanel.type}</p>}
                            <p className="text-sm text-slate-300 mt-1">{data.knowledgePanel.description}</p>
                        </div>
                    )}

                    {/* Organic Results */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">🏆 Organic Rankings</h3>
                        <div className="space-y-3">
                            {data.organic.map((result, i) => (
                                <RankingRow key={i} result={result} />
                            ))}
                            {data.organic.length === 0 && (
                                <p className="text-sm text-slate-500 italic">No organic results found</p>
                            )}
                        </div>
                    </div>

                    {/* Ads */}
                    {data.ads.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">💰 Paid Ads ({data.ads.length})</h3>
                            <div className="space-y-3">
                                {data.ads.map((ad, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">AD</span>
                                            <a href={ad.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-electric-400 hover:underline truncate">{ad.title}</a>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate">{ad.domain}</p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ad.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* People Also Ask */}
                    {data.peopleAlsoAsk.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">❓ People Also Ask</h3>
                            <div className="space-y-2">
                                {data.peopleAlsoAsk.map((paa, i) => (
                                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-navy-600/30">
                                        <span className="text-electric-400 text-xs mt-0.5">Q</span>
                                        <span className="text-sm text-slate-300">{paa.question}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related Searches */}
                    {data.relatedSearches.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">🔗 Related Searches</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.relatedSearches.map((rs, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                        {rs.query}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!data && !loading && !error && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-white mb-2">SERP Analysis</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Enter a keyword to see Google search results, rankings, ads, &quot;People Also Ask&quot;, and related searches — all from a real browser.
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

function RankingRow({ result }: { result: SerpOrganicResult }) {
    const posColor = result.position <= 3 ? 'text-emerald-400 bg-emerald-500/10' : result.position <= 10 ? 'text-electric-400 bg-electric/10' : 'text-slate-400 bg-slate-800';
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-600/20 hover:bg-navy-600/40 transition-colors">
            <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${posColor}`}>
                {result.position}
            </span>
            <div className="flex-1 min-w-0">
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-electric-400 hover:underline line-clamp-1">{result.title}</a>
                <p className="text-xs text-emerald-400/80 truncate mt-0.5">{result.domain}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{result.description}</p>
            </div>
        </div>
    );
}
