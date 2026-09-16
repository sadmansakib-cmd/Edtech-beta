import { useState } from 'react';
import { Smartphone, Globe, Code2, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export function MobileContractViewer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'reading-timer' | 'exam-submit' | 'dashboard'>('reading-timer');

  const contracts = {
    'reading-timer': {
      title: 'Reading Timer Heartbeat & Anti-Tamper',
      path: 'POST /api/v1/reading/timer/heartbeat',
      description: 'Used by both Web Timer and Mobile background service to verify active reading without clock manipulation.',
      requestPayload: `{
  "readingSessionId": "c4b92c42-7013-4315-9982-1279a0ec7b99",
  "sequenceNumber": 14,
  "clientTimestamp": "2026-09-16T10:00:00.000Z",
  "isIdleDetected": false
}`,
      responsePayload: `{
  "success": true,
  "data": {
    "verifiedMinutes": 14,
    "lastHeartbeatAccepted": true,
    "streakMaintained": true
  },
  "meta": {
    "timestamp": "2026-09-16T10:00:00.120Z"
  }
}`,
      mobileStrategy: 'React Native background service fires heartbeat every 60s. If connection drops, sequence is queued locally in SQLite and synced idempotently upon reconnect.',
    },
    'exam-submit': {
      title: 'Online Examination Auto/Manual Submission',
      path: 'POST /api/v1/exams/:id/submit',
      description: 'Calculates score server-side, verifies server timer window, checks tab switch violations.',
      requestPayload: `{
  "answers": [
    { "questionId": "q1", "selectedOptionIds": ["opt-B"], "timeSpentSeconds": 45 },
    { "questionId": "q2", "selectedOptionIds": ["opt-A", "opt-C"], "timeSpentSeconds": 90 }
  ],
  "tabSwitchCount": 1
}`,
      responsePayload: `{
  "success": true,
  "data": {
    "submissionId": "sub-9021a",
    "status": "SUBMITTED",
    "totalScore": 76.5,
    "maxMarks": 100.0,
    "isPassed": true,
    "tabSwitchWarning": false
  },
  "meta": {
    "timestamp": "2026-09-16T10:15:30.000Z"
  }
}`,
      mobileStrategy: 'Mobile uses AppState listener to track backgrounding as tab switch. Timer runs off server startedAt token to prevent device clock modification.',
    },
    'dashboard': {
      title: 'Aggregated Student Dashboard Payload',
      path: 'GET /api/v1/dashboard/student',
      description: 'Single high-density payload powering both Web home screen and Mobile home tab.',
      requestPayload: `// Headers
Authorization: Bearer <supabase_jwt>`,
      responsePayload: `{
  "success": true,
  "data": {
    "student": {
      "fullName": "Alex Chen",
      "currentStreak": 12,
      "totalReadingMins": 840
    },
    "upcomingExams": [
      { "id": "ex-1", "title": "Calculus Midterm", "startsAt": "2026-09-18T09:00:00Z" }
    ],
    "todayReadingTarget": {
      "targetMinutes": 60,
      "completedMinutes": 45
    },
    "unreadNotificationsCount": 3
  }
}`,
      mobileStrategy: 'Cached via TanStack Query (React Native) / WatermelonDB with 5-minute stale time. Renders instantly on mobile launch.',
    },
  };

  const activeContract = contracts[selectedEndpoint];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Cross-Platform API & Shared Contracts</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Web + Mobile Unified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strict single-backend contract: Future React Native/Flutter apps communicate via identical endpoints and Zod schemas.
          </p>
        </div>

        {/* Endpoint selector */}
        <div className="flex flex-wrap gap-2">
          {(['reading-timer', 'exam-submit', 'dashboard'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedEndpoint(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedEndpoint === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {key === 'reading-timer' && 'Reading Heartbeat'}
              {key === 'exam-submit' && 'Exam Submission'}
              {key === 'dashboard' && 'Student Dashboard'}
            </button>
          ))}
        </div>
      </div>

      {/* Contract Detail Panel */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">{activeContract.title}</h3>
            <div className="font-mono text-xs text-indigo-400 mt-0.5">{activeContract.path}</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-blue-400">
              <Globe className="w-3.5 h-3.5" /> Web Client
            </span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center gap-1 text-emerald-400">
              <Smartphone className="w-3.5 h-3.5" /> Mobile Client
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300">{activeContract.description}</p>

        {/* Code comparisons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Standard Request Envelope</span>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              {activeContract.requestPayload}
            </pre>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standard Response Envelope (ApiResponse&lt;T&gt;)</span>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
              {activeContract.responsePayload}
            </pre>
          </div>
        </div>

        {/* Mobile Offline & Background Strategy */}
        <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-medium mb-1">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Mobile Offline & Background Synchronization Strategy</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">{activeContract.mobileStrategy}</p>
        </div>
      </div>
    </div>
  );
}
