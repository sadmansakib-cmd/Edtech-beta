import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { EDTECH_MODULES } from './src/core/config/modules.ts';
import { ROLE_PERMISSIONS, hasPermission } from './src/core/auth/rbac.ts';
import { UserRole, Permission } from './src/types/auth.ts';
import { ApiResponse } from './src/types/api.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logger for API requests
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // 1. Health & Readiness
  app.get('/api/v1/health', (_req, res) => {
    const response: ApiResponse<{
      status: string;
      version: string;
      environment: string;
      targetStudentsInitial: number;
      modulesTotal: number;
      databaseEngine: string;
      authProvider: string;
      timestamp: string;
    }> = {
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0-PROD-FOUNDATION',
        environment: process.env.NODE_ENV || 'development',
        targetStudentsInitial: 200,
        modulesTotal: EDTECH_MODULES.length,
        databaseEngine: 'Supabase PostgreSQL via Prisma ORM',
        authProvider: 'Supabase Auth (RFC 7519 JWT)',
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    res.json(response);
  });

  // 2. Architecture Specifications & Metadata
  app.get('/api/v1/architecture', (_req, res) => {
    const response: ApiResponse<{
      paradigm: string;
      scaleProfile: {
        phase1Students: number;
        scalingHorizon: string;
        freeTierOptimized: boolean;
      };
      modules: typeof EDTECH_MODULES;
      roles: string[];
      rolePermissions: typeof ROLE_PERMISSIONS;
    }> = {
      success: true,
      data: {
        paradigm: 'Modular Monolith with Clean Domain Boundaries and Shared Contracts',
        scaleProfile: {
          phase1Students: 200,
          scalingHorizon: '10,000+ students without core rewrites',
          freeTierOptimized: true,
        },
        modules: EDTECH_MODULES,
        roles: Object.values(UserRole),
        rolePermissions: ROLE_PERMISSIONS,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    res.json(response);
  });

  // 3. Module Registry
  app.get('/api/v1/modules', (_req, res) => {
    const response: ApiResponse<typeof EDTECH_MODULES> = {
      success: true,
      data: EDTECH_MODULES,
      meta: {
        total: EDTECH_MODULES.length,
        timestamp: new Date().toISOString(),
      },
    };
    res.json(response);
  });

  // 4. RBAC Evaluation Endpoint
  app.post('/api/v1/rbac/evaluate', (req, res) => {
    const { role, permission } = req.body as { role: UserRole; permission: Permission };
    if (!role || !permission) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Both role and permission must be provided',
        },
      });
    }

    const allowed = hasPermission(role, permission);
    const response: ApiResponse<{ role: UserRole; permission: Permission; allowed: boolean }> = {
      success: true,
      data: {
        role,
        permission,
        allowed,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    res.json(response);
  });

  // 5. Database Schema Structure Metadata
  app.get('/api/v1/schema/metadata', (_req, res) => {
    const schemaSummary = {
      database: 'PostgreSQL',
      orm: 'Prisma ORM',
      schemaFile: 'prisma/schema.prisma',
      totalModels: 24,
      totalEnums: 10,
      domainsCovered: [
        'User Identity & Profiles',
        'Academic Batches & Enrollment',
        'Question Bank & Taxonomy',
        'Practice Sessions & Answers',
        'Examinations & High-Integrity Submissions',
        'Reading Hour Management & Anti-Tamper Timer',
        'Student Analytics & Performance Snapshots',
        'Attendance Register',
        'Multi-Channel Notifications',
        'Institutional Reports & Audit Logs',
        'Subscription Plans & Invoices',
      ],
    };

    const response: ApiResponse<typeof schemaSummary> = {
      success: true,
      data: schemaSummary,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    res.json(response);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EdTech Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
