'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { LabsData } from '@/types';

export default function LabsSection({ data }: { data: LabsData | null }) {
    if (!data) return <NoDataCard module="DataForSEO Labs" />;

    return (
        <SectionWrapper id="labs" title="DataForSEO Labs" icon="🧪">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MetricCard label="Estimated Traffic" value={formatNumber(data.estimatedTraffic)} color="electric" />
                <MetricCard label="Competitors Found" value={data.competitors?.length || 0} />
            </div>

            {data.competitors?.length > 0 && (
                <div className="overflow-x-auto">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Organic Competitors</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Domain</th>
                                <th>Organic Traffic</th>
                                <th>Organic Keywords</th>
                                <th>Avg. Position</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.competitors.map((c, i) => (
                                <tr key={i}>
                                    <td className="font-medium text-white">{c.domain}</td>
                                    <td>{formatNumber(c.organicTraffic)}</td>
                                    <td>{formatNumber(c.organicKeywords)}</td>
                                    <td>{c.rank}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </SectionWrapper>
    );
}
