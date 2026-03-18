'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import type { ContentData } from '@/types';

export default function ContentSection({ data }: { data: ContentData | null }) {
    if (!data) return <NoDataCard module="Content Analysis" />;

    return (
        <SectionWrapper id="content" title="Content Analysis" icon="📝">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard label="Content Score" value={data.contentScore || 0} color={data.contentScore && data.contentScore > 60 ? 'success' : 'warning'} />
                <MetricCard label="Total Content" value={data.totalContent} />
                <MetricCard label="Duplicate Warnings" value={data.duplicateWarnings} color={data.duplicateWarnings > 0 ? 'warning' : 'success'} />
                <MetricCard label="Readability" value={data.readabilityScore || 'N/A'} />
            </div>

            {data.topContent?.length > 0 && (
                <div className="overflow-x-auto">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Content</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>URL</th>
                                <th>Score</th>
                                <th>Word Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topContent.map((c, i) => (
                                <tr key={i}>
                                    <td className="font-medium text-white max-w-[200px] truncate">{c.title || 'Untitled'}</td>
                                    <td>
                                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:underline truncate block max-w-[200px]">
                                            {c.url}
                                        </a>
                                    </td>
                                    <td>{c.score || 'N/A'}</td>
                                    <td>{c.wordCount || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </SectionWrapper>
    );
}
