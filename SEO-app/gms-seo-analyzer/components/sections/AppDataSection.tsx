'use client';

import { SectionWrapper, NoDataCard } from '@/components/ui';
import type { AppData } from '@/types';

export default function AppDataSection({ data }: { data: AppData | null }) {
    if (!data || !data.hasApp) return (
        <SectionWrapper id="app-data" title="App Data" icon="📱">
            <NoDataCard module="App Data" />
        </SectionWrapper>
    );

    return (
        <SectionWrapper id="app-data" title="App Data" icon="📱">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.apps.map((app, i) => (
                    <div key={i} className="glass-card p-4">
                        <h4 className="font-semibold text-white mb-2">{app.title}</h4>
                        <div className="space-y-1 text-sm text-slate-400">
                            {app.rating && <p>Rating: <span className="text-amber-400">★ {app.rating}</span></p>}
                            {app.reviews && <p>Reviews: {app.reviews.toLocaleString()}</p>}
                            {app.installs && <p>Installs: {app.installs}</p>}
                            {app.url && <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:underline">View in Store</a>}
                        </div>
                    </div>
                ))}
            </div>
        </SectionWrapper>
    );
}
