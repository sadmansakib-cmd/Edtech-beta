import { useState } from 'react';
import { Database, Search, ArrowRight, Key, Layers } from 'lucide-react';

interface SchemaModel {
  name: string;
  module: string;
  description: string;
  fields: { name: string; type: string; isId?: boolean; isUnique?: boolean; isRelation?: boolean }[];
  relationsTo: string[];
}

const PRISMA_MODELS: SchemaModel[] = [
  {
    name: 'User',
    module: 'User Identity & Auth',
    description: 'Central identity linked to Supabase Auth UUID',
    fields: [
      { name: 'id', type: 'String (UUID)', isId: true },
      { name: 'email', type: 'String', isUnique: true },
      { name: 'fullName', type: 'String' },
      { name: 'role', type: 'UserRole (Enum)' },
      { name: 'isActive', type: 'Boolean' },
      { name: 'createdAt', type: 'DateTime' },
    ],
    relationsTo: ['StudentProfile', 'TeacherProfile', 'GuardianProfile', 'Notification', 'ExamSubmission', 'ReadingSession'],
  },
  {
    name: 'StudentProfile',
    module: 'Student Management (M4)',
    description: 'Student profile, academic streaks, reading minutes total, rank',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'userId', type: 'String', isUnique: true, isRelation: true },
      { name: 'admissionNumber', type: 'String', isUnique: true },
      { name: 'currentStreak', type: 'Int' },
      { name: 'totalReadingMins', type: 'Int' },
      { name: 'guardianId', type: 'String?', isRelation: true },
    ],
    relationsTo: ['User', 'GuardianProfile', 'BatchEnrollment', 'PerformanceMetric', 'SubjectMastery'],
  },
  {
    name: 'Batch',
    module: 'Batch Management (M5)',
    description: 'Class cohort and academic session container',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'organizationId', type: 'String', isRelation: true },
      { name: 'name', type: 'String' },
      { name: 'code', type: 'String', isUnique: true },
      { name: 'academicYear', type: 'String' },
      { name: 'startDate', type: 'DateTime' },
    ],
    relationsTo: ['Organization', 'BatchEnrollment', 'StaffBatchAssignment', 'ExamBatch', 'AttendanceRecord'],
  },
  {
    name: 'Question',
    module: 'Question Bank (M1)',
    description: 'Categorized assessment item with markdown, LaTeX, and JSON options',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'subjectId', type: 'String', isRelation: true },
      { name: 'topicId', type: 'String', isRelation: true },
      { name: 'authorId', type: 'String', isRelation: true },
      { name: 'type', type: 'QuestionType (Enum)' },
      { name: 'difficulty', type: 'DifficultyLevel (Enum)' },
      { name: 'content', type: 'String (Markdown/LaTeX)' },
      { name: 'options', type: 'Json' },
      { name: 'defaultMarks', type: 'Float' },
      { name: 'negativeMarks', type: 'Float' },
    ],
    relationsTo: ['Subject', 'Topic', 'User', 'ExamQuestion', 'PracticeAnswer'],
  },
  {
    name: 'PracticeSession',
    module: 'Practice System (M2)',
    description: 'Adaptive student practice set with untimed questions and hints',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'studentId', type: 'String', isRelation: true },
      { name: 'totalQuestions', type: 'Int' },
      { name: 'correctCount', type: 'Int' },
      { name: 'totalDurationSec', type: 'Int' },
    ],
    relationsTo: ['User', 'PracticeAnswer'],
  },
  {
    name: 'Exam',
    module: 'Online Examination (M3)',
    description: 'Timed assessment with auto-submission, negative marking, and tab-switch rules',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'title', type: 'String' },
      { name: 'durationMinutes', type: 'Int' },
      { name: 'status', type: 'ExamStatus (Enum)' },
      { name: 'startWindow', type: 'DateTime' },
      { name: 'endWindow', type: 'DateTime' },
      { name: 'maxTabSwitches', type: 'Int' },
    ],
    relationsTo: ['User', 'ExamBatch', 'ExamQuestion', 'ExamSubmission'],
  },
  {
    name: 'ExamSubmission',
    module: 'Online Examination (M3)',
    description: 'Server-authoritative student exam attempt and scoring record',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'examId', type: 'String', isRelation: true },
      { name: 'studentId', type: 'String', isRelation: true },
      { name: 'status', type: 'SubmissionStatus (Enum)' },
      { name: 'startedAt', type: 'DateTime' },
      { name: 'submittedAt', type: 'DateTime?' },
      { name: 'tabSwitchCount', type: 'Int' },
      { name: 'totalScore', type: 'Float' },
      { name: 'isPassed', type: 'Boolean?' },
    ],
    relationsTo: ['Exam', 'User', 'ExamAnswer'],
  },
  {
    name: 'ReadingSession',
    module: 'Reading Timer (M8)',
    description: 'Active reading session with anti-idle heartbeat monitoring',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'studentId', type: 'String', isRelation: true },
      { name: 'status', type: 'ReadingSessionStatus (Enum)' },
      { name: 'startedAt', type: 'DateTime' },
      { name: 'lastHeartbeatAt', type: 'DateTime' },
      { name: 'durationMinutes', type: 'Int' },
      { name: 'bookTitle', type: 'String?' },
    ],
    relationsTo: ['User', 'ReadingHeartbeat', 'ReadingLog'],
  },
  {
    name: 'ReadingHeartbeat',
    module: 'Reading Timer (M8)',
    description: 'Client sequence pings sent every 60s to prevent background cheating',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'readingSessionId', type: 'String', isRelation: true },
      { name: 'sequenceNumber', type: 'Int' },
      { name: 'clientTimestamp', type: 'DateTime' },
      { name: 'serverTimestamp', type: 'DateTime' },
      { name: 'isIdleDetected', type: 'Boolean' },
    ],
    relationsTo: ['ReadingSession'],
  },
  {
    name: 'ReadingLog',
    module: 'Reading Hour Mgmt (M7)',
    description: 'Verified reading minutes applied towards curriculum goals',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'studentId', type: 'String', isRelation: true },
      { name: 'readingSessionId', type: 'String?', isRelation: true },
      { name: 'minutesLogged', type: 'Int' },
      { name: 'isVerified', type: 'Boolean' },
      { name: 'logDate', type: 'DateTime' },
    ],
    relationsTo: ['User', 'ReadingSession'],
  },
  {
    name: 'AttendanceRecord',
    module: 'Attendance (M12)',
    description: 'Daily and session attendance entries per batch',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'studentId', type: 'String', isRelation: true },
      { name: 'batchId', type: 'String', isRelation: true },
      { name: 'date', type: 'DateTime' },
      { name: 'status', type: 'AttendanceStatus (Enum)' },
      { name: 'remarks', type: 'String?' },
    ],
    relationsTo: ['User', 'Batch'],
  },
  {
    name: 'PerformanceMetric',
    module: 'Student Performance (M6)',
    description: 'Aggregated analytics snapshot for instant student dashboard loading',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'studentProfileId', type: 'String', isRelation: true },
      { name: 'examAverage', type: 'Float' },
      { name: 'practiceAccuracy', type: 'Float' },
      { name: 'percentileRank', type: 'Float' },
      { name: 'readingTargetMetPct', type: 'Float' },
    ],
    relationsTo: ['StudentProfile'],
  },
];

