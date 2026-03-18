'use client';

import { formatNumber } from '@/lib/utils';
import type { DomainComparison } from '@/types';

interface CompareTableProps {
    comparisons: DomainComparison[];
}

interface MetricRow {
    label: string;
    getValue: (c: DomainComparison) => number | string;
    higherIsBetter: boolean;
}

const metrics: MetricRow[] = [
    { label: 'Domain Rank', getValue: (c) => c.analysisData.domainAnalytics?.domainRank || 0, higherIsBetter: true },
    { label: 'Organic Traffic', getValue: (c) => c.analysisData.domainAnalytics?.organicTraffic || 0, higherIsBetter: true },
    { label: 'Organic Keywords', getValue: (c) => c.analysisData.domainAnalytics?.organicKeywords || 0, higherIsBetter: true },
    { label: 'Total Backlinks', getValue: (c) => c.analysisData.backlinks?.totalBacklinks || 0, higherIsBetter: true },
    { label: 'Referring Domains', getValue: (c) => c.analysisData.backlinks?.referringDomains || 0, higherIsBetter: true },
    { label: 'On-Page Score', getValue: (c) => c.analysisData.onPage?.onPageScore || 0, higherIsBetter: true },
    { label: 'Critical Issues', getValue: (c) => c.analysisData.onPage?.criticalCount || 0, higherIsBetter: false },
    { label: 'Content Score', getValue: (c) => c.analysisData.content?.contentScore || 0, higherIsBetter: true },
];

export default function CompareTable({ comparisons }: CompareTableProps) {
    const getWinnerIndex = (row: MetricRow): number => {
        let bestIdx = 0;
        let bestVal = -Infinity;
        comparisons.forEach((c, i) => {
            const val = Number(row.getValue(c)) || 0;
            const normalized = row.higherIsBetter ? val : -val;
            if (normalized > bestVal) {
                bestVal = normalized;
                bestIdx = i;
            }
        });
        return bestIdx;
    };

    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left text-sm font-semibold text-slate-400 px-6 py-4 border-b border-electric/10">Metric</th>
                            {comparisons.map((c) => (
                                <th key={c.domain} className="text-center text-sm font-semibold text-white px-6 py-4 border-b border-electric/10">
                                    {c.domain}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map((row) => {
                            const winnerIdx = getWinnerIndex(row);
                            return (
                                <tr key={row.label} className="hover:bg-electric/5 transition-colors">
                                    <td className="px-6 py-3 text-sm text-slate-300 border-b border-electric/5">{row.label}</td>
                                    {comparisons.map((c, i) => {
                                        const val = row.getValue(c);
                                        const isWinner = i === winnerIdx;
                                        return (
                                            <td key={c.domain} className={`text-center px-6 py-3 text-sm font-medium border-b border-electric/5 ${isWinner ? 'text-emerald-400' : 'text-slate-400'
                                                }`}>
                                                {typeof val === 'number' ? formatNumber(val) : val}
                                                {isWinner && ' 🏆'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
