'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingScreen from '@/components/ui';
import SerpSection from '@/components/sections/SerpSection';
import KeywordsSection from '@/components/sections/KeywordsSection';
import DomainAnalyticsSection from '@/components/sections/DomainAnalyticsSection';
import BacklinksSection from '@/components/sections/BacklinksSection';
import OnPageSection from '@/components/sections/OnPageSection';
import ContentSection from '@/components/sections/ContentSection';
import LabsSection from '@/components/sections/LabsSection';
import TrendsSection from '@/components/sections/TrendsSection';
import BusinessDataSection from '@/components/sections/BusinessDataSection';
import AiOptimizationSection from '@/components/sections/AiOptimizationSection';
import AiReportSection from '@/components/ai/AiReportSection';
import AppendixSection from '@/components/sections/AppendixSection';
import PageSpeedSection from '@/components/sections/PageSpeedSection';
import type {
    ModuleName, ModuleStatus,
    SerpData, KeywordsData, DomainAnalyticsData, LabsData,
    BacklinksSummary, OnPageData, ContentData, BusinessData,
    TrendsData, AiOptimizationData, AppendixData, AiReportData,
} from '@/types';
import type { PageSpeedData } from '@/app/api/google/pagespeed/route';

type SeoModuleId = ModuleName | 'pagespeed' | 'ai-report';

interface ModuleConfig {
    id: SeoModuleId;
    label: string;
    icon: string;
    description: string;
    group: 'core' | 'technical' | 'content' | 'ai';
}

const MODULES: ModuleConfig[] = [
    { id: 'domain-analytics', label: 'Domain Analytics', icon: '📈', description: 'Domain authority & traffic', group: 'core' },
    { id: 'serp', label: 'SERP Results', icon: '🔍', description: 'Rankings & search features', group: 'core' },
    { id: 'keywords', label: 'Keywords', icon: '🗝️', description: 'Keyword rankings & difficulty', group: 'core' },
    { id: 'backlinks', label: 'Backlinks', icon: '🔗', description: 'Link profile & referring domains', group: 'core' },
    { id: 'pagespeed', label: 'PageSpeed', icon: '⚡', description: 'Core Web Vitals & performance', group: 'technical' },
    { id: 'on-page', label: 'On-Page SEO', icon: '📋', description: 'Issues by severity', group: 'technical' },
    { id: 'content', label: 'Content', icon: '📝', description: 'Content quality & readability', group: 'content' },
    { id: 'labs', label: 'Competitors', icon: '🏆', description: 'Competitor landscape', group: 'core' },
    { id: 'trends', label: 'Trends', icon: '📊', description: 'Google Trends over time', group: 'content' },
    { id: 'business', label: 'Business Profile', icon: '🏢', description: 'Google Maps presence', group: 'core' },
    { id: 'ai-optimization', label: 'AI Suggestions', icon: '🤖', description: 'AI-powered keyword tips', group: 'ai' },
    { id: 'appendix', label: 'Appendix', icon: '📎', description: 'Raw data & metadata', group: 'technical' },
    { id: 'ai-report', label: 'AI Report', icon: '✨', description: 'Full AI-generated audit', group: 'ai' },
];

const GROUP_LABELS: Record<string, string> = {
    core: 'Core Analysis',
    technical: 'Technical',
    content: 'Content',
    ai: 'AI',
};

