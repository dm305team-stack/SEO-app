'use client';

import { SectionWrapper, MetricCard, NoDataCard } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { DomainAnalyticsData } from '@/types';
import { getSeverityLevel } from '@/types';

export default function DomainAnalyticsSection({ data }: { data: DomainAnalyticsData | null }) {
    if (!data) return <NoDataCard module="Domain Analytics" />;

    const rankSeverity = getSeverityLevel(data.domainRank, { good: 50, warning: 20 });

    return (
        <SectionWrapper id="domain-analytics" title="Domain Analytics" icon="📊" status={rankSeverity}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Domain Rank" value={formatNumber(data.domainRank)} color={rankSeverity === 'good' ? 'success' : rankSeverity === 'warning' ? 'warning' : 'critical'} />
                <MetricCard label="Organic Traffic" value={formatNumber(data.organicTraffic)} color="electric" />
                <MetricCard label="Paid Traffic" value={formatNumber(data.paidTraffic)} />
                <MetricCard label="Organic Keywords" value={formatNumber(data.organicKeywords)} color="success" />
                <MetricCard label="Paid Keywords" value={formatNumber(data.paidKeywords)} />
                <MetricCard label="Backlinks" value={formatNumber(data.backlinks)} color="electric" />
                <MetricCard label="Referring Domains" value={formatNumber(data.referringDomains)} />
                <MetricCard label="Authority Score" value={data.authorityScore || 0} color={data.authorityScore && data.authorityScore > 50 ? 'success' : 'warning'} />
            </div>
        </SectionWrapper>
    );
}
