'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompareRadarChart from '@/components/compare/RadarChart';
import CompareTable from '@/components/compare/CompareTable';
import AiReportSection from '@/components/ai/AiReportSection';
import LoadingScreen from '@/components/ui';
import type { ModuleName, ModuleStatus, AnalysisData, DomainComparison, AiReportData } from '@/types';

const MODULE_LIST: ModuleName[] = [
    'serp', 'keywords', 'domain-analytics', 'labs', 'backlinks',
    'on-page', 'content', 'merchant', 'app-data', 'business',
    'appendix', 'ai-optimization', 'trends',
];

const moduleKeys: Record<ModuleName, keyof AnalysisData> = {
    'serp': 'serp',
    'keywords': 'keywords',
    'domain-analytics': 'domainAnalytics',
    'labs': 'labs',
    'backlinks': 'backlinks',
    'on-page': 'onPage',
    'content': 'content',
    'merchant': 'merchant',
    'app-data': 'appData',
    'business': 'business',
    'appendix': 'appendix',
    'ai-optimization': 'aiOptimization',
    'trends': 'trends',
};

function CompareContent() {
    const searchParams = useSearchParams();
    const domainsParam = searchParams.get('domains') || '';
    const domains = domainsParam.split(',').filter(Boolean);

    const [activeDomain, setActiveDomain] = useState(domains[0] || '');
    const [modulesStatus, setModulesStatus] = useState<Partial<Record<ModuleName, ModuleStatus>>>({});
    const [allAnalysisData, setAllAnalysisData] = useState<Record<string, Partial<AnalysisData>>>({});
    const [comparisons, setComparisons] = useState<DomainComparison[]>([]);
    const [aiReport, setAiReport] = useState<AiReportData | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    const fetchDomainData = useCallback(async (domain: string): Promise<Partial<AnalysisData>> => {
        const results: Partial<AnalysisData> = { domain };

        const moduleResults = await Promise.allSettled(
            MODULE_LIST.map(async (module) => {
                setModulesStatus(prev => ({ ...prev, [module]: 'loading' }));
                const res = await axios.post(`/api/dataforseo/${module}`, { domain });
                if (res.data.success) {
                    setModulesStatus(prev => ({ ...prev, [module]: 'success' }));
                    return { module, data: res.data.data };
                }
                throw new Error(res.data.error);
            })
        );

        moduleResults.forEach((mr) => {
            if (mr.status === 'fulfilled' && mr.value) {
                const key = moduleKeys[mr.value.module as ModuleName];
                (results as Record<string, unknown>)[key] = mr.value.data;
            }
        });

        return results;
    }, []);

    const buildComparison = useCallback((domain: string, data: Partial<AnalysisData>): DomainComparison => {
        const da = data.domainAnalytics;
        const bl = data.backlinks;
        const op = data.onPage;
        const ct = data.content;

        return {
            domain,
            dimensions: {
                domainAuthority: Math.min(100, (da?.domainRank || 0)),
                organicTraffic: Math.min(100, Math.log10(Math.max(1, da?.organicTraffic || 0)) * 15),
                backlinkProfile: Math.min(100, Math.log10(Math.max(1, bl?.totalBacklinks || 0)) * 15),
                onPageScore: op?.onPageScore || 0,
                contentScore: ct?.contentScore || 0,
                technicalHealth: op ? Math.max(0, 100 - (op.criticalCount * 10 + op.warningCount * 3)) : 50,
            },
            analysisData: data as AnalysisData,
        };
    }, []);

    useEffect(() => {
        if (domains.length < 2) return;

        const fetchAll = async () => {
            const allData: Record<string, Partial<AnalysisData>> = {};

            // Fetch all domains sequentially to avoid API rate limiting,
            // but all modules for each domain are parallel
            for (const domain of domains) {
                allData[domain] = await fetchDomainData(domain);
            }

            setAllAnalysisData(allData);
            setComparisons(domains.map(d => buildComparison(d, allData[d])));
            setIsLoading(false);

            // Generate comparative AI report
            setAiLoading(true);
            try {
                const res = await axios.post('/api/ai/report', {
                    domains,
                    allData,
                });
                if (res.data.success) {
                    setAiReport(res.data.data);
                } else {
                    setAiError(res.data.error);
                }
            } catch {
                setAiError('AI report temporarily unavailable.');
            } finally {
                setAiLoading(false);
            }
        };

        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domainsParam]);

    if (domains.length < 2) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">Please enter at least 2 domains to compare.</p>
            </div>
        );
    }

    if (isLoading) {
        return <LoadingScreen modules={modulesStatus} />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8 space-y-8">
                {/* Domain Tabs */}
                <div className="flex flex-wrap gap-2">
                    {domains.map((d) => (
                        <button
                            key={d}
                            onClick={() => setActiveDomain(d)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeDomain === d
                                ? 'bg-electric text-white'
                                : 'bg-navy-500 text-slate-400 hover:text-white hover:bg-navy-400'
                                }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {/* Radar Chart */}
                {comparisons.length > 0 && <CompareRadarChart comparisons={comparisons} />}

                {/* Comparison Table */}
                {comparisons.length > 0 && <CompareTable comparisons={comparisons} />}

                {/* AI Report */}
                <AiReportSection data={aiReport} loading={aiLoading} error={aiError} />
            </main>

            <Footer />
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="loading-bar w-40" /></div>}>
            <CompareContent />
        </Suspense>
    );
}
