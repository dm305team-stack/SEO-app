'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { AiOptimizationData } from '@/types';

export default function AiOptimizationSection({ data }: { data: AiOptimizationData | null }) {
    if (!data) return <NoDataCard module="AI Optimization" />;

    return (
        <SectionWrapper id="ai-optimization" title="AI Optimization" icon="🤖">
            {/* Optimization Tips */}
            {data.optimizationTips?.length > 0 && (
                <div className="glass-card p-6 mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Optimization Tips</h3>
                    <div className="space-y-2">
                        {data.optimizationTips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-electric/5 border border-electric/10">
                                <span className="text-electric-400 font-bold text-sm mt-0.5">{i + 1}</span>
                                <p className="text-sm text-slate-300">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Keyword Suggestions */}
            {data.keywordSuggestions?.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Keyword Suggestions</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Keyword</th>
                                    <th>Search Volume</th>
                                    <th>Difficulty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.keywordSuggestions.slice(0, 15).map((s, i) => (
                                    <tr key={i}>
                                        <td className="font-medium text-white">{s.keyword}</td>
                                        <td>{formatNumber(s.searchVolume)}</td>
                                        <td>
                                            <span className={`${(s.difficulty || 0) > 70 ? 'text-red-400' :
                                                    (s.difficulty || 0) > 40 ? 'text-amber-400' : 'text-emerald-400'
                                                }`}>
                                                {s.difficulty || 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Sentiment */}
            {data.sentimentAnalysis && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <MetricCard label="Positive" value={`${data.sentimentAnalysis.score}%`} color="success" />
                    <MetricCard label="Overall" value={data.sentimentAnalysis.overall} />
                </div>
            )}
        </SectionWrapper>
    );
}
