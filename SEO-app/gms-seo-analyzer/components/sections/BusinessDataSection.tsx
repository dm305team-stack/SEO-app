'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import type { BusinessData } from '@/types';

export default function BusinessDataSection({ data }: { data: BusinessData | null }) {
    if (!data || !data.hasProfile) return (
        <SectionWrapper id="business" title="Business Data" icon="🏢">
            <NoDataCard module="Business Data" />
        </SectionWrapper>
    );

    return (
        <SectionWrapper id="business" title="Business Data" icon="🏢">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MetricCard label="Rating" value={data.rating ? `★ ${data.rating}` : 'N/A'} color={data.rating && data.rating >= 4 ? 'success' : 'warning'} />
                <MetricCard label="Reviews" value={data.reviewCount || 0} />
                <MetricCard label="Category" value={data.category || 'N/A'} />
            </div>

            <div className="glass-card p-6 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {data.name && <div><span className="text-slate-500">Name:</span> <span className="text-white ml-2">{data.name}</span></div>}
                    {data.address && <div><span className="text-slate-500">Address:</span> <span className="text-white ml-2">{data.address}</span></div>}
                    {data.phone && <div><span className="text-slate-500">Phone:</span> <span className="text-white ml-2">{data.phone}</span></div>}
                    {data.website && <div><span className="text-slate-500">Website:</span> <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:underline ml-2">{data.website}</a></div>}
                </div>
            </div>

            {data.reviews && data.reviews.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Reviews</h3>
                    <div className="space-y-3">
                        {data.reviews.slice(0, 5).map((r, i) => (
                            <div key={i} className="glass-card p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-white">{r.author}</span>
                                    <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                </div>
                                <p className="text-sm text-slate-400">{r.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
}
