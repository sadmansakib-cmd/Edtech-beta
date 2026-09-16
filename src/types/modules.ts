/**
 * Module Registry & Boundary Specifications
 * Codifies the 15 core architectural modules of the EdTech platform
 */

export type ModuleId =
  | 'question-bank'
  | 'practice-system'
  | 'online-examination'
  | 'student-management'
  | 'batch-management'
  | 'student-performance'
  | 'reading-hour-mgmt'
  | 'reading-timer'
  | 'student-dashboard'
  | 'admin-panel'
  | 'teacher-staff-mgmt'
  | 'attendance'
  | 'notifications'
  | 'reports'
  | 'payments-subscriptions';

export interface ModuleDefinition {
  id: ModuleId;
  numericIndex: number;
  name: string;
  category: 'Assessment' | 'Academic Core' | 'Analytics & Habits' | 'Administration' | 'Platform Services';
  phase: 'Phase 1 (Foundation)' | 'Phase 2 (Assessment & Tracking)' | 'Phase 3 (Analytics & Operations)' | 'Phase 4 (Enterprise & Payments)';
  description: string;
  prismaModels: string[];
  primaryApiRoutes: string[];
  primaryActors: ('STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' | 'PARENT')[];
  mobileTarget: 'Offline-First' | 'Online Real-Time' | 'Standard Read/Write';
  keyInvariants: string[];
}
