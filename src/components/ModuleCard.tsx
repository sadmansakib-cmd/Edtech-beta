import { ModuleDefinition } from '../types/modules.ts';
import { Database, Route, Users, ShieldAlert, Sparkles } from 'lucide-react';

interface ModuleCardProps {
  key?: string;
  module: ModuleDefinition;
  onSelectModel?: (model: string) => void;
}

export function ModuleCard({ module, onSelectModel }: ModuleCardProps) {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Assessment':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Academic Core':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Analytics & Habits':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Administration':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getMobileBadge = (target: string) => {
    switch (target) {
      case 'Offline-First':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Online Real-Time':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      id={`module-card-${module.id}`}
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center border border-slate-700">
              {module.numericIndex}
            </span>
            <h3 className="font-semibold text-slate-100 text-base">{module.name}</h3>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(module.category)}`}>
            {module.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed mb-4">{module.description}</p>

        {/* Metadata Details */}
        <div className="space-y-3 text-xs mb-4">
          {/* Prisma Models */}
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-medium">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Prisma Models</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {module.prismaModels.map((model) => (
                <button
                  key={model}
                  onClick={() => onSelectModel?.(model)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 hover:bg-slate-700 font-mono text-[11px] border border-slate-700/60 transition-colors"
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Primary API Routes */}
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-medium">
              <Route className="w-3.5 h-3.5 text-indigo-400" />
              <span>API Routes</span>
            </div>
            <div className="space-y-0.5">
              {module.primaryApiRoutes.map((route) => (
                <div key={route} className="font-mono text-[11px] text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80 truncate">
                  {route}
                </div>
              ))}
            </div>
          </div>

          {/* Key Invariants */}
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Architectural Invariant</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
              {module.keyInvariants.map((inv, idx) => (
                <li key={idx} className="leading-snug text-slate-300">
                  {inv}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer tags */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Users className="w-3 h-3 text-slate-500" />
          <span>{module.primaryActors.join(', ')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${getMobileBadge(module.mobileTarget)}`}>
            📱 {module.mobileTarget}
          </span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {module.phase.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