interface SchemaViewerProps {
  initialSelectedModel?: string;
}

export function SchemaViewer({ initialSelectedModel }: SchemaViewerProps) {
  const [search, setSearch] = useState('');
  const [selectedModelName, setSelectedModelName] = useState<string>(initialSelectedModel || 'ExamSubmission');

  const filteredModels = PRISMA_MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.module.toLowerCase().includes(search.toLowerCase())
  );

  const activeModel = PRISMA_MODELS.find((m) => m.name === selectedModelName) || PRISMA_MODELS[0];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-slate-100">Prisma Database Architecture</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              prisma/schema.prisma
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            24 production relational models codifying all 15 modules. Free-tier Supabase PostgreSQL ready.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search entities or modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Navigation List */}
        <div className="lg:col-span-1 space-y-2 max-h-[580px] overflow-y-auto pr-1">
          {filteredModels.map((model) => (
            <button
              key={model.name}
              id={`schema-model-${model.name}`}
              onClick={() => setSelectedModelName(model.name)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedModelName === model.name
                  ? 'bg-blue-950/40 border-blue-600/60 text-white'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-xs">{model.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{model.fields.length} fields</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{model.description}</p>
              <div className="text-[10px] text-blue-400/80 mt-1.5 font-medium">{model.module}</div>
            </button>
          ))}
        </div>

        {/* Selected Model Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-mono font-bold text-white">{activeModel.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    {activeModel.module}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeModel.description}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">PostgreSQL Table</span>
                <div className="text-xs font-mono text-emerald-400">"{activeModel.name}"</div>
              </div>
            </div>

            {/* Field Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-2">Field Name</th>
                    <th className="pb-2">Data Type</th>
                    <th className="pb-2">Attributes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {activeModel.fields.map((field) => (
                    <tr key={field.name} className="hover:bg-slate-800/30">
                      <td className="py-2 text-slate-200 flex items-center gap-1.5">
                        {field.isId && <Key className="w-3 h-3 text-amber-400" />}
                        {field.name}
                      </td>
                      <td className="py-2 text-blue-400">{field.type}</td>
                      <td className="py-2">
                        {field.isId && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] mr-1">@id</span>}
                        {field.isUnique && <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] mr-1">@unique</span>}
                        {field.isRelation && <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] mr-1">relation</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Relations */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Connected Foreign Relations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeModel.relationsTo.map((rel) => (
                  <button
                    key={rel}
                    onClick={() => setSelectedModelName(rel)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
                  >
                    <span>{rel}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
