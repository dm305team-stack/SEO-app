'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidDomain, parseDomain } from '@/lib/utils';

interface DomainEntry {
    id: string;
    value: string;
}

export default function DomainInputForm() {
    const router = useRouter();
    const [domains, setDomains] = useState<DomainEntry[]>([
        { id: '1', value: '' },
    ]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addDomain = () => {
        if (domains.length < 5) {
            setDomains([...domains, { id: String(Date.now()), value: '' }]);
        }
    };

    const removeDomain = (id: string) => {
        if (domains.length > 1) {
            setDomains(domains.filter((d) => d.id !== id));
            const newErrors = { ...errors };
            delete newErrors[id];
            setErrors(newErrors);
        }
    };

    const updateDomain = (id: string, value: string) => {
        setDomains(domains.map((d) => (d.id === id ? { ...d, value } : d)));
        if (errors[id]) {
            const newErrors = { ...errors };
            delete newErrors[id];
            setErrors(newErrors);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validDomains: string[] = [];
        const newErrors: Record<string, string> = {};

        domains.forEach((d) => {
            const trimmed = d.value.trim();
            if (!trimmed) {
                if (d.id === '1') {
                    newErrors[d.id] = 'Please enter a domain';
                }
                return;
            }
            if (!isValidDomain(trimmed)) {
                newErrors[d.id] = 'Invalid domain format (e.g., example.com)';
                return;
            }
            validDomains.push(parseDomain(trimmed));
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        if (validDomains.length === 0) {
            setErrors({ '1': 'Please enter at least one domain' });
            setIsSubmitting(false);
            return;
        }

        if (validDomains.length === 1) {
            router.push(`/seo?domain=${encodeURIComponent(validDomains[0])}`);
        } else {
            router.push(`/compare?domains=${encodeURIComponent(validDomains.join(','))}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
            <div className="space-y-3">
                {domains.map((d, index) => (
                    <div key={d.id} className="animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={d.value}
                                    onChange={(e) => updateDomain(d.id, e.target.value)}
                                    placeholder={index === 0 ? 'Enter domain (e.g., example.com)' : `Domain ${index + 1} (optional)`}
                                    className="input-field pl-12"
                                    autoFocus={index === 0}
                                />
                            </div>
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => removeDomain(d.id)}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {errors[d.id] && (
                            <p className="text-red-400 text-sm mt-1 ml-1 animate-fade-in">{errors[d.id]}</p>
                        )}
                    </div>
                ))}
            </div>

            {domains.length < 5 && (
                <button
                    type="button"
                    onClick={addDomain}
                    className="flex items-center gap-2 text-sm text-electric-400 hover:text-electric-300 transition-colors px-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Another Domain
                </button>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing…
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Run SEO Analysis
                    </>
                )}
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
                Enter 1 domain for a full analysis · Enter 2–5 for comparative analysis
            </p>
        </form>
    );
}
