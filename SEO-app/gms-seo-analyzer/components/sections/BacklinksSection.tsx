'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { BacklinksSummary } from '@/types';
import { getSeverityLevel } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function BacklinksSection({ data }: { data: BacklinksSummary | null }) {
    if (!data) return <NoDataCard module="Backlinks" />;

    const severity = getSeverityLevel(data.totalBacklinks, { good: 100, warning: 10 });
    const pieData = [
        { name: 'Dofollow', value: data.dofollow || 0, color: '#3B82F6' },
        { name: 'Nofollow', value: data.nofollow || 0, color: '#64748B' },
    ];

    return (
        <SectionWrapper id="backlinks" title="Backlinks" icon="🔗" status={severity}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard label="Total Backlinks" value={formatNumber(data.totalBacklinks)} color="electric" />
                <MetricCard label="Referring Domains" value={formatNumber(data.referringDomains)} />
                <MetricCard label="Domain Rank" value={data.domainRank} color={data.domainRank > 50 ? 'success' : 'warning'} />
                <MetricCard label="Dofollow" value={formatNumber(data.dofollow)} color="success" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Dofollow vs Nofollow Pie */}
                <div className="glass-card p-4">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4">Dofollow vs Nofollow</h3>
                    <div className="h-52 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1A2544', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2">
                        {pieData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                                <span className="text-xs text-slate-400">{entry.name}: {formatNumber(entry.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Referring Domains */}
                <div className="glass-card p-4">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4">Top Referring Domains</h3>
                    <div className="space-y-2">
                        {data.topReferringDomains?.slice(0, 8).map((d, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-electric/5">
                                <span className="text-sm text-white truncate flex-1">{d.domain}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-400">{formatNumber(d.backlinks)} links</span>
                                    <span className="text-xs text-electric-400">Rank: {d.rank}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
