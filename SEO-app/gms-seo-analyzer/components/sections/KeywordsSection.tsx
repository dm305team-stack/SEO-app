'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import { formatNumber, formatCurrency } from '@/lib/utils';
import type { KeywordsData } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function KeywordsSection({ data }: { data: KeywordsData | null }) {
    if (!data || !data.keywords?.length) return <NoDataCard module="Keywords" />;

    const top10 = (data.topKeywords && data.topKeywords.length > 0) ? data.topKeywords : data.keywords.slice(0, 10);
    const avgCpc = top10.length > 0 ? top10.reduce((s, k) => s + (k.cpc || 0), 0) / top10.length : 0;
    const chartData = top10.map((k) => ({
        name: k.keyword.length > 20 ? k.keyword.slice(0, 20) + '…' : k.keyword,
        volume: k.searchVolume,
    }));

    const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#2563EB', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#2563EB', '#1D4ED8'];

    return (
        <SectionWrapper id="keywords" title="Keywords Data" icon="🔑">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard label="Total Keywords" value={formatNumber(data.totalKeywords)} />
                <MetricCard label="Avg. Difficulty" value={Math.round(data.avgDifficulty || 0)} color={data.avgDifficulty && data.avgDifficulty > 60 ? 'critical' : 'success'} />
                <MetricCard label="Top Keyword Vol." value={formatNumber(top10[0]?.searchVolume)} />
                <MetricCard label="Avg. CPC" value={formatCurrency(avgCpc)} />
            </div>

            {/* Bar Chart */}
            <div className="glass-card p-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Top Keywords by Search Volume</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ background: '#1A2544', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="volume" radius={[0, 6, 6, 0]}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={colors[i % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Keywords Table */}
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Keyword</th>
                            <th>Volume</th>
                            <th>CPC</th>
                            <th>Competition</th>
                            <th>Difficulty</th>
                            <th>Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.keywords.slice(0, 20).map((k, i) => (
                            <tr key={i}>
                                <td className="font-medium text-white">{k.keyword}</td>
                                <td>{formatNumber(k.searchVolume)}</td>
                                <td>{formatCurrency(k.cpc)}</td>
                                <td>{k.competitionLevel}</td>
                                <td>
                                    <span className={`${(k.keywordDifficulty || 0) > 70 ? 'text-red-400' :
                                        (k.keywordDifficulty || 0) > 40 ? 'text-amber-400' : 'text-emerald-400'
                                        }`}>
                                        {k.keywordDifficulty || 'N/A'}
                                    </span>
                                </td>
                                <td>{k.position || '–'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SectionWrapper>
    );
}
