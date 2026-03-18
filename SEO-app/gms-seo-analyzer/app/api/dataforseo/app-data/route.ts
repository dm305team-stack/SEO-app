import { NextRequest, NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demoMode';
import { getMockAppData } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();
        if (!domain) {
            return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
        }

        if (isDemoMode()) {
            return NextResponse.json({ success: true, data: getMockAppData(), demo: true });
        }

        return NextResponse.json({
            success: true,
            data: { hasApp: false, apps: [] },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch app data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
