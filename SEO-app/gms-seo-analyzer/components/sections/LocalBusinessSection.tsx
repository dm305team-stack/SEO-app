'use client';

import { useState } from 'react';
import axios from 'axios';
import type { LocalBusinessData, LocalBusinessMetrics } from '@/types';

interface LocalBusinessSectionProps {
    data: LocalBusinessData | null;
    loading: boolean;
    error?: string;
    onSearch: (query: string) => void;
    onFetchInsights: (locationId: string, accessToken: string) => void;
    insightsLoading: boolean;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <svg
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </span>
    );
}

function MetricBox({ label, value, icon, sub }: { label: string; value: string | number; icon: string; sub?: string }) {
    return (
        <div className="glass-card p-5 flex flex-col gap-1">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold text-white mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-sm font-medium text-electric-400">{label}</p>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

export default function LocalBusinessSection({
    data,
    loading,
    error,
    onSearch,
    onFetchInsights,
    insightsLoading,
}: LocalBusinessSectionProps) {
    const [query, setQuery] = useState('');
    const [locationId, setLocationId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [showInsightsForm, setShowInsightsForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'hours' | 'photos' | 'reviews' | 'metrics'>('info');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        onSearch(query.trim());
    };

    const handleInsights = (e: React.FormEvent) => {
        e.preventDefault();
        if (!locationId.trim() || !accessToken.trim()) return;
        onFetchInsights(locationId.trim(), accessToken.trim());
    };

    const TABS = [
        { id: 'info', label: 'Business Info', icon: '🏢' },
        { id: 'hours', label: 'Hours', icon: '🕐' },
        { id: 'photos', label: 'Photos', icon: '📸' },
        { id: 'reviews', label: 'Reviews', icon: '⭐' },
        { id: 'metrics', label: 'Metrics', icon: '📊' },
    ] as const;

    return (
        <section id="local-business" className="space-y-6">
            {/* Header */}
            <div className="section-heading">
                <div className="icon">🗺️</div>
                <div>
                    <h2 className="text-xl font-bold text-white">Local Business Analyzer</h2>
                    <p className="text-sm text-slate-400 font-normal">
                        Google My Business profile, hours, photos, reviews & performance metrics
                    </p>
                </div>
            </div>

            {/* Search Form */}
            <div className="glass-card p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Business name or address
                        </label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="e.g. Starbucks 123 Main St, New York"
                                    className="input-field pl-12"
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" disabled={loading || !query.trim()} className="btn-primary px-6 whitespace-nowrap">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Searching...
                                    </span>
                                ) : 'Analyze'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                            Requires <code className="text-electric-400">GOOGLE_PLACES_API_KEY</code> in your .env.local
                        </p>
                    </div>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="glass-card p-4 border border-red-500/30 bg-red-500/5">
                    <div className="flex items-start gap-3">
                        <span className="text-red-400 text-lg mt-0.5">⚠️</span>
                        <div>
                            <p className="text-sm font-medium text-red-400">Error</p>
                            <p className="text-sm text-slate-400 mt-0.5">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading skeleton */}
            {loading && !data && (
                <div className="glass-card p-6 space-y-4 animate-pulse">
                    <div className="h-6 bg-slate-700/60 rounded w-1/3" />
                    <div className="h-4 bg-slate-700/40 rounded w-1/2" />
                    <div className="grid grid-cols-4 gap-4 mt-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-700/40 rounded-xl" />)}
                    </div>
                </div>
            )}

            {/* Results */}
            {data && (
                <>
                    {/* Business Header Card */}
                    <div className="glass-card p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-2xl font-bold text-white">{data.name}</h3>
                                    {data.isOpen !== undefined && (
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${data.isOpen ? 'status-good' : 'status-critical'}`}>
                                            {data.isOpen ? 'Open Now' : 'Closed'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <StarRating rating={data.rating} />
                                    <span className="text-amber-400 font-semibold">{data.rating.toFixed(1)}</span>
                                    <span className="text-slate-400 text-sm">({data.reviewCount.toLocaleString()} reviews)</span>
                                </div>

                                <div className="space-y-1.5 text-sm text-slate-400">
                                    <p className="flex items-center gap-2">
                                        <span>📍</span> {data.address}
                                    </p>
                                    {data.phone && (
                                        <p className="flex items-center gap-2">
                                            <span>📞</span>
                                            <a href={`tel:${data.phone}`} className="text-electric-400 hover:underline">{data.phone}</a>
                                        </p>
                                    )}
                                    {data.website && (
                                        <p className="flex items-center gap-2">
                                            <span>🌐</span>
                                            <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:underline truncate max-w-xs">
                                                {data.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </p>
                                    )}
                                </div>

                                {/* Categories */}
                                {data.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {data.categories.slice(0, 5).map((cat) => (
                                            <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-electric/10 text-electric-400 border border-electric/20">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Place ID box */}
                            <div className="glass-card p-3 text-xs text-slate-500 border border-electric/10">
                                <p className="text-slate-400 font-medium mb-1">Place ID</p>
                                <p className="font-mono text-[11px] break-all text-slate-300">{data.placeId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-electric/20 text-electric-300 border border-electric/30'
                                    : 'text-slate-400 hover:text-white hover:bg-navy-500/40'
                                    }`}
                            >
                                <span>{tab.icon}</span> {tab.label}
                                {tab.id === 'metrics' && !data.metrics && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20 ml-1">OAuth</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab: Business Info */}
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricBox icon="⭐" label="Rating" value={data.rating.toFixed(1)} sub="out of 5.0" />
                            <MetricBox icon="💬" label="Total Reviews" value={data.reviewCount} sub="Google reviews" />
                            <MetricBox icon="📸" label="Photos" value={data.photos.length} sub="available" />
                            <MetricBox icon="🏷️" label="Categories" value={data.categories.length} sub="business types" />
                        </div>
                    )}

                    {/* Tab: Hours */}
                    {activeTab === 'hours' && (
                        <div className="glass-card overflow-hidden">
                            {data.hours.length > 0 ? (
                                <table className="data-table w-full">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>Opens</th>
                                            <th>Closes</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.hours.map((h, i) => (
                                            <tr key={i}>
                                                <td className="font-medium text-white">{h.day}</td>
                                                <td>{h.isClosed ? '—' : h.openTime}</td>
                                                <td>{h.isClosed ? '—' : h.closeTime}</td>
                                                <td>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${h.isClosed ? 'status-critical' : 'status-good'}`}>
                                                        {h.isClosed ? 'Closed' : 'Open'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="p-6 text-sm text-slate-400">No hours information available.</p>
                            )}
                        </div>
                    )}

                    {/* Tab: Photos */}
                    {activeTab === 'photos' && (
                        <div>
                            {data.photos.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {data.photos.map((photo, i) => (
                                        <div key={i} className="glass-card overflow-hidden aspect-square">
                                            <img
                                                src={photo.url}
                                                alt={`${data.name} photo ${i + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card p-6 text-center text-slate-400 text-sm">No photos available.</div>
                            )}
                        </div>
                    )}

                    {/* Tab: Reviews */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {data.reviews.length > 0 ? (
                                data.reviews.map((review, i) => (
                                    <div key={i} className="glass-card p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            {review.profilePhoto ? (
                                                <img src={review.profilePhoto} alt={review.author} className="w-9 h-9 rounded-full" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-electric/20 flex items-center justify-center text-electric-400 font-bold text-sm">
                                                    {review.author[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-white">{review.author}</p>
                                                <p className="text-xs text-slate-500">{review.date}</p>
                                            </div>
                                            <div className="ml-auto">
                                                <StarRating rating={review.rating} />
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed">{review.text}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card p-6 text-center text-slate-400 text-sm">No reviews available.</div>
                            )}
                        </div>
                    )}

                    {/* Tab: Metrics */}
                    {activeTab === 'metrics' && (
                        <div className="space-y-6">
                            {data.metrics ? (
                                <>
                                    {/* KPI grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        <MetricBox icon="🔍" label="Search Views" value={data.metrics.viewsSearch} sub={`${data.metrics.periodDays}-day total`} />
                                        <MetricBox icon="🗺️" label="Maps Views" value={data.metrics.viewsMaps} sub={`${data.metrics.periodDays}-day total`} />
                                        <MetricBox icon="🌐" label="Website Clicks" value={data.metrics.actionsWebsite} sub="action" />
                                        <MetricBox icon="📞" label="Phone Calls" value={data.metrics.actionsPhone} sub="action" />
                                        <MetricBox icon="📍" label="Direction Requests" value={data.metrics.actionsDirections} sub="action" />
                                    </div>

                                    {/* Search Keywords */}
                                    {data.metrics.searchKeywords.length > 0 && (
                                        <div className="glass-card overflow-hidden">
                                            <div className="px-6 py-4 border-b border-electric/10">
                                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                                    <span>🔑</span> Top Search Keywords
                                                    <span className="text-xs text-slate-500 font-normal">— last {data.metrics.periodDays} days</span>
                                                </h4>
                                            </div>
                                            <table className="data-table w-full">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Keyword</th>
                                                        <th>Impressions</th>
                                                        <th>Share</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const total = data.metrics!.searchKeywords.reduce((a, k) => a + k.impressions, 0);
                                                        return data.metrics!.searchKeywords.map((kw, i) => (
                                                            <tr key={i}>
                                                                <td className="text-slate-500">{i + 1}</td>
                                                                <td className="font-medium text-white">{kw.keyword}</td>
                                                                <td>{kw.impressions.toLocaleString()}</td>
                                                                <td>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 h-1.5 bg-navy-400/40 rounded-full overflow-hidden max-w-[80px]">
                                                                            <div
                                                                                className="h-full bg-electric rounded-full"
                                                                                style={{ width: `${total > 0 ? (kw.impressions / total) * 100 : 0}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs text-slate-400">
                                                                            {total > 0 ? ((kw.impressions / total) * 100).toFixed(1) : 0}%
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ));
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Connect GMB Insights */
                                <div className="glass-card p-6 space-y-5">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">📊</span>
                                        <div>
                                            <h4 className="text-base font-semibold text-white mb-1">Connect Performance Metrics</h4>
                                            <p className="text-sm text-slate-400">
                                                Get views, clicks, direction requests, and top search keywords from the{' '}
                                                <span className="text-electric-400">Business Profile Performance API</span>.
                                                Requires a Google OAuth token.
                                            </p>
                                            {data.metricsError && (
                                                <p className="text-xs text-red-400 mt-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                                                    {data.metricsError}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowInsightsForm(!showInsightsForm)}
                                        className="btn-secondary text-sm"
                                    >
                                        {showInsightsForm ? 'Hide Form' : 'Enter OAuth Credentials'}
                                    </button>

                                    {showInsightsForm && (
                                        <form onSubmit={handleInsights} className="space-y-4 border-t border-electric/10 pt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                    Location ID
                                                    <span className="text-slate-500 font-normal ml-1">(e.g. locations/1234567890123456)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={locationId}
                                                    onChange={(e) => setLocationId(e.target.value)}
                                                    placeholder="locations/XXXXXXXXXXXXXXXXX"
                                                    className="input-field font-mono text-sm"
                                                    disabled={insightsLoading}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                    OAuth Access Token
                                                    <a
                                                        href="https://developers.google.com/oauthplayground"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-electric-400 text-xs ml-2 hover:underline"
                                                    >
                                                        Get token ↗
                                                    </a>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={accessToken}
                                                    onChange={(e) => setAccessToken(e.target.value)}
                                                    placeholder="ya29.xxxxxxxxxxxxxxxx..."
                                                    className="input-field font-mono text-sm"
                                                    disabled={insightsLoading}
                                                />
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Scope required: <code className="text-electric-400">https://www.googleapis.com/auth/business.manage</code>
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={insightsLoading || !locationId.trim() || !accessToken.trim()}
                                                className="btn-primary text-sm"
                                            >
                                                {insightsLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Fetching metrics...
                                                    </span>
                                                ) : 'Load Performance Metrics'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Empty state */}
            {!data && !loading && !error && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Search for a business</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        Enter a business name and address to analyze its Google My Business profile, hours, photos, reviews, and performance metrics.
                    </p>
                </div>
            )}
        </section>
    );
}
