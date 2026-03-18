'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import type { TrendsData } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function TrendsSection({ data }: { data: TrendsData | null }) {
    if (!data || !data.interestOverTime?.length) return <NoDataCard module="Google Trends" />;

    const trendColor = data.trendDirection === 'rising' ? '#10B981' :
        data.trendDirection === 'declining' ? '#EF4444' : '#F59E0B';

    const trendIcon = data.trendDirection === 'rising' ? '📈' :
        data.trendDirection === 'declining' ? '📉' : '➡️';

    const trendLabel = data.trendDirection === 'rising' ? 'Rising' :
        data.trendDirection === 'declining' ? 'Declining' : 'Stable';

    // Format dates for chart
    const chartData = data.interestOverTime.map(p => ({
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: p.value,
    }));

    return (
        <SectionWrapper id="trends" title="Google Trends" icon="📈">
            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard label="Keyword" value={`"${data.keyword}"`} />
                <MetricCard label="Avg. Interest" value={data.averageInterest} />
                <MetricCard
                    label="Peak Interest"
                    value={data.peakInterest.value}
                    color={data.peakInterest.value >= 80 ? 'success' : undefined}
                />
                <MetricCard
                    label="Trend Direction"
                    value={`${trendIcon} ${trendLabel}`}
                    color={data.trendDirection === 'rising' ? 'success' :
                        data.trendDirection === 'declining' ? 'critical' : 'warning'}
                />
            </div>

            {/* Interest Over Time Chart */}
            <div className="glass-card p-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Interest Over Time (Past 12 Months)</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                            <defs>
                                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fill: '#94A3B8', fontSize: 12 }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#1A2544',
                                    border: '1px solid rgba(59,130,246,0.2)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                                labelStyle={{ color: '#94A3B8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={trendColor}
                                strokeWidth={2}
                                fill="url(#trendGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two columns: Rising Queries + Interest by Region */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rising Queries */}
                {data.risingQueries.length > 0 && (
                    <div className="glass-card p-4">
                        <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                            🔥 Rising Queries
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Breakout</span>
                        </h3>
                        <div className="space-y-3">
                            {data.risingQueries.map((q, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-white text-sm">{q.query}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 rounded-full bg-slate-700 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                style={{ width: `${Math.min(q.value, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-emerald-400 text-xs font-mono w-10 text-right">
                                            {q.value >= 5000 ? '⚡' : `+${q.value}%`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Queries */}
                {data.relatedQueries.length > 0 && (
                    <div className="glass-card p-4">
                        <h3 className="text-sm font-semibold text-slate-400 mb-4">🔎 Related Queries</h3>
                        <div className="space-y-3">
                            {data.relatedQueries.map((q, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-white text-sm">{q.query}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 rounded-full bg-slate-700 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                                                style={{ width: `${Math.min(q.value, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-blue-400 text-xs font-mono w-10 text-right">{q.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Interest by Region */}
            {data.interestByRegion.length > 0 && (
                <div className="glass-card p-4 mt-6">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4">🗺️ Interest by Region</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Region</th>
                                    <th>Interest Score</th>
                                    <th>Popularity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.interestByRegion.map((r, i) => (
                                    <tr key={i}>
                                        <td className="font-medium text-white">{r.region}</td>
                                        <td>{r.value}</td>
                                        <td>
                                            <div className="w-32 h-2 rounded-full bg-slate-700 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-electric to-electric-light"
                                                    style={{ width: `${r.value}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
}
