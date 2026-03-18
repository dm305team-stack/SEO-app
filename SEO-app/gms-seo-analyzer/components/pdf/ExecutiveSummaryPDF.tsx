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

// Register a basic font
Font.register({
    family: 'Inter',
    src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2',
});

const s = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#FFFFFF' },
    header: { marginBottom: 24, borderBottom: '2 solid #1A2544', paddingBottom: 16 },
    logoText: { fontSize: 16, fontWeight: 'bold', color: '#1A2544' },
    subtitle: { fontSize: 10, color: '#3B82F6', marginTop: 2 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1A2544', marginBottom: 8 },
    domain: { fontSize: 14, color: '#3B82F6', marginBottom: 4 },
    date: { fontSize: 10, color: '#64748B' },
    heading: { fontSize: 16, fontWeight: 'bold', color: '#1A2544', marginTop: 20, marginBottom: 8 },
    text: { fontSize: 11, color: '#374151', lineHeight: 1.6 },
    bold: { fontWeight: 'bold' },
    metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, marginBottom: 12 },
    metricBox: { width: '22%', padding: 10, borderRadius: 6, border: '1 solid #E5E7EB', backgroundColor: '#F8FAFC' },
    metricLabel: { fontSize: 8, color: '#64748B', marginBottom: 4 },
    metricValue: { fontSize: 14, fontWeight: 'bold', color: '#1A2544' },
    score: { fontSize: 36, fontWeight: 'bold', color: '#3B82F6', textAlign: 'center', marginVertical: 12 },
    scoreLabel: { fontSize: 10, color: '#64748B', textAlign: 'center' },
    footer: { marginTop: 'auto', paddingTop: 12, borderTop: '1 solid #E5E7EB', fontSize: 8, color: '#94A3B8', textAlign: 'center' },
    section: { marginBottom: 16 },
    bullet: { fontSize: 10, color: '#374151', marginBottom: 4, paddingLeft: 8 },
});

interface ExecPdfProps {
    domain: string;
    data: Partial<AnalysisData>;
    aiReport?: string;
}

export default function ExecutiveSummaryPDF({ domain, data, aiReport }: ExecPdfProps) {
    const da = data.domainAnalytics;
    const bl = data.backlinks;
    const op = data.onPage;
    const kw = data.keywords;

    return (
        <Document>
            {/* Page 1: Cover + Overview */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>SEO Analyzer — Executive Summary</Text>
                </View>

                <Text style={s.title}>SEO Executive Summary</Text>
                <Text style={s.domain}>{domain}</Text>
                <Text style={s.date}>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

                {/* Overall Score */}
                <View style={{ alignItems: 'center', marginTop: 30 }}>
                    <Text style={s.scoreLabel}>Overall On-Page Score</Text>
                    <Text style={s.score}>{op?.onPageScore || 'N/A'}</Text>
                    <Text style={s.scoreLabel}>out of 100</Text>
                </View>

                {/* Key Metrics */}
                <Text style={s.heading}>Key Metrics</Text>
                <View style={s.metricsRow}>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Domain Rank</Text>
                        <Text style={s.metricValue}>{da?.domainRank || 'N/A'}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Organic Traffic</Text>
                        <Text style={s.metricValue}>{da?.organicTraffic?.toLocaleString() || 'N/A'}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Total Backlinks</Text>
                        <Text style={s.metricValue}>{bl?.totalBacklinks?.toLocaleString() || 'N/A'}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Keywords</Text>
                        <Text style={s.metricValue}>{kw?.totalKeywords?.toLocaleString() || 'N/A'}</Text>
                    </View>
                </View>

                {/* Issues Summary */}
                <Text style={s.heading}>Issues Summary</Text>
                <View style={s.metricsRow}>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Critical Issues</Text>
                        <Text style={{ ...s.metricValue, color: '#EF4444' }}>{op?.criticalCount || 0}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Warnings</Text>
                        <Text style={{ ...s.metricValue, color: '#F59E0B' }}>{op?.warningCount || 0}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Referring Domains</Text>
                        <Text style={s.metricValue}>{bl?.referringDomains?.toLocaleString() || 'N/A'}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Pages Crawled</Text>
                        <Text style={s.metricValue}>{op?.crawledPages || 'N/A'}</Text>
                    </View>
                </View>

                <View style={s.footer}>
                    <Text>© {new Date().getFullYear()} Growth Marketing Studios | Powered by DataForSEO & OpenAI GPT-4o</Text>
                </View>
            </Page>

            {/* Page 2: AI Recommendations */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>SEO Analyzer — Executive Summary</Text>
                </View>

                <Text style={s.heading}>AI-Generated Recommendations</Text>
                <View style={s.section}>
                    {aiReport ? (
                        <Text style={s.text}>{aiReport}</Text>
                    ) : (
                        <Text style={s.text}>AI report was not generated for this analysis. Please try again with a complete dataset.</Text>
                    )}
                </View>

                <View style={s.footer}>
                    <Text>© {new Date().getFullYear()} Growth Marketing Studios | Powered by DataForSEO & OpenAI GPT-4o</Text>
                </View>
            </Page>
        </Document>
    );
}
