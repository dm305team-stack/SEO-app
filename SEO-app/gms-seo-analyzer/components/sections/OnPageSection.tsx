'use client';

import { useState } from 'react';
import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import type { OnPageData } from '@/types';
import { getSeverityLevel } from '@/types';

export default function OnPageSection({ data }: { data: OnPageData | null }) {
    const [expanded, setExpanded] = useState<number | null>(null);
    if (!data) return <NoDataCard module="On-Page SEO" />;

    const scoreSeverity = getSeverityLevel(data.onPageScore, { good: 70, warning: 40 });

    return (
        <SectionWrapper id="on-page" title="On-Page SEO" icon="📄" status={scoreSeverity}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard label="On-Page Score" value={data.onPageScore} color={scoreSeverity === 'good' ? 'success' : scoreSeverity === 'warning' ? 'warning' : 'critical'} />
                <MetricCard label="Critical Issues" value={data.criticalCount} color="critical" />
                <MetricCard label="Warnings" value={data.warningCount} color="warning" />
                <MetricCard label="Pages Crawled" value={data.crawledPages} />
            </div>

            {/* Score Gauge */}
            <div className="glass-card p-6 mb-6 flex items-center justify-center">
                <div className="relative w-40 h-40">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" stroke="#1E293B" strokeWidth="10" fill="none" />
                        <circle
                            cx="80" cy="80" r="70"
                            stroke={scoreSeverity === 'good' ? '#10B981' : scoreSeverity === 'warning' ? '#F59E0B' : '#EF4444'}
                            strokeWidth="10" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${(data.onPageScore / 100) * 440} 440`}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-white">{data.onPageScore}</span>
                            <span className="text-sm text-slate-400 block">/100</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Issues */}
            {data.issues?.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Issues Found</h3>
                    <div className="space-y-2">
                        {data.issues.map((issue, i) => {
                            const isOpen = expanded === i;
                            const borderColor = issue.severity === 'critical' ? 'border-red-500/20' : issue.severity === 'warning' ? 'border-amber-500/20' : 'border-slate-700/30';
                            const bgColor = issue.severity === 'critical' ? 'bg-red-500/5' : issue.severity === 'warning' ? 'bg-amber-500/5' : 'bg-slate-800/30';
                            const dotColor = issue.severity === 'critical' ? 'bg-red-400' : issue.severity === 'warning' ? 'bg-amber-400' : 'bg-slate-400';
                            const badgeColor = issue.severity === 'critical' ? 'bg-red-500/10 text-red-400' : issue.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700/50 text-slate-400';

                            return (
                                <div key={i} className={`rounded-lg border ${borderColor} ${bgColor} overflow-hidden`}>
                                    {/* Header row — clickable */}
                                    <button
                                        onClick={() => setExpanded(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                                            <span className="text-sm font-medium text-white">{issue.type}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-sm text-slate-400">{issue.count} page(s)</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                                                {issue.severity.toUpperCase()}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Expanded detail */}
                                    {isOpen && issue.description && (
                                        <div className="px-4 pb-4 pt-1 border-t border-white/5">
                                            <p className="text-sm text-slate-300 leading-relaxed">{issue.description}</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Affected pages:</span>
                                                <span className={`text-xs font-bold ${issue.severity === 'critical' ? 'text-red-400' : issue.severity === 'warning' ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    {issue.count}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
}
