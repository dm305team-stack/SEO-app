'use client';

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import type { AnalysisData } from '@/types';

Font.register({
    family: 'Inter',
    src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2',
});

const s = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#FFFFFF' },
    header: { marginBottom: 16, borderBottom: '2 solid #1A2544', paddingBottom: 12 },
    logoText: { fontSize: 14, fontWeight: 'bold', color: '#1A2544' },
    subtitle: { fontSize: 9, color: '#3B82F6', marginTop: 2 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A2544', marginBottom: 6 },
    domain: { fontSize: 12, color: '#3B82F6', marginBottom: 3 },
    date: { fontSize: 9, color: '#64748B' },
    heading: { fontSize: 14, fontWeight: 'bold', color: '#1A2544', marginTop: 16, marginBottom: 6 },
    subheading: { fontSize: 11, fontWeight: 'bold', color: '#3B82F6', marginTop: 10, marginBottom: 4 },
    text: { fontSize: 9, color: '#374151', lineHeight: 1.6 },
    metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 8 },
    metricBox: { width: '22%', padding: 8, borderRadius: 4, border: '1 solid #E5E7EB', backgroundColor: '#F8FAFC' },
    metricLabel: { fontSize: 7, color: '#64748B', marginBottom: 3 },
    metricValue: { fontSize: 12, fontWeight: 'bold', color: '#1A2544' },
    tableHeader: { flexDirection: 'row', borderBottom: '1 solid #D1D5DB', paddingBottom: 4, marginBottom: 4 },
    tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#64748B' },
    tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #F1F5F9', paddingVertical: 3 },
    tableCell: { fontSize: 8, color: '#374151' },
    footer: { marginTop: 'auto', paddingTop: 10, borderTop: '1 solid #E5E7EB', fontSize: 7, color: '#94A3B8', textAlign: 'center' },
    bullet: { fontSize: 9, color: '#374151', marginBottom: 3, paddingLeft: 6 },
    pageNum: { position: 'absolute', bottom: 20, right: 40, fontSize: 8, color: '#94A3B8' },
    issueRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottom: '0.5 solid #F1F5F9' },
});

interface FullAuditProps {
    domain: string;
    data: Partial<AnalysisData>;
    aiReport?: string;
}

