import { useState } from 'react';
import { BookOpen, CheckCircle, ChevronRight, Terminal, Shield } from 'lucide-react';

export function DocViewer() {
  const [activeSection, setActiveSection] = useState<number>(1);

  const sections = [
    {
      id: 1,
      title: '1. Product Requirements Analysis',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            The platform is architected for an educational institution initially hosting approximately <strong>200 active students</strong>,
            10–15 teachers/staff members, and administrative coordinators. The peak concurrent load in Phase 1 occurs during synchronized
            batch examinations (200 simultaneous users submitting answers).
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-white">Scaling Target:</div>
            <p>10,000+ students across multi-branch cohorts without core architecture rewrites.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-white">Budget & Free-Tier Discipline:</div>
            <p>
              Supabase Free Tier (PostgreSQL + Auth + Storage), Vercel / Cloud Run serverless hosting, and Cloudflare CDN provide
              $0 infrastructure cost during development and testing.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: '2. System Architecture (Modular Monolith)',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            We strictly avoid premature microservices. Microservices introduce network overhead, distributed transaction failures,
            and deployment expenses that are detrimental to a 200-student organization.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-blue-300 space-y-1">
            <div>Pattern: Modular Monolith with In-Process Service Contracts</div>
            <div>Database: PostgreSQL with Connection Pooling (PgBouncer)</div>
            <div>Client Tier: Web (Next.js/React) + Mobile (React Native / Expo) sharing same /api/v1/*</div>
          </div>
          <p>
            Each module is structured such that its domain logic is decoupled behind service interfaces. If Exam Submission or Reading Timer
            demands independent scaling in the future, it can be extracted in under 48 hours without touching frontend code.
          </p>
        </div>
      ),
    },
    {
      id: 3,
      title: '3. Database Schema & Prisma ORM',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            The entire schema is codified in <code>prisma/schema.prisma</code>, containing 24 relational tables and 10 enums covering
            all 15 modules.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li><strong>Relational Integrity:</strong> Foreign key cascades for profiles and enrollments; restrict deletes on questions with active exam links.</li>
            <li><strong>Optimized Indexing:</strong> Composite indexes on <code>(batchId, studentId)</code>, <code>(examId, status)</code>, and <code>(studentId, logDate)</code>.</li>
            <li><strong>Audit Logging:</strong> Immutable <code>AuditLog</code> table capturing administrative mutations with IP and actor metadata.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 4,
      title: '4. Module Boundaries & Rules',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Module boundaries prevent spaghetti architecture as the team expands:</p>
          <div className="space-y-2">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-semibold text-emerald-400">Rule 1: No Direct Cross-Module Joins</span>
              <p className="text-slate-400 mt-0.5">Services do not run raw joins on other modules' internal tables without explicit public repository methods.</p>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-semibold text-emerald-400">Rule 2: DTO Contracts Only</span>
              <p className="text-slate-400 mt-0.5">Modules communicate across service boundaries via strongly typed DTOs defined in <code>shared/contracts</code>.</p>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-semibold text-emerald-400">Rule 3: Decoupled Events</span>
              <p className="text-slate-400 mt-0.5">Exam submissions emit asynchronous events for performance score recalculation and notification dispatch.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: '5. Authentication & Authorization',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Supabase Auth generates standard RFC 7519 JWTs containing the user's UUID, email, and assigned institutional role.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Web:</strong> HttpOnly secure SameSite=Strict cookies to guard against XSS.</li>
            <li><strong>Mobile:</strong> <code>Authorization: Bearer &lt;token&gt;</code> stored in OS-level hardware keystores (Keychain / EncryptedSharedPreferences).</li>
            <li><strong>Zero Hop Verification:</strong> JWT tokens are cryptographically verified locally on the server using the JWT secret without incurring Supabase network latency.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 6,
      title: '6. Roles & Permissions (RBAC Matrix)',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Five explicit roles: <code>SUPER_ADMIN</code>, <code>ADMIN</code>, <code>TEACHER</code>, <code>STUDENT</code>, and <code>PARENT</code>.
          </p>
          <p>
            Access is enforced via pure declarative functions (<code>hasPermission</code>) shared across client and server. Students cannot access answer keys; teachers cannot delete organizational batches; parents receive read-only child progress snapshots.
          </p>
        </div>
      ),
    },
    {
      id: 7,
      title: '7. API Boundaries & Standard Envelopes',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Every endpoint adheres to the <code>ApiResponse&lt;T&gt;</code> envelope.
          </p>
          <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-blue-300">
{`{
  "success": true,
  "data": { ... },
  "error": { "code": "VALIDATION_FAILED", "message": "..." },
  "meta": { "page": 1, "limit": 20, "timestamp": "2026-09-16T10:00:00Z" }
}`}
          </pre>
        </div>
      ),
    },
    {
      id: 8,
      title: '8. Folder Structure & Organization',
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>Clean modular separation accommodating immediate web rendering and seamless mobile code sharing:</p>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400">
            <div>├── ARCHITECTURE.md # Technical source of truth</div>
            <div>├── prisma/schema.prisma # 15-module database definition</div>
            <div>├── server.ts # Production Express API + Vite middleware</div>
            <div>├── src/core/ # RBAC, configs, error taxonomy</div>
            <div>├── src/modules/ # 15 modular domains</div>
            <div>├── src/types/ # Universal TypeScript contracts</div>
            <div>└── src/components/ # Web UI and consoles</div>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: '9. Testing Strategy',
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>Comprehensive test pyramid designed for zero-cost GitHub Actions CI:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Unit Tests (&gt;85% coverage):</strong> Pure exam scoring engine, negative mark calculation, reading anti-tamper heartbeat verification.</li>
            <li><strong>Integration Tests:</strong> API endpoints verified against containerized PostgreSQL test instance.</li>
            <li><strong>E2E Tests:</strong> Critical student workflows (login -&gt; take timed test -&gt; auto-submit -&gt; check streak).</li>
          </ul>
        </div>
      ),
    },
    {
      id: 10,
      title: '10. Security Requirements & Integrity Enforcements',
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <ul className="list-disc list-inside space-y-1.5">
            <li><strong>Server-Authoritative Clock:</strong> Clients cannot forge exam durations or reading logs. Duration is calculated against server timestamps.</li>
            <li><strong>Anti-Tampering Heartbeats:</strong> Reading timer requires 60-second periodic pings; missing heartbeats cap session duration.</li>
            <li><strong>PostgreSQL Row-Level Security (RLS):</strong> Prevents unauthorized reads at the database engine level.</li>
            <li><strong>Input Sanitization:</strong> Strict Zod validation on every request body.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 11,
      title: '11. Deployment Architecture',
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>Three-tier production layout utilizing free and low-cost tiers:</p>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="text-white">Tier 1: Cloudflare Edge (DNS, SSL, WAF, DDoS mitigation)</div>
            <div className="text-blue-300">Tier 2: Vercel / Cloud Run Serverless & Container Hosting</div>
            <div className="text-emerald-300">Tier 3: Supabase Managed PostgreSQL + PgBouncer Connection Pooling</div>
          </div>
        </div>
      ),
    },
    {
      id: 12,
      title: '12. Future Mobile Application Integration',
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>React Native / Expo and Flutter mobile clients communicate directly with the same backend:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Shared Contracts:</strong> 100% of TypeScript interfaces and validation schemas are shared with zero code duplication.</li>
            <li><strong>Offline Storage:</strong> SQLite caching for Practice Sets and offline Reading Timer sessions.</li>
            <li><strong>Push Notifications:</strong> Firebase Cloud Messaging (FCM) / Expo Push integrated into the notifications hub.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Table of Contents Sidebar */}
      <div className="lg:col-span-1 space-y-1 p-3 rounded-xl bg-slate-900 border border-slate-800 max-h-[620px] overflow-y-auto">
        <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>Specifications</span>
        </div>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
              activeSection === sec.id
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="truncate">{sec.title}</span>
            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeSection === sec.id ? 'opacity-100' : 'opacity-40'}`} />
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            {sections[activeSection - 1].title}
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved Spec
          </span>
        </div>

        <div>{sections[activeSection - 1].content}</div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Repository Source: <code className="text-slate-400 font-mono">/ARCHITECTURE.md</code>
          </span>
          <span>Section {activeSection} of 12</span>
        </div>
      </div>
    </div>
  );
}
