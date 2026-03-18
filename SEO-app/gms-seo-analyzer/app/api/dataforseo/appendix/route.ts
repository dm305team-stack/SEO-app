import { NextRequest, NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demoMode';
import { getMockAppendixData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockAppendixData(), demo: true });
        }

        return NextResponse.json({
            success: true,
            data: {
                totalApiCalls: 12,
                responseTimes: [],
                rawData: { note: 'No raw data available' },
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch appendix data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
