'use client';

interface ComingSoonSectionProps {
    moduleId: string;
    label: string;
    icon: string;
    description: string;
}

export default function ComingSoonSection({ label, icon, description }: ComingSoonSectionProps) {
    return (
        <section className="space-y-6">
            <div className="section-heading">
                <div className="icon">{icon}</div>
                <div>
                    <h2 className="text-xl font-bold text-white">{label}</h2>
                    <p className="text-sm text-slate-400 font-normal">{description}</p>
                </div>
            </div>

            <div className="glass-card p-16 text-center">
                <div className="text-6xl mb-6 opacity-50">{icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">Coming Soon</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    This module is under development. It will be available once the API integration is complete.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs text-slate-400 font-medium">In Development</span>
                </div>
            </div>
        </section>
    );
}
