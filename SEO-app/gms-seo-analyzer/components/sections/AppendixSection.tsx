'use client';

import { useState } from 'react';
import { SectionWrapper } from '@/components/ui';
import type { AppendixData } from '@/types';

export default function AppendixSection({ data }: { data: AppendixData | null }) {
    const [showRaw, setShowRaw] = useState(false);

    return (
        <SectionWrapper id="appendix" title="Technical Appendix" icon="📎">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="glass-card p-4">
                    <p className="text-sm text-slate-400 mb-1">Total API Calls</p>
                    <p className="text-2xl font-bold text-white">{data?.totalApiCalls || 12}</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-slate-400 mb-1">Data Freshness</p>
                    <p className="text-2xl font-bold text-white">Live</p>
                    <p className="text-xs text-slate-500">{new Date().toLocaleString()}</p>
                </div>
            </div>

            {data?.responseTimes && data.responseTimes.length > 0 && (
                <div className="glass-card p-4 mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Response Times</h3>
                    <div className="space-y-2">
                        {data.responseTimes.map((rt, i) => (
                            <div key={i} className="flex justify-between items-center py-1 border-b border-electric/5">
                                <span className="text-sm text-white">{rt.module}</span>
                                <span className="text-sm text-slate-400">{rt.timeMs}ms</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="text-sm text-electric-400 hover:text-electric-300 transition-colors flex items-center gap-2"
                >
                    <svg className={`w-4 h-4 transition-transform ${showRaw ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {showRaw ? 'Hide' : 'Show'} Raw JSON Data
                </button>
                {showRaw && data?.rawData && (
                    <pre className="mt-4 p-4 rounded-xl bg-navy-800 border border-electric/10 text-xs text-slate-300 overflow-x-auto max-h-96">
                        {JSON.stringify(data.rawData, null, 2)}
                    </pre>
                )}
            </div>
        </SectionWrapper>
    );
}
