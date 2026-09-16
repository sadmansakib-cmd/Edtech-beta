/**
 * Core Authentication & RBAC Types
 * Shared across Web, Backend API, and Future Mobile Apps
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export type Permission =
  // Question Bank
  | 'questions:read'
  | 'questions:create'
  | 'questions:update'
  | 'questions:delete'
  | 'questions:publish'
  // Practice System
  | 'practice:start'
  | 'practice:view_history'
  // Online Examination
  | 'exams:create'
  | 'exams:update'
  | 'exams:delete'
  | 'exams:publish'
  | 'exams:take'
  | 'exams:grade'
  | 'exams:view_results_own'
  | 'exams:view_results_all'
  // Student Management
  | 'students:read'
  | 'students:create'
  | 'students:update'
  | 'students:archive'
  // Batch Management
  | 'batches:read'
  | 'batches:create'
  | 'batches:update'
  | 'batches:assign_students'
  | 'batches:assign_staff'
  // Performance & Analytics
  | 'performance:view_own'
  | 'performance:view_batch'
  | 'performance:view_organization'
  // Reading Hour & Timer
  | 'reading:start_timer'
  | 'reading:log_manual'
  | 'reading:view_own'
  | 'reading:audit_batch'
  | 'reading:verify'
  // Teacher/Staff Management
  | 'staff:read'
  | 'staff:create'
  | 'staff:update'
  | 'staff:assign'
  // Attendance
  | 'attendance:mark'
  | 'attendance:view_own'
  | 'attendance:view_batch'
  | 'attendance:view_all'
  // Notifications
  | 'notifications:read_own'
  | 'notifications:broadcast'
  // Reports
  | 'reports:generate_student'
  | 'reports:generate_batch'
  | 'reports:generate_org'
  // Payments & Subscriptions
  | 'payments:view_own'
  | 'payments:manage_plans'
  // System Admin
  | 'system:audit_logs'
  | 'system:configure';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId?: string;
  studentProfileId?: string;
  teacherProfileId?: string;
  activeBatchIds?: string[];
}

export interface SessionContext {
  user: AuthUser;
  token: string;
  expiresAt: number;
}
