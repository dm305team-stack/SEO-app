'use client';

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import type { BrowserApiData } from '@/types';

Font.register({
    family: 'Inter',
    src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2',
});

const s = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#FFFFFF' },
    header: { marginBottom: 24, borderBottom: '2 solid #1A2544', paddingBottom: 16 },
    logoText: { fontSize: 16, fontWeight: 'bold', color: '#1A2544' },
    subtitle: { fontSize: 10, color: '#3B82F6', marginTop: 2 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A2544', marginBottom: 6 },
    urlText: { fontSize: 11, color: '#3B82F6', marginBottom: 4 },
    date: { fontSize: 9, color: '#94A3B8' },
    heading: { fontSize: 14, fontWeight: 'bold', color: '#1A2544', marginTop: 18, marginBottom: 8 },
    subheading: { fontSize: 11, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 4 },
    text: { fontSize: 10, color: '#374151', lineHeight: 1.5 },
    textSmall: { fontSize: 9, color: '#64748B', lineHeight: 1.4 },
    metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, marginBottom: 8 },
    metricBox: { width: '23%', padding: 8, borderRadius: 4, border: '1 solid #E5E7EB', backgroundColor: '#F8FAFC' },
    metricLabel: { fontSize: 8, color: '#64748B', marginBottom: 3 },
    metricValue: { fontSize: 13, fontWeight: 'bold', color: '#1A2544' },
    row: { flexDirection: 'row', borderBottom: '1 solid #F1F5F9', paddingVertical: 4 },
    cellLabel: { width: '35%', fontSize: 9, color: '#64748B' },
    cellValue: { width: '65%', fontSize: 9, color: '#374151' },
    tag: { fontSize: 8, color: '#3B82F6', backgroundColor: '#EFF6FF', padding: '2 6', borderRadius: 3, marginRight: 4, marginBottom: 3 },
    headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
    headingLevel: { fontSize: 8, color: '#3B82F6', backgroundColor: '#EFF6FF', padding: '1 4', borderRadius: 2, marginRight: 6, width: 20, textAlign: 'center' },
    headingText: { fontSize: 9, color: '#374151', flex: 1 },
    footer: { marginTop: 'auto', paddingTop: 12, borderTop: '1 solid #E5E7EB', fontSize: 8, color: '#94A3B8', textAlign: 'center' },
    statusGood: { color: '#10B981' },
    statusBad: { color: '#EF4444' },
    statusWarn: { color: '#F59E0B' },
    linkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    linkBadge: { fontSize: 7, padding: '1 4', borderRadius: 2, marginRight: 4 },
    linkBadgeInt: { backgroundColor: '#ECFDF5', color: '#10B981' },
    linkBadgeExt: { backgroundColor: '#FEF3C7', color: '#D97706' },
    linkUrl: { fontSize: 8, color: '#374151', flex: 1 },
});

interface BrowserReportPdfProps {
    url: string;
    data: BrowserApiData;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BrowserReportPDF({ url, data }: BrowserReportPdfProps) {
    const genDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const statusColor = data.statusCode === 200 ? s.statusGood : s.statusBad;
    const loadColor = data.loadTimeMs < 3000 ? s.statusGood : data.loadTimeMs < 5000 ? s.statusWarn : s.statusBad;

    return (
        <Document>
            {/* Page 1: Overview + Meta */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>SEO & GEO Analyzer — Browser API Report</Text>
                </View>

                <Text style={s.title}>Browser API Analysis Report</Text>
                <Text style={s.urlText}>{url}</Text>
                <Text style={s.date}>Generated: {genDate}</Text>

                {/* Key Metrics */}
                <Text style={s.heading}>Key Metrics</Text>
                <View style={s.metricsRow}>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>HTTP Status</Text>
                        <Text style={{ ...s.metricValue, ...statusColor }}>{data.statusCode}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Load Time</Text>
                        <Text style={{ ...s.metricValue, ...loadColor }}>{(data.loadTimeMs / 1000).toFixed(2)}s</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Word Count</Text>
                        <Text style={s.metricValue}>{data.wordCount.toLocaleString()}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>HTML Size</Text>
                        <Text style={s.metricValue}>{formatBytes(data.htmlSize)}</Text>
                    </View>
                </View>

                <View style={s.metricsRow}>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Internal Links</Text>
                        <Text style={s.metricValue}>{data.internalLinks}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>External Links</Text>
                        <Text style={s.metricValue}>{data.externalLinks}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Headings</Text>
                        <Text style={s.metricValue}>{data.headings.length}</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Schema Types</Text>
                        <Text style={s.metricValue}>{data.schemaMarkup.length}</Text>
                    </View>
                </View>

                {/* Title & Meta */}
                <Text style={s.heading}>SEO Metadata</Text>
                <View style={s.row}>
                    <Text style={s.cellLabel}>Title</Text>
                    <Text style={s.cellValue}>{data.title || '(not set)'}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.cellLabel}>Meta Description</Text>
                    <Text style={s.cellValue}>{data.metaDescription || '(not set)'}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.cellLabel}>Canonical URL</Text>
                    <Text style={s.cellValue}>{data.canonicalUrl || '(not set)'}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.cellLabel}>Final URL</Text>
                    <Text style={s.cellValue}>{data.finalUrl}</Text>
                </View>

