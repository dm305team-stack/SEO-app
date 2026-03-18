'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import type { OnPageData } from '@/types';
import { getSeverityLevel } from '@/types';

export default function OnPageSection({ data }: { data: OnPageData | null }) {
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
                        {data.issues.map((issue, i) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${issue.severity === 'critical' ? 'bg-red-500/5 border border-red-500/10' :
                                    issue.severity === 'warning' ? 'bg-amber-500/5 border border-amber-500/10' :
                                        'bg-slate-800/30 border border-slate-700/30'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${issue.severity === 'critical' ? 'bg-red-400' :
                                            issue.severity === 'warning' ? 'bg-amber-400' : 'bg-slate-400'
                                        }`} />
                                    <span className="text-sm text-white">{issue.type}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-400">{issue.count} page(s)</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${issue.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                                            issue.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-slate-700/50 text-slate-400'
                                        }`}>
                                        {issue.severity.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
}
