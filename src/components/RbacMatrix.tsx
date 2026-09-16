import { useState } from 'react';
import { UserRole, Permission } from '../types/auth.ts';
import { hasPermission, ROLE_PERMISSIONS } from '../core/auth/rbac.ts';
import { ShieldCheck, CheckCircle2, XCircle, UserCheck } from 'lucide-react';

export function RbacMatrix() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);

  const testPermissions: { category: string; permissions: { key: Permission; label: string; desc: string }[] }[] = [
    {
      category: 'Question Bank & Assessment',
      permissions: [
        { key: 'questions:create', label: 'Create Questions', desc: 'Add new items to question bank' },
        { key: 'questions:publish', label: 'Publish Questions', desc: 'Make questions available for exams' },
        { key: 'exams:create', label: 'Create Scheduled Exam', desc: 'Configure assessment parameters' },
        { key: 'exams:take', label: 'Take Exam', desc: 'Participate in active timed exam session' },
        { key: 'exams:grade', label: 'Grade & Evaluate', desc: 'Override marks and provide feedback' },
      ],
    },
    {
      category: 'Habits & Reading Hours',
      permissions: [
        { key: 'reading:start_timer', label: 'Start Reading Timer', desc: 'Engage active timer with anti-tamper heartbeats' },
        { key: 'reading:log_manual', label: 'Manual Reading Log', desc: 'Submit unverified reading hours' },
        { key: 'reading:audit_batch', label: 'Audit Batch Reading', desc: 'Review student compliance logs' },
        { key: 'reading:verify', label: 'Verify Reading Minutes', desc: 'Approve manual submissions' },
      ],
    },
    {
      category: 'Academic Administration',
      permissions: [
        { key: 'students:create', label: 'Create Student Profile', desc: 'Enroll new student and generate admission ID' },
        { key: 'batches:create', label: 'Create Batch', desc: 'Establish new cohort' },
        { key: 'attendance:mark', label: 'Mark Attendance', desc: 'Log daily student presence' },
        { key: 'reports:generate_org', label: 'Generate Org Reports', desc: 'Export institution-wide KPIs' },
        { key: 'system:configure', label: 'System Configuration', desc: 'Manage institutional settings' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Role Selector Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">RBAC Capability Evaluator</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Shared authorization logic running identically on Web, Server, and Mobile.
            </p>
          </div>

          {/* Role Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {Object.values(UserRole).map((role) => (
              <button
                key={role}
                id={`role-btn-${role}`}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Summary Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Active Test Role:</span>
            <span className="font-mono font-semibold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {selectedRole}
            </span>
          </div>
          <div className="text-slate-400">
            Assigned Capabilities: <span className="text-emerald-400 font-mono font-bold">{ROLE_PERMISSIONS[selectedRole].length}</span> / 38
          </div>
        </div>
      </div>

      {/* Permission Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testPermissions.map((cat) => (
          <div key={cat.category} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              {cat.category}
            </h3>

            <div className="space-y-2">
              {cat.permissions.map((p) => {
                const allowed = hasPermission(selectedRole, p.key);
                return (
                  <div
                    key={p.key}
                    className={`p-2.5 rounded-lg border transition-all ${
                      allowed
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{p.label}</span>
                      {allowed ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ALLOW</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-rose-500/70 font-mono">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>DENY</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{p.desc}</p>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{p.key}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
