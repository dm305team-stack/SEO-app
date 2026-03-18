'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
    domain?: string;
    showDownloadReport?: boolean;
    onDownloadReport?: () => void;
    isReportLoading?: boolean;
}

export default function Header({ domain, showDownloadReport, onDownloadReport, isReportLoading }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-electric/10 bg-navy/95 backdrop-blur-xl">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 py-3">
                <Link href="/" className="flex items-center gap-3 group">
                    <Image
                        src="https://growthmarketingstudios.com/wp-content/uploads/2025/11/Growth-Marketing-Studios-logo.png"
                        alt="Growth Marketing Studios"
                        width={40}
                        height={40}
                        className="rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight">Growth Marketing Studios</h1>
                        <p className="text-xs text-electric-400 leading-tight">SEO & GEO Analyzer</p>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    {domain && (
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-electric/10 border border-electric/20">
                            <div className="w-2 h-2 rounded-full bg-electric-400 animate-pulse" />
                            <span className="text-sm text-electric-300 font-medium">{domain}</span>
                        </div>
                    )}

                    {showDownloadReport && (
                        <button
                            onClick={onDownloadReport}
                            disabled={isReportLoading}
                            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isReportLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Report
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