export default function FullAuditPDF({ domain, data, aiReport }: FullAuditProps) {
    const da = data.domainAnalytics;
    const bl = data.backlinks;
    const op = data.onPage;
    const kw = data.keywords;
    const ct = data.content;
    const serp = data.serp;
    const labs = data.labs;
    const aiOpt = data.aiOptimization;

    const pageFooter = (
        <View style={s.footer}>
            <Text>© {new Date().getFullYear()} Growth Marketing Studios | Full Technical Audit</Text>
        </View>
    );

    return (
        <Document>
            {/* Page 1: Cover */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>SEO Analyzer — Full Technical Audit</Text>
                </View>
                <Text style={s.title}>Full Technical SEO Audit</Text>
                <Text style={s.domain}>{domain}</Text>
                <Text style={s.date}>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

                <Text style={s.heading}>Table of Contents</Text>
                {['Domain Overview', 'SERP Analysis', 'Keywords Report', 'Backlinks Profile', 'On-Page Technical Audit', 'Content Analysis', 'Competitor Analysis', 'AI Optimization', 'AI Recommendations'].map((item, i) => (
                    <Text key={i} style={{ fontSize: 10, color: '#374151', marginBottom: 4 }}>{i + 1}. {item}</Text>
                ))}
                {pageFooter}
            </Page>

            {/* Page 2: Domain Overview */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>Domain Overview — {domain}</Text>
                </View>
                <Text style={s.heading}>1. Domain Overview</Text>
                <View style={s.metricsRow}>
                    {[
                        { label: 'Domain Rank', value: da?.domainRank },
                        { label: 'Organic Traffic', value: da?.organicTraffic?.toLocaleString() },
                        { label: 'Paid Traffic', value: da?.paidTraffic?.toLocaleString() },
                        { label: 'Organic Keywords', value: da?.organicKeywords?.toLocaleString() },
                        { label: 'Paid Keywords', value: da?.paidKeywords?.toLocaleString() },
                        { label: 'Total Backlinks', value: bl?.totalBacklinks?.toLocaleString() },
                        { label: 'Referring Domains', value: bl?.referringDomains?.toLocaleString() },
                        { label: 'Authority Score', value: da?.authorityScore },
                    ].map((m, i) => (
                        <View key={i} style={s.metricBox}>
                            <Text style={s.metricLabel}>{m.label}</Text>
                            <Text style={s.metricValue}>{m.value || 'N/A'}</Text>
                        </View>
                    ))}
                </View>
                {pageFooter}
            </Page>

            {/* Page 3: SERP */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>SERP Analysis — {domain}</Text>
                </View>
                <Text style={s.heading}>2. SERP Analysis</Text>
                <Text style={s.subheading}>SERP Features</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {serp?.features?.map((f, i) => (
                        <Text key={i} style={{ fontSize: 8, color: f.present ? '#10B981' : '#94A3B8', padding: 3, borderRadius: 3, border: `0.5 solid ${f.present ? '#10B981' : '#D1D5DB'}` }}>
                            {f.type.replace(/_/g, ' ')} {f.present ? '✓' : '✗'}
                        </Text>
                    ))}
                </View>

                <Text style={s.subheading}>Top Results</Text>
                <View style={s.tableHeader}>
                    <Text style={{ ...s.tableHeaderCell, width: '8%' }}>Pos</Text>
                    <Text style={{ ...s.tableHeaderCell, width: '40%' }}>Title</Text>
                    <Text style={{ ...s.tableHeaderCell, width: '52%' }}>URL</Text>
                </View>
                {serp?.results?.slice(0, 15).map((r, i) => (
                    <View key={i} style={s.tableRow}>
                        <Text style={{ ...s.tableCell, width: '8%' }}>{r.position}</Text>
                        <Text style={{ ...s.tableCell, width: '40%' }}>{r.title?.substring(0, 50)}</Text>
                        <Text style={{ ...s.tableCell, width: '52%', color: '#3B82F6' }}>{r.url?.substring(0, 60)}</Text>
                    </View>
                ))}
                {pageFooter}
            </Page>

            {/* Page 4: Keywords */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>Keywords Report — {domain}</Text>
                </View>
                <Text style={s.heading}>3. Keywords Report</Text>
                <View style={s.metricsRow}>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Total Keywords</Text><Text style={s.metricValue}>{kw?.totalKeywords?.toLocaleString() || 'N/A'}</Text></View>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Avg. Difficulty</Text><Text style={s.metricValue}>{Math.round(kw?.avgDifficulty || 0)}</Text></View>
                </View>
                <Text style={s.subheading}>Top Keywords</Text>
                <View style={s.tableHeader}>
                    <Text style={{ ...s.tableHeaderCell, width: '35%' }}>Keyword</Text>
                    <Text style={{ ...s.tableHeaderCell, width: '15%' }}>Volume</Text>
                    <Text style={{ ...s.tableHeaderCell, width: '15%' }}>CPC</Text>
                    <Text style={{ ...s.tableHeaderCell, width: '15%' }}>Difficulty</Text>
                    <Text style={{ ...s.tableHeaderCell, width: '20%' }}>Competition</Text>
                </View>
                {kw?.keywords?.slice(0, 20).map((k, i) => (
                    <View key={i} style={s.tableRow}>
                        <Text style={{ ...s.tableCell, width: '35%' }}>{k.keyword?.substring(0, 30)}</Text>
                        <Text style={{ ...s.tableCell, width: '15%' }}>{k.searchVolume?.toLocaleString()}</Text>
                        <Text style={{ ...s.tableCell, width: '15%' }}>${k.cpc?.toFixed(2)}</Text>
                        <Text style={{ ...s.tableCell, width: '15%' }}>{k.keywordDifficulty || 'N/A'}</Text>
                        <Text style={{ ...s.tableCell, width: '20%' }}>{k.competitionLevel}</Text>
                    </View>
                ))}
                {pageFooter}
            </Page>

            {/* Page 5: Backlinks */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>Backlinks Profile — {domain}</Text>
                </View>
                <Text style={s.heading}>4. Backlinks Profile</Text>
                <View style={s.metricsRow}>
                    {[
                        { label: 'Total Backlinks', value: bl?.totalBacklinks?.toLocaleString() },
                        { label: 'Referring Domains', value: bl?.referringDomains?.toLocaleString() },
                        { label: 'Dofollow', value: bl?.dofollow?.toLocaleString() },
                        { label: 'Nofollow', value: bl?.nofollow?.toLocaleString() },
                    ].map((m, i) => (
                        <View key={i} style={s.metricBox}>
                            <Text style={s.metricLabel}>{m.label}</Text>
                            <Text style={s.metricValue}>{m.value || 'N/A'}</Text>
                        </View>
                    ))}
                </View>
                <Text style={s.subheading}>Top Referring Domains</Text>
                <View style={s.tableHeader}>
                    <Text style={{ ...s.tableHeaderCell, width: '50%' }}>Domain</Text>
                    <Text style={{ ...s.tableHeaderCell, width: '25%' }}>Backlinks</Text>
                    <Text style={{ ...s.tableHeaderCell, width: '25%' }}>Rank</Text>
                </View>
                {bl?.topReferringDomains?.slice(0, 15).map((d, i) => (
                    <View key={i} style={s.tableRow}>
                        <Text style={{ ...s.tableCell, width: '50%' }}>{d.domain}</Text>
                        <Text style={{ ...s.tableCell, width: '25%' }}>{d.backlinks?.toLocaleString()}</Text>
                        <Text style={{ ...s.tableCell, width: '25%' }}>{d.rank}</Text>
                    </View>
                ))}
                {pageFooter}
            </Page>

            {/* Page 6: On-Page Audit */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>On-Page Technical Audit — {domain}</Text>
                </View>
                <Text style={s.heading}>5. On-Page Technical Audit</Text>
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                    <Text style={{ fontSize: 8, color: '#64748B' }}>On-Page Score</Text>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: (op?.onPageScore || 0) > 70 ? '#10B981' : (op?.onPageScore || 0) > 40 ? '#F59E0B' : '#EF4444' }}>
                        {op?.onPageScore || 'N/A'}
                    </Text>
                </View>
                <View style={s.metricsRow}>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Critical Issues</Text><Text style={{ ...s.metricValue, color: '#EF4444' }}>{op?.criticalCount || 0}</Text></View>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Warnings</Text><Text style={{ ...s.metricValue, color: '#F59E0B' }}>{op?.warningCount || 0}</Text></View>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Pages Crawled</Text><Text style={s.metricValue}>{op?.crawledPages || 'N/A'}</Text></View>
                </View>
                {op?.issues && op.issues.length > 0 && (
                    <>
                        <Text style={s.subheading}>Issues Found</Text>
                        {op.issues.map((issue, i) => (
                            <View key={i} style={s.issueRow}>
                                <Text style={{ ...s.tableCell, flex: 1 }}>{issue.type}</Text>
                                <Text style={{ ...s.tableCell, width: '15%' }}>{issue.count} pages</Text>
                                <Text style={{ ...s.tableCell, width: '15%', color: issue.severity === 'critical' ? '#EF4444' : issue.severity === 'warning' ? '#F59E0B' : '#64748B' }}>{issue.severity}</Text>
                            </View>
                        ))}
                    </>
                )}
                {pageFooter}
            </Page>

            {/* Page 7: Content */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>Content & Competitor Analysis — {domain}</Text>
                </View>
                <Text style={s.heading}>6. Content Analysis</Text>
                <View style={s.metricsRow}>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Content Score</Text><Text style={s.metricValue}>{ct?.contentScore || 'N/A'}</Text></View>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Total Content</Text><Text style={s.metricValue}>{ct?.totalContent || 'N/A'}</Text></View>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Duplicates</Text><Text style={s.metricValue}>{ct?.duplicateWarnings || 0}</Text></View>
                </View>

                <Text style={s.heading}>7. Competitor Analysis</Text>
                <View style={s.metricsRow}>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Est. Traffic</Text><Text style={s.metricValue}>{labs?.estimatedTraffic?.toLocaleString() || 'N/A'}</Text></View>
                    <View style={s.metricBox}><Text style={s.metricLabel}>Competitors</Text><Text style={s.metricValue}>{labs?.competitors?.length || 0}</Text></View>
                </View>
                {labs?.competitors && labs.competitors.length > 0 && (
                    <>
                        <View style={s.tableHeader}>
                            <Text style={{ ...s.tableHeaderCell, width: '35%' }}>Domain</Text>
                            <Text style={{ ...s.tableHeaderCell, width: '25%' }}>Traffic</Text>
                            <Text style={{ ...s.tableHeaderCell, width: '25%' }}>Keywords</Text>
                            <Text style={{ ...s.tableHeaderCell, width: '15%' }}>Rank</Text>
                        </View>
                        {labs.competitors.map((c, i) => (
                            <View key={i} style={s.tableRow}>
                                <Text style={{ ...s.tableCell, width: '35%' }}>{c.domain}</Text>
                                <Text style={{ ...s.tableCell, width: '25%' }}>{c.organicTraffic?.toLocaleString()}</Text>
                                <Text style={{ ...s.tableCell, width: '25%' }}>{c.organicKeywords?.toLocaleString()}</Text>
                                <Text style={{ ...s.tableCell, width: '15%' }}>{c.rank}</Text>
                            </View>
                        ))}
                    </>
                )}
                {pageFooter}
            </Page>

            {/* Page 8: AI Optimization */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>AI Optimization — {domain}</Text>
                </View>
                <Text style={s.heading}>8. AI Optimization</Text>
                {aiOpt?.optimizationTips?.map((tip, i) => (
                    <Text key={i} style={s.bullet}>• {tip}</Text>
                ))}
                {aiOpt?.keywordSuggestions && aiOpt.keywordSuggestions.length > 0 && (
                    <>
                        <Text style={s.subheading}>Keyword Suggestions</Text>
                        <View style={s.tableHeader}>
                            <Text style={{ ...s.tableHeaderCell, width: '50%' }}>Keyword</Text>
                            <Text style={{ ...s.tableHeaderCell, width: '25%' }}>Volume</Text>
                            <Text style={{ ...s.tableHeaderCell, width: '25%' }}>Difficulty</Text>
                        </View>
                        {aiOpt.keywordSuggestions.map((k, i) => (
                            <View key={i} style={s.tableRow}>
                                <Text style={{ ...s.tableCell, width: '50%' }}>{k.keyword}</Text>
                                <Text style={{ ...s.tableCell, width: '25%' }}>{k.searchVolume?.toLocaleString()}</Text>
                                <Text style={{ ...s.tableCell, width: '25%' }}>{k.difficulty || 'N/A'}</Text>
                            </View>
                        ))}
                    </>
                )}
                {pageFooter}
            </Page>

            {/* Page 9+: AI Report */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>AI Recommendations — {domain}</Text>
                </View>
                <Text style={s.heading}>9. AI-Generated Recommendations</Text>
                {aiReport ? (
                    <Text style={s.text}>{aiReport}</Text>
                ) : (
                    <Text style={s.text}>AI report was not generated for this analysis.</Text>
                )}
                {pageFooter}
            </Page>
        </Document>
    );
}
