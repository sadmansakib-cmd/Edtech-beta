import { UserRole, Permission } from '../../types/auth.ts';
import { ModuleId } from '../../types/modules.ts';

/**
 * Deterministic Role-Based Access Control (RBAC) Matrix
 * Evaluated identically on Server, Web Client, and Mobile Application
 */

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    'questions:read',
    'questions:create',
    'questions:update',
    'questions:delete',
    'questions:publish',
    'practice:start',
    'practice:view_history',
    'exams:create',
    'exams:update',
    'exams:delete',
    'exams:publish',
    'exams:take',
    'exams:grade',
    'exams:view_results_own',
    'exams:view_results_all',
    'students:read',
    'students:create',
    'students:update',
    'students:archive',
    'batches:read',
    'batches:create',
    'batches:update',
    'batches:assign_students',
    'batches:assign_staff',
    'performance:view_own',
    'performance:view_batch',
    'performance:view_organization',
    'reading:start_timer',
    'reading:log_manual',
    'reading:view_own',
    'reading:audit_batch',
    'reading:verify',
    'staff:read',
    'staff:create',
    'staff:update',
    'staff:assign',
    'attendance:mark',
    'attendance:view_own',
    'attendance:view_batch',
    'attendance:view_all',
    'notifications:read_own',
    'notifications:broadcast',
    'reports:generate_student',
    'reports:generate_batch',
    'reports:generate_org',
    'payments:view_own',
    'payments:manage_plans',
    'system:audit_logs',
    'system:configure',
  ],

  [UserRole.ADMIN]: [
    'questions:read',
    'questions:create',
    'questions:update',
    'questions:publish',
    'practice:view_history',
    'exams:create',
    'exams:update',
    'exams:publish',
    'exams:grade',
    'exams:view_results_all',
    'students:read',
    'students:create',
    'students:update',
    'batches:read',
    'batches:create',
    'batches:update',
    'batches:assign_students',
    'batches:assign_staff',
    'performance:view_batch',
    'performance:view_organization',
    'reading:audit_batch',
    'reading:verify',
    'staff:read',
    'staff:create',
    'staff:assign',
    'attendance:mark',
    'attendance:view_batch',
    'attendance:view_all',
    'notifications:read_own',
    'notifications:broadcast',
    'reports:generate_student',
    'reports:generate_batch',
    'reports:generate_org',
    'payments:view_own',
    'payments:manage_plans',
    'system:audit_logs',
  ],

  [UserRole.TEACHER]: [
    'questions:read',
    'questions:create',
    'questions:update',
    'questions:publish',
    'practice:view_history',
    'exams:create',
    'exams:update',
    'exams:grade',
    'exams:view_results_all',
    'students:read',
    'batches:read',
    'performance:view_batch',
    'reading:audit_batch',
    'reading:verify',
    'staff:read',
    'attendance:mark',
    'attendance:view_batch',
    'notifications:read_own',
    'notifications:broadcast',
    'reports:generate_student',
    'reports:generate_batch',
  ],

  [UserRole.STUDENT]: [
    'questions:read',
    'practice:start',
    'practice:view_history',
    'exams:take',
    'exams:view_results_own',
    'students:read',
    'batches:read',
    'performance:view_own',
    'reading:start_timer',
    'reading:log_manual',
    'reading:view_own',
    'attendance:view_own',
    'notifications:read_own',
    'payments:view_own',
  ],

  [UserRole.PARENT]: [
    'performance:view_own',
    'reading:view_own',
    'attendance:view_own',
    'notifications:read_own',
    'reports:generate_student',
    'payments:view_own',
  ],
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

/**
 * Retrieve all permissions for a given role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role can access a module interface
 */
export function canAccessModule(role: UserRole, moduleId: ModuleId): boolean {
  switch (moduleId) {
    case 'question-bank':
      return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.TEACHER;
    case 'practice-system':
      return role === UserRole.STUDENT || role === UserRole.SUPER_ADMIN;
    case 'online-examination':
      return true; // All roles have appropriate sub-views (Author vs Taker vs Grader)
    case 'student-management':
      return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.TEACHER;
    case 'batch-management':
      return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.TEACHER;
    case 'student-performance':
      return true; // Filtered by own profile or batch
    case 'reading-hour-mgmt':
      return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.TEACHER;
    case 'reading-timer':
      return role === UserRole.STUDENT || role === UserRole.SUPER_ADMIN;
    case 'student-dashboard':
      return role === UserRole.STUDENT || role === UserRole.PARENT;
    case 'admin-panel':
      return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
    case 'teacher-staff-mgmt':
      return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
    case 'attendance':
      return role !== UserRole.PARENT; // Parents view via child summary
    case 'notifications':
      return true;
    case 'reports':
      return true;
    case 'payments-subscriptions':
      return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.PARENT || role === UserRole.STUDENT;
    default:
      return false;
  }
}