                {/* OG Tags */}
                {data.ogTags.length > 0 && (
                    <>
                        <Text style={s.heading}>Open Graph Tags</Text>
                        {data.ogTags.map((tag, i) => (
                            <View key={i} style={s.row}>
                                <Text style={s.cellLabel}>{tag.name}</Text>
                                <Text style={s.cellValue}>{tag.content}</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Performance */}
                <Text style={s.heading}>Performance</Text>
                <View style={s.row}>
                    <Text style={s.cellLabel}>DOM Content Loaded</Text>
                    <Text style={s.cellValue}>{(data.performance.domContentLoaded / 1000).toFixed(2)}s</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.cellLabel}>Full Load</Text>
                    <Text style={s.cellValue}>{(data.performance.loadComplete / 1000).toFixed(2)}s</Text>
                </View>

                <View style={s.footer}>
                    <Text>© {new Date().getFullYear()} Growth Marketing Studios | Browser API Report</Text>
                </View>
            </Page>

            {/* Page 2: Headings + Links */}
            <Page size="A4" style={s.page}>
                <View style={s.header}>
                    <Text style={s.logoText}>Growth Marketing Studios</Text>
                    <Text style={s.subtitle}>SEO & GEO Analyzer — Browser API Report</Text>
                </View>

                {/* Heading Structure */}
                <Text style={s.heading}>Heading Structure ({data.headings.length} headings)</Text>
                {data.headings.slice(0, 40).map((h, i) => (
                    <View key={i} style={{ ...s.headingRow, paddingLeft: (h.level - 1) * 12 }}>
                        <Text style={s.headingLevel}>H{h.level}</Text>
                        <Text style={s.headingText}>{h.text}</Text>
                    </View>
                ))}
                {data.headings.length > 40 && (
                    <Text style={s.textSmall}>... and {data.headings.length - 40} more headings</Text>
                )}

                {/* Hreflang */}
                {data.hreflangTags.length > 0 && (
                    <>
                        <Text style={s.heading}>Hreflang Tags ({data.hreflangTags.length})</Text>
                        {data.hreflangTags.map((tag, i) => (
                            <View key={i} style={s.row}>
                                <Text style={s.cellLabel}>{tag.lang}</Text>
                                <Text style={s.cellValue}>{tag.href}</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Top Links */}
                <Text style={s.heading}>Top Links ({data.links.length} total)</Text>
                {data.links.slice(0, 30).map((link, i) => (
                    <View key={i} style={s.linkRow}>
                        <Text style={{ ...s.linkBadge, ...(link.isExternal ? s.linkBadgeExt : s.linkBadgeInt) }}>
                            {link.isExternal ? 'EXT' : 'INT'}
                        </Text>
                        <Text style={s.linkUrl}>{link.href}</Text>
                    </View>
                ))}
                {data.links.length > 30 && (
                    <Text style={s.textSmall}>... and {data.links.length - 30} more links</Text>
                )}

                <View style={s.footer}>
                    <Text>© {new Date().getFullYear()} Growth Marketing Studios | Browser API Report</Text>
                </View>
            </Page>
        </Document>
    );
}
