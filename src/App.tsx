/**
 * EdTech Production Foundation Architecture Console
 * Single authoritative source of truth for the cross-platform platform
 */

import { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { ModuleCard } from './components/ModuleCard.tsx';
import { SchemaViewer } from './components/SchemaViewer.tsx';
import { RbacMatrix } from './components/RbacMatrix.tsx';
import { MobileContractViewer } from './components/MobileContractViewer.tsx';
import { DocViewer } from './components/DocViewer.tsx';
import { HealthDashboard } from './components/HealthDashboard.tsx';
import { EDTECH_MODULES } from './core/config/modules.ts';
import { Search, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('modules');
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModelForSchema, setSelectedModelForSchema] = useState<string | undefined>(undefined);

  // Probe API connection on mount
  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setApiConnected(true);
        }
      })
      .catch(() => {
        setApiConnected(false);
      });
  }, []);

  // Filter modules
  const categories = ['ALL', 'Assessment', 'Academic Core', 'Analytics & Habits', 'Administration', 'Platform Services'];
  const filteredModules = EDTECH_MODULES.filter((mod) => {
    const matchesCat = selectedCategory === 'ALL' || mod.category === selectedCategory;
    const matchesSearch =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.prismaModels.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSelectModelFromCard = (model: string) => {
    setSelectedModelForSchema(model);
    setActiveTab('schema');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} apiConnected={apiConnected} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: 15 CORE MODULES */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            {/* Executive Architecture Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      Target Initial Scale: 200 Students
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Zero Rewrite Scalability
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Production Modular Monolith Foundation
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    A unified, contract-driven architecture spanning 15 modules. The future React Native/Flutter mobile app and
                    web application share the identical Supabase PostgreSQL database, Prisma ORM schema, JWT authentication, and RESTful API boundaries.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                    <div className="text-2xl font-mono font-bold text-blue-400">15</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Core Modules</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                    <div className="text-2xl font-mono font-bold text-emerald-400">24</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Prisma Models</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                    <div className="text-2xl font-mono font-bold text-purple-400">5</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">RBAC Roles</div>
                  </div>
                </div>
              </div>

              {/* Quick Architectural Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No unnecessary microservices or queues in Phase 1</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Shared business logic across Web and Mobile</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% free-tier friendly during development</span>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter 15 modules, models, routes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredModules.map((mod) => (
                <ModuleCard key={mod.id} module={mod} onSelectModel={handleSelectModelFromCard} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PRISMA DATABASE SCHEMA */}
        {activeTab === 'schema' && <SchemaViewer initialSelectedModel={selectedModelForSchema} />}

        {/* TAB 3: RBAC & PERMISSIONS */}
        {activeTab === 'rbac' && <RbacMatrix />}

        {/* TAB 4: CROSS-PLATFORM API & MOBILE CONTRACTS */}
        {activeTab === 'contracts' && <MobileContractViewer />}

        {/* TAB 5: ARCHITECTURE SPECIFICATION DOCUMENT */}
        {activeTab === 'architecture' && <DocViewer />}

        {/* TAB 6: SYSTEM HEALTH & DIAGNOSTICS */}
        {activeTab === 'health' && <HealthDashboard />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>EdTech Foundation Architecture • Production Phase 1</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Supabase PostgreSQL</span>
            <span>•</span>
            <span>Prisma ORM</span>
            <span>•</span>
            <span>Modular Monolith</span>
            <span>•</span>
            <span>React Native Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