function SeoDashboard() {
    const searchParams = useSearchParams();
    const domain = searchParams.get('domain') || '';

    const [activeModule, setActiveModule] = useState<SeoModuleId>('domain-analytics');
    const [moduleStatus, setModuleStatus] = useState<Partial<Record<SeoModuleId, ModuleStatus>>>({});
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Data state per module
    const [serpData, setSerpData] = useState<SerpData | null>(null);
    const [keywordsData, setKeywordsData] = useState<KeywordsData | null>(null);
    const [domainAnalyticsData, setDomainAnalyticsData] = useState<DomainAnalyticsData | null>(null);
    const [backlinksData, setBacklinksData] = useState<BacklinksSummary | null>(null);
    const [onPageData, setOnPageData] = useState<OnPageData | null>(null);
    const [contentData, setContentData] = useState<ContentData | null>(null);
    const [labsData, setLabsData] = useState<LabsData | null>(null);
    const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
    const [businessData, setBusinessData] = useState<BusinessData | null>(null);
    const [aiOptData, setAiOptData] = useState<AiOptimizationData | null>(null);
    const [appendixData, setAppendixData] = useState<AppendixData | null>(null);
    const [aiReportData, setAiReportData] = useState<AiReportData | null>(null);
    const [pageSpeedData, setPageSpeedData] = useState<PageSpeedData | null>(null);

    const setStatus = useCallback((id: SeoModuleId, status: ModuleStatus) => {
        setModuleStatus((prev) => ({ ...prev, [id]: status }));
    }, []);

    const fetchModule = useCallback(async (id: SeoModuleId, endpoint: string, payload: Record<string, unknown>, setter: (d: unknown) => void) => {
        setStatus(id, 'loading');
        try {
            const res = await axios.post(endpoint, payload);
            if (res.data.success) {
                setter(res.data.data);
                setStatus(id, 'success');
            } else {
                setStatus(id, 'error');
            }
        } catch {
            setStatus(id, 'error');
        }
    }, [setStatus]);

    const hasRun = useRef(false);

    useEffect(() => {
        if (!domain || hasRun.current) return;
        hasRun.current = true;

        const runAll = async () => {
            // Run all DataForSEO modules in parallel
            await Promise.allSettled([
                fetchModule('serp', '/api/dataforseo/serp', { domain }, setSerpData),
                fetchModule('keywords', '/api/dataforseo/keywords', { domain }, setKeywordsData),
                fetchModule('domain-analytics', '/api/dataforseo/domain-analytics', { domain }, setDomainAnalyticsData),
                fetchModule('backlinks', '/api/dataforseo/backlinks', { domain }, setBacklinksData),
                fetchModule('on-page', '/api/dataforseo/on-page', { domain }, setOnPageData),
                fetchModule('content', '/api/dataforseo/content', { domain }, setContentData),
                fetchModule('labs', '/api/dataforseo/labs', { domain }, setLabsData),
                fetchModule('trends', '/api/dataforseo/trends', { domain }, setTrendsData),
                fetchModule('business', '/api/dataforseo/business', { domain }, setBusinessData),
                fetchModule('ai-optimization', '/api/dataforseo/ai-optimization', { domain }, setAiOptData),
                fetchModule('appendix', '/api/dataforseo/appendix', { domain }, setAppendixData),
                fetchModule('pagespeed', '/api/google/pagespeed', { domain, strategy: 'mobile' }, setPageSpeedData),
            ]);

            setIsInitialLoading(false);

            // AI report after everything else
            fetchModule('ai-report', '/api/ai/report', { domain }, setAiReportData);
        };

        runAll();
    }, [domain, fetchModule]);

    // Map ModuleName -> ModuleStatus for LoadingScreen (only uses ModuleName keys)
    const legacyStatus = moduleStatus as Partial<Record<ModuleName, ModuleStatus>>;

    const renderSection = () => {
        switch (activeModule) {
            case 'serp': return <SerpSection data={serpData} />;
            case 'keywords': return <KeywordsSection data={keywordsData} />;
            case 'domain-analytics': return <DomainAnalyticsSection data={domainAnalyticsData} />;
            case 'backlinks': return <BacklinksSection data={backlinksData} />;
            case 'on-page': return <OnPageSection data={onPageData} />;
            case 'content': return <ContentSection data={contentData} />;
            case 'labs': return <LabsSection data={labsData} />;
            case 'trends': return <TrendsSection data={trendsData} />;
            case 'business': return <BusinessDataSection data={businessData} />;
            case 'ai-optimization': return <AiOptimizationSection data={aiOptData} />;
            case 'appendix': return <AppendixSection data={appendixData} />;
            case 'ai-report': return <AiReportSection data={aiReportData} loading={moduleStatus['ai-report'] === 'loading'} />;
            case 'pagespeed': return <PageSpeedSection data={pageSpeedData} loading={moduleStatus['pagespeed'] === 'loading'} />;
            default: return null;
        }
    };

    const getStatusDot = (id: SeoModuleId) => {
        const s = moduleStatus[id];
        if (s === 'loading') return <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />;
        if (s === 'success') return <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />;
        if (s === 'error') return <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />;
        return <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />;
    };

    if (isInitialLoading && domain) {
        return <LoadingScreen modules={legacyStatus} />;
    }

    const groups = ['core', 'technical', 'content', 'ai'] as const;

    return (
        <div className="min-h-screen flex flex-col">
            <Header domain={domain || undefined} />

            <div className="flex-1 flex max-w-[1440px] mx-auto w-full">
                {/* Sidebar */}
                <aside className="hidden lg:block w-72 flex-shrink-0">
                    <nav className="sticky top-[73px] p-4 space-y-1 max-h-[calc(100vh-73px)] overflow-y-auto">
                        {groups.map((group) => {
                            const groupModules = MODULES.filter((m) => m.group === group);
                            return (
                                <div key={group}>
                                    <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider px-4 mb-2 mt-3">
                                        {GROUP_LABELS[group]}
                                    </p>
                                    {groupModules.map((mod) => (
                                        <button
                                            key={mod.id}
                                            onClick={() => setActiveModule(mod.id)}
                                            className={`w-full text-left sidebar-link group ${activeModule === mod.id ? 'active' : ''}`}
                                        >
                                            <span className="text-lg flex-shrink-0">{mod.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-sm font-medium truncate">{mod.label}</span>
                                                <span className="block text-[11px] text-slate-500 truncate">{mod.description}</span>
                                            </div>
                                            {getStatusDot(mod.id)}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}

                        <div className="border-t border-electric/10 my-3" />
                        <a href={`/analyze?domain=${encodeURIComponent(domain)}`} className="w-full text-left sidebar-link flex items-center gap-3">
                            <span className="text-lg">🔬</span>
                            <div className="flex-1 min-w-0">
                                <span className="block text-sm font-medium">Advanced Tools</span>
                                <span className="block text-[11px] text-slate-500">Browser, Crawl, Scraper</span>
                            </div>
                        </a>
                        <a href={`/local-business`} className="w-full text-left sidebar-link flex items-center gap-3">
                            <span className="text-lg">🗺️</span>
                            <div className="flex-1 min-w-0">
                                <span className="block text-sm font-medium">Local Business</span>
                                <span className="block text-[11px] text-slate-500">Google My Business</span>
                            </div>
                        </a>
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-6 overflow-hidden">
                    {/* Domain header */}
                    {domain && (
                        <div className="glass-card p-4 mb-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center text-electric-400">
                                🌐
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-semibold">{domain}</p>
                                <p className="text-xs text-slate-400">
                                    {Object.values(moduleStatus).filter((s) => s === 'success').length} / {MODULES.length} modules loaded
                                </p>
                            </div>
                            <a
                                href={`/seo?domain=${encodeURIComponent(domain)}`}
                                className="btn-secondary text-xs px-3 py-1.5"
                                onClick={(e) => { e.preventDefault(); hasRun.current = false; window.location.reload(); }}
                            >
                                ↻ Re-analyze
                            </a>
                        </div>
                    )}

                    {!domain ? (
                        <div className="glass-card p-16 text-center">
                            <div className="text-5xl mb-4">🔍</div>
                            <h2 className="text-xl font-bold text-white mb-2">No domain provided</h2>
                            <p className="text-slate-400 text-sm mb-6">Go back to the home page and enter a domain to analyze.</p>
                            <a href="/" className="btn-primary inline-block">← Back to Home</a>
                        </div>
                    ) : (
                        renderSection()
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default function SeoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="loading-bar w-40" /></div>}>
            <SeoDashboard />
        </Suspense>
    );
}
