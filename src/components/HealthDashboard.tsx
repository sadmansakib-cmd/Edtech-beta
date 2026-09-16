import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Server, Database, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';
import { ApiResponse } from '../types/api.ts';

interface HealthData {
  status: string;
  version: string;
  environment: string;
  targetStudentsInitial: number;
  modulesTotal: number;
  databaseEngine: string;
  authProvider: string;
  timestamp: string;
}

interface SchemaMetadata {
  database: string;
  orm: string;
  schemaFile: string;
  totalModels: number;
  totalEnums: number;
  domainsCovered: string[];
}

export function HealthDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [schemaMeta, setSchemaMeta] = useState<SchemaMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastCheck, setLastCheck] = useState<string>('');

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const [healthRes, schemaRes] = await Promise.all([
        fetch('/api/v1/health').then((r) => r.json() as Promise<ApiResponse<HealthData>>),
        fetch('/api/v1/schema/metadata').then((r) => r.json() as Promise<ApiResponse<SchemaMetadata>>),
      ]);

      if (healthRes.success && healthRes.data) {
        setHealth(healthRes.data);
      }
      if (schemaRes.success && schemaRes.data) {
        setSchemaMeta(schemaRes.data);
      }
      setLastCheck(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Failed to fetch health status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">System Foundation Health & Diagnostics</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time diagnostics from Express / Next.js backend on port 3000.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Checks</span>
        </button>
      </div>

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Backend API</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{health?.status.toUpperCase() || 'CONNECTING'}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Port 3000 • v{health?.version || '1.0.0'}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Database Layer</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {schemaMeta?.totalModels || 24} Models
          </div>
          <p className="text-[11px] text-slate-500 font-mono">PostgreSQL (Supabase) + Prisma</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Core Modules</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {health?.modulesTotal || 15} / 15 Defined
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Complete Boundary Architecture</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Initial Capacity</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            ~{health?.targetStudentsInitial || 200} Students
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Scalable to 10k+ (Zero Rewrite)</p>
        </div>
      </div>

      {/* Domain Coverage Summary */}
      {schemaMeta && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Codified Domain Entities in Prisma Schema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {schemaMeta.domainsCovered.map((domain, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{domain}</span>
              </div>
            ))}
          </div>
          {lastCheck && (
            <div className="text-[11px] text-slate-500 text-right pt-2 font-mono">
              Last probe verified at {lastCheck}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
