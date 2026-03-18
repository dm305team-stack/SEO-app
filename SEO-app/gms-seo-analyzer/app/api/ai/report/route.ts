import { NextRequest, NextResponse } from 'next/server';
import { isAiAvailable } from '@/lib/demoMode';
import { getMockAiReport } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain, data, domains } = await req.json();

        if (!domain && !domains) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        const targetDomain = domain || domains?.[0] || '';

        // No AI key configured — return mock AI report
        if (!isAiAvailable()) {
            const mockReport = getMockAiReport(targetDomain);
            return NextResponse.json({ success: true, data: mockReport, demo: true });
        }

        let reportText: string;
        if (domains) {
            const { generateComparisonReport } = await import('@/lib/openai');
            reportText = await generateComparisonReport(domains, data);
        } else {
            const { generateSeoReport } = await import('@/lib/openai');
            reportText = await generateSeoReport(targetDomain, data);
        }

        // Parse sections from the report
        const sections: { title: string; content: string }[] = [];
        const lines = reportText.split('\n');
        let currentTitle = '';
        let currentContent: string[] = [];

        for (const line of lines) {
            if (line.startsWith('## ')) {
                if (currentTitle) {
                    sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
                }
                currentTitle = line.replace('## ', '');
                currentContent = [];
            } else if (currentTitle) {
                currentContent.push(line);
            }
        }
        if (currentTitle) {
            sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
        }

        return NextResponse.json({
            success: true,
            data: {
                report: reportText,
                sections,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate AI report';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
