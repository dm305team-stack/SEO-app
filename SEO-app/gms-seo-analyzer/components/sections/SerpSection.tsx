'use client';

import { SectionWrapper, NoDataCard } from '@/components/ui';
import type { SerpData } from '@/types';
import { getSeverityLevel } from '@/types';

export default function SerpSection({ data }: { data: SerpData | null }) {
    if (!data || !data.results?.length) return <NoDataCard module="SERP" />;

    return (
        <SectionWrapper id="serp" title="SERP Data" icon="🔍">
            {/* SERP Features */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">SERP Features</h3>
                <div className="flex flex-wrap gap-2">
                    {data.features?.map((f) => (
                        <span
                            key={f.type}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${f.present
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                                }`}
                        >
                            {f.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            {f.present ? ' ✓' : ' ✗'}
                        </span>
                    ))}
                </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="w-16">Pos.</th>
                            <th>Title</th>
                            <th className="hidden md:table-cell">URL</th>
                            <th className="hidden lg:table-cell">Snippet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.results.map((r, i) => {
                            const severity = getSeverityLevel(
                                r.position <= 3 ? 90 : r.position <= 7 ? 60 : 30,
                                { good: 80, warning: 50 }
                            );
                            return (
                                <tr key={i}>
                                    <td>
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${severity === 'good' ? 'bg-emerald-500/10 text-emerald-400' :
                                                severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-red-500/10 text-red-400'
                                            }`}>
                                            {r.position}
                                        </span>
                                    </td>
                                    <td className="font-medium text-white max-w-[300px] truncate">{r.title}</td>
                                    <td className="hidden md:table-cell">
                                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:underline truncate block max-w-[250px]">
                                            {r.url}
                                        </a>
                                    </td>
                                    <td className="hidden lg:table-cell text-slate-400 max-w-[300px] truncate">{r.snippet}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </SectionWrapper>
    );
}
