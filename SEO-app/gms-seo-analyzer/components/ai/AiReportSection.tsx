'use client';

import { SectionWrapper } from '@/components/ui';
import type { AiReportData } from '@/types';

interface AiReportSectionProps {
    data: AiReportData | null;
    loading: boolean;
    error?: string;
    onRetry?: () => void;
}

export default function AiReportSection({ data, loading, error, onRetry }: AiReportSectionProps) {
    if (loading) {
        return (
            <SectionWrapper id="ai-report" title="AI SEO Report" icon="✨">
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-electric-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">AI is analyzing your data…</h3>
                    <p className="text-slate-400 text-sm">This usually takes 15–30 seconds</p>
                </div>
            </SectionWrapper>
        );
    }

    if (error) {
        return (
            <SectionWrapper id="ai-report" title="AI SEO Report" icon="✨">
                <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-400 text-sm mb-4">AI report temporarily unavailable. Please try again.</p>
                    {onRetry && (
                        <button onClick={onRetry} className="btn-primary text-sm">
                            Retry AI Report
                        </button>
                    )}
                </div>
            </SectionWrapper>
        );
    }

    if (!data?.report) return null;

    return (
        <SectionWrapper id="ai-report" title="AI SEO Report" icon="✨">
            <div className="prose prose-invert max-w-none">
                {data.sections && data.sections.length > 0 ? (
                    <div className="space-y-8">
                        {data.sections.map((section, i) => (
                            <div key={i} className="glass-card p-6">
                                <h3 className="text-lg font-bold text-electric-400 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                                    {section.title}
                                </h3>
                                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-6">
                        <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {data.report}
                        </div>
                    </div>
                )}
            </div>
        </SectionWrapper>
    );
}
