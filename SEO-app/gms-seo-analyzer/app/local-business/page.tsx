'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LocalBusinessSection from '@/components/sections/LocalBusinessSection';
import type { LocalBusinessData } from '@/types';

export default function LocalBusinessPage() {
    const [data, setData] = useState<LocalBusinessData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [insightsLoading, setInsightsLoading] = useState(false);

    const handleSearch = useCallback(async (query: string) => {
        setLoading(true);
        setData(null);
        setError(undefined);
        try {
            const res = await axios.post('/api/google/places', { query });
            if (res.data.success) {
                setData(res.data.data);
            } else {
                throw new Error(res.data.error || 'Search failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Search failed. Please try again.');
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFetchInsights = useCallback(async (locationId: string, accessToken: string) => {
        setInsightsLoading(true);
        try {
            const res = await axios.post('/api/google/business-insights', { locationId, accessToken });
            if (res.data.success) {
                setData((prev) => prev ? { ...prev, metrics: res.data.data } : prev);
            } else {
                setData((prev) => prev ? { ...prev, metricsError: res.data.error } : prev);
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Failed to fetch insights.');
            setData((prev) => prev ? { ...prev, metricsError: message } : prev);
        } finally {
            setInsightsLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
                <LocalBusinessSection
                    data={data}
                    loading={loading}
                    error={error}
                    onSearch={handleSearch}
                    onFetchInsights={handleFetchInsights}
                    insightsLoading={insightsLoading}
                />
            </main>
            <Footer />
        </div>
    );
}
