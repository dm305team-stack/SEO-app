'use client';

import type { BrightDataModuleName, BrightDataModuleStatus } from '@/types';

interface SidebarProps {
    activeModule: BrightDataModuleName;
    modulesStatus: Partial<Record<BrightDataModuleName, BrightDataModuleStatus>>;
    onModuleClick: (module: BrightDataModuleName) => void;
}

interface ModuleConfig {
    id: BrightDataModuleName;
    label: string;
    icon: string;
    description: string;
}

const modules: ModuleConfig[] = [
    {
        id: 'serp-api',
        label: 'SERP',
        icon: '🔍',
        description: 'Search results & rankings',
    },
    {
        id: 'browser-api',
        label: 'Browser',
        icon: '🌐',
        description: 'Live page analysis',
    },
    {
        id: 'unlocker-api',
        label: 'Unlocker',
        icon: '🔓',
        description: 'Anti-bot bypass',
    },
    {
        id: 'crawl-api',
        label: 'Crawl',
        icon: '🕷️',
        description: 'Bulk URL crawling',
    },
    {
        id: 'web-scraper-api',
        label: 'Web Scraper',
        icon: '📦',
        description: 'Structured data extraction',
    },
    {
        id: 'deep-lookup',
        label: 'Deep Lookup',
        icon: '🔎',
        description: 'Entity discovery',
    },
    {
        id: 'web-archive',
        label: 'Web Archive',
        icon: '📚',
        description: 'Historical snapshots',
    },
    {
        id: 'local-business',
        label: 'Local Business',
        icon: '🗺️',
        description: 'Google My Business analysis',
    },
];

export default function Sidebar({ activeModule, modulesStatus, onModuleClick }: SidebarProps) {
    const getStatusIndicator = (module: ModuleConfig) => {
        const status = modulesStatus[module.id];
        switch (status) {
            case 'loading':
                return (
                    <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    </span>
                );
            case 'success':
                return <span className="w-2 h-2 rounded-full bg-emerald-400" />;
            case 'error':
                return <span className="w-2 h-2 rounded-full bg-red-400" />;
            case 'coming-soon':
                return (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">
                        Soon
                    </span>
                );
            default:
                return <span className="w-2 h-2 rounded-full bg-slate-600" />;
        }
    };

    return (
        <aside className="hidden lg:block w-72 flex-shrink-0">
            <nav className="sticky top-[73px] p-4 space-y-1 max-h-[calc(100vh-73px)] overflow-y-auto">
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider px-4 mb-3">
                    Bright Data APIs
                </p>
                {modules.map((module) => {
                    const isActive = activeModule === module.id;
                    const isComingSoon = modulesStatus[module.id] === 'coming-soon';

                    return (
                        <button
                            key={module.id}
                            onClick={() => !isComingSoon && onModuleClick(module.id)}
                            disabled={isComingSoon}
                            className={`w-full text-left sidebar-link group ${isActive ? 'active' : ''} ${isComingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                        >
                            <span className="text-lg flex-shrink-0">{module.icon}</span>
                            <div className="flex-1 min-w-0">
                                <span className="block text-sm font-medium truncate">{module.label}</span>
                                <span className="block text-[11px] text-slate-500 truncate">
                                    {module.description}
                                </span>
                            </div>
                            {getStatusIndicator(module)}
                        </button>
                    );
                })}

                <div className="border-t border-electric/10 my-3" />
                <button
                    onClick={() => {
                        const el = document.getElementById('ai-report');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full text-left sidebar-link"
                >
                    <span className="text-lg">✨</span>
                    <span className="flex-1 text-sm font-medium">AI Report</span>
                </button>
            </nav>
        </aside>
    );
}
