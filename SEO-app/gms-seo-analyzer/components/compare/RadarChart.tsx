'use client';

import {
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import type { DomainComparison } from '@/types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const dimensionLabels: Record<string, string> = {
    domainAuthority: 'Domain Authority',
    organicTraffic: 'Organic Traffic',
    backlinkProfile: 'Backlink Profile',
    onPageScore: 'On-Page Score',
    contentScore: 'Content Score',
    technicalHealth: 'Technical Health',
};

interface RadarChartProps {
    comparisons: DomainComparison[];
}

export default function CompareRadarChart({ comparisons }: RadarChartProps) {
    const dimensions = Object.keys(dimensionLabels);

    const chartData = dimensions.map((dim) => {
        const entry: Record<string, string | number> = {
            dimension: dimensionLabels[dim],
        };
        comparisons.forEach((comp) => {
            entry[comp.domain] = comp.dimensions[dim as keyof typeof comp.dimensions] || 0;
        });
        return entry;
    });

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Domain Comparison Overview</h3>
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="rgba(59,130,246,0.15)" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                        {comparisons.map((comp, i) => (
                            <Radar
                                key={comp.domain}
                                name={comp.domain}
                                dataKey={comp.domain}
                                stroke={COLORS[i]}
                                fill={COLORS[i]}
                                fillOpacity={0.15}
                                strokeWidth={2}
                            />
                        ))}
                        <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#1A2544', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', color: '#fff' }} />
                    </RechartsRadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
