'use client';

import { cn, getModuleLoadingMessage } from '@/lib/utils';
import type { ModuleName, ModuleStatus } from '@/types';

interface LoadingScreenProps {
    modules: Partial<Record<ModuleName, ModuleStatus>>;
}

const moduleOrder: ModuleName[] = [
    'serp', 'keywords', 'domain-analytics', 'labs', 'backlinks',
    'on-page', 'content', 'merchant', 'app-data', 'business',
    'appendix', 'ai-optimization',
];

export default function LoadingScreen({ modules }: LoadingScreenProps) {
    const completedCount = moduleOrder.filter(m => modules[m] === 'success' || modules[m] === 'error').length;
    const progress = (completedCount / moduleOrder.length) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/95 backdrop-blur-xl">
            <div className="w-full max-w-md mx-auto px-6">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-electric-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Domain</h2>
                    <p className="text-slate-400 text-sm">This may take up to a minute</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>{completedCount} of {moduleOrder.length} modules</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-navy-500 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-electric-500 to-electric-400 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Module List */}
                <div className="space-y-2">
                    {moduleOrder.map((module) => {
                        const status = modules[module] || 'idle';
                        return (
                            <div
                                key={module}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-300',
                                    status === 'loading' && 'bg-electric/5 border border-electric/10',
                                    status === 'success' && 'opacity-60',
                                    status === 'error' && 'opacity-60',
                                )}
                            >
                                {status === 'idle' && <div className="w-4 h-4 rounded-full border border-slate-600" />}
                                {status === 'loading' && (
                                    <svg className="w-4 h-4 text-electric-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {status === 'success' && (
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {status === 'error' && (
                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <span className={cn(
                                    'flex-1',
                                    status === 'loading' ? 'text-white' : 'text-slate-400',
                                )}>
                                    {status === 'loading' ? getModuleLoadingMessage(module) : getModuleLoadingMessage(module).replace('…', '')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ---- Metric Card ----
export function MetricCard({
    label,
    value,
    change,
    icon,
    color = 'electric',
}: {
    label: string;
    value: string | number;
    change?: string;
    icon?: React.ReactNode;
    color?: 'electric' | 'success' | 'warning' | 'critical';
}) {
    const colorStyles = {
        electric: 'from-electric/20 to-electric/5 border-electric/20',
        success: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
        warning: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
        critical: 'from-red-500/20 to-red-500/5 border-red-500/20',
    };

    const valueColor = {
        electric: 'text-electric-400',
        success: 'text-emerald-400',
        warning: 'text-amber-400',
        critical: 'text-red-400',
    };

    return (
        <div className={`metric-card bg-gradient-to-br ${colorStyles[color]}`}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-slate-400 font-medium">{label}</p>
                {icon && <div className="text-slate-500">{icon}</div>}
            </div>
            <p className={`text-3xl font-bold ${valueColor[color]}`}>{value}</p>
            {change && (
                <p className={`text-xs mt-1 ${change.startsWith('+') || change.startsWith('↑') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change}
                </p>
            )}
        </div>
    );
}

// ---- Status Badge ----
export function StatusBadge({ status }: { status: 'good' | 'warning' | 'critical' }) {
    const text = { good: 'Good', warning: 'Needs Work', critical: 'Critical' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold status-${status}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'good' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
            {text[status]}
        </span>
    );
}

// ---- Section Wrapper ----
export function SectionWrapper({
    id,
    title,
    icon,
    status,
    children,
}: {
    id: string;
    title: string;
    icon: string;
    status?: 'good' | 'warning' | 'critical';
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="glass-card p-6 lg:p-8 scroll-mt-20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="section-heading mb-0">
                    <span className="icon">{icon}</span>
                    {title}
                </h2>
                {status && <StatusBadge status={status} />}
            </div>
            {children}
        </section>
    );
}

// ---- Error Card ----
export function ErrorCard({ module, message }: { module: string; message?: string }) {
    return (
        <div className="glass-card p-6 border-red-500/20">
            <div className="flex items-center gap-3 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">
                    {message || `No ${module} data available for this domain.`}
                </p>
            </div>
        </div>
    );
}

// ---- No Data Card ----
export function NoDataCard({ module }: { module: string }) {
    return (
        <div className="glass-card p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            </div>
            <p className="text-slate-400 text-sm">No {module} data available for this domain.</p>
            <p className="text-slate-500 text-xs mt-1">This module may not be applicable.</p>
        </div>
    );
}
