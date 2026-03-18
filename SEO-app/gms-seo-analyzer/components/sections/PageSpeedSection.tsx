'use client';

import type { PageSpeedData } from '@/app/api/google/pagespeed/route';
import { SectionWrapper, NoDataCard } from '@/components/ui';

type Rating = 'good' | 'needs-improvement' | 'poor';

function ScoreRing({ score, label }: { score: number; label: string }) {
    const color = score >= 90 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
    const radius = 36;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    return (
        <div className="glass-card p-4 flex flex-col items-center gap-2">
            <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={radius} fill="none" stroke="#1A2544" strokeWidth="8" />
                <circle
                    cx="45" cy="45" r={radius}
                    fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text x="45" y="50" textAnchor="middle" fill={color} fontSize="20" fontWeight="700">{score}</text>
            </svg>
            <p className="text-xs text-slate-400 font-medium text-center">{label}</p>
        </div>
    );
}

function VitalBadge({ label, value, unit, rating }: { label: string; value: number; unit: string; rating: Rating }) {
    const colors: Record<Rating, string> = {
        good: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'needs-improvement': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        poor: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    const dot: Record<Rating, string> = {
        good: 'bg-emerald-400',
        'needs-improvement': 'bg-amber-400',
        poor: 'bg-red-400',
    };
    return (
        <div className={`glass-card p-4 border ${colors[rating]}`}>
            <div className="flex items-center gap-1.5 mb-2">
                <span className={`w-2 h-2 rounded-full ${dot[rating]}`} />
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">
                {unit === 'ms' ? (value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`) : value.toString()}
                {unit !== 'ms' && unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
            </p>
            <p className="text-xs mt-1 capitalize" style={{ color: rating === 'good' ? '#10B981' : rating === 'needs-improvement' ? '#F59E0B' : '#EF4444' }}>
                {rating.replace('-', ' ')}
            </p>
        </div>
    );
}

export default function PageSpeedSection({ data, loading }: { data: PageSpeedData | null; loading?: boolean }) {
    if (loading && !data) {
        return (
            <SectionWrapper id="pagespeed" title="PageSpeed & Core Web Vitals" icon="⚡">
                <div className="animate-pulse space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-700/40 rounded-xl" />)}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-700/40 rounded-xl" />)}
                    </div>
                </div>
            </SectionWrapper>
        );
    }

    if (!data) return <NoDataCard module="PageSpeed" />;

    const cwv = data.coreWebVitals;

    return (
        <SectionWrapper id="pagespeed" title="PageSpeed & Core Web Vitals" icon="⚡">
            {/* Lighthouse Scores */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    Lighthouse Scores
                    <span className="text-xs normal-case font-normal text-slate-500">({data.strategy})</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ScoreRing score={data.performanceScore} label="Performance" />
                    <ScoreRing score={data.accessibilityScore} label="Accessibility" />
                    <ScoreRing score={data.bestPracticesScore} label="Best Practices" />
                    <ScoreRing score={data.seoScore} label="SEO" />
                </div>
            </div>

            {/* Core Web Vitals */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Core Web Vitals</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <VitalBadge label="LCP" value={cwv.lcp.value} unit={cwv.lcp.unit} rating={cwv.lcp.rating} />
                    <VitalBadge label="CLS" value={cwv.cls.value} unit={cwv.cls.unit} rating={cwv.cls.rating} />
                    <VitalBadge label="FCP" value={cwv.fcp.value} unit={cwv.fcp.unit} rating={cwv.fcp.rating} />
                    <VitalBadge label="TTFB" value={cwv.ttfb.value} unit={cwv.ttfb.unit} rating={cwv.ttfb.rating} />
                    <VitalBadge label="TBT" value={cwv.tbt.value} unit={cwv.tbt.unit} rating={cwv.tbt.rating} />
                    <VitalBadge label="Speed Index" value={cwv.si.value} unit={cwv.si.unit} rating={cwv.si.rating} />
                </div>
            </div>

            {/* Screenshot */}
            {data.screenshot && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Page Screenshot</h3>
                    <div className="glass-card overflow-hidden inline-block">
                        <img src={data.screenshot} alt="Page screenshot" className="max-w-xs rounded-lg" />
                    </div>
                </div>
            )}

            {/* Opportunities */}
            {data.opportunities.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Opportunities <span className="font-normal text-slate-500 normal-case">— potential speed improvements</span>
                    </h3>
                    <div className="space-y-3">
                        {data.opportunities.map((opp, i) => (
                            <div key={i} className="glass-card p-4 flex items-start gap-3">
                                <span className="text-amber-400 mt-0.5">⚠️</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-white">{opp.title}</p>
                                        {opp.savings && (
                                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                {opp.savings}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{opp.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Diagnostics */}
            {data.diagnostics.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Diagnostics</h3>
                    <div className="space-y-2">
                        {data.diagnostics.map((diag, i) => (
                            <div key={i} className="glass-card p-4 flex items-start gap-3">
                                <span className="text-slate-400 mt-0.5">ℹ️</span>
                                <div>
                                    <p className="text-sm font-medium text-white">{diag.title}</p>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{diag.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
}
