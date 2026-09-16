import { ShieldCheck, Database, Layers, Smartphone, FileText, Activity } from 'lucide-react';

export type ActiveTab = 'modules' | 'schema' | 'rbac' | 'contracts' | 'architecture' | 'health';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  apiConnected: boolean;
}

export function Navbar({ activeTab, onTabChange, apiConnected }: NavbarProps) {
  const tabs = [
    { id: 'modules' as ActiveTab, label: '15 Core Modules', icon: Layers },
    { id: 'schema' as ActiveTab, label: 'Database Schema (Prisma)', icon: Database },
    { id: 'rbac' as ActiveTab, label: 'RBAC & Permissions', icon: ShieldCheck },
    { id: 'contracts' as ActiveTab, label: 'Cross-Platform API', icon: Smartphone },
    { id: 'architecture' as ActiveTab, label: 'Architecture Doc', icon: FileText },
    { id: 'health' as ActiveTab, label: 'System Health', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/30">
              ED
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-white text-base">EdTech Platform</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  Phase 1 Foundation
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Modular Monolith Architecture • 200 Students Initial Target</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300">{apiConnected ? 'API Live (Port 3000)' : 'Connecting API...'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
