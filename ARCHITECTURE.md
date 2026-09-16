# Technical Architecture Document
## Production-Oriented Cross-Platform EdTech Platform

**Version:** 1.0.0-PROD-FOUNDATION  
**Status:** Approved for Foundation / Phase 1  
**Target Initial Capacity:** 200 concurrent active students (Phase 1)  
**Scaling Target:** 10,000+ students without core architecture rewrites  
**Primary Platform Targets:** Web-first responsive SPA/SSR + Future React Native / Expo & Flutter mobile clients

---

## Table of Contents
1. [Product Requirements Analysis](#1-product-requirements-analysis)
2. [System Architecture](#2-system-architecture)
3. [Database Schema & Data Architecture](#3-database-schema--data-architecture)
4. [Modules and Module Boundaries](#4-modules-and-module-boundaries)
5. [Authentication and Authorization](#5-authentication-and-authorization)
6. [Roles and Permissions (RBAC Matrix)](#6-roles-and-permissions-rbac-matrix)
7. [API Boundaries and Contracts](#7-api-boundaries-and-contracts)
8. [Folder Structure & Code Organization](#8-folder-structure--code-organization)
9. [Testing Strategy](#9-testing-strategy)
10. [Security Requirements & Integrity Enforcements](#10-security-requirements--integrity-enforcements)
11. [Deployment & Infrastructure Architecture](#11-deployment--infrastructure-architecture)
12. [Future Mobile Application Integration](#12-future-mobile-application-integration)
13. [Phase 1 Implementation Roadmap](#13-phase-1-implementation-roadmap)

---

## 1. Product Requirements Analysis

### 1.1 Organizational Context & Scale
The platform serves a structured educational institution (initially ~200 enrolled students across multiple batches, 10–15 teachers/staff, and administrative personnel). 

- **Phase 1 Initial Load:** 200 active students, peak examination load of 200 simultaneous submissions within a 60-minute window.
- **Scale Horizon:** 10,000+ students across dozens of institutions or regional batches.
- **Cost Constraint:** Maximum utilization of free-tier and low-cost development infrastructure (Supabase Free, Vercel/Cloud Run, Cloudflare CDN) during development and testing, requiring zero code rewrites when moving to paid production tiers.

### 1.2 The 15 Core Modules
| # | Module Name | Functional Scope | Key Actors |
|---|---|---|---|
| **1** | **Question Bank** | Multi-topic repository, questions (MCQ, Multi-select, Numerical, True/False), difficulty levels, tag taxonomy, rich explanations, LaTeX/image asset support. | Admin, Teacher |
| **2** | **Practice System** | Self-paced student practice, topic-based drills, immediate hints, solution reviews, untimed/timed adaptive sets. | Student |
| **3** | **Online Examination** | Scheduled proctored tests, time window enforcements, server-authoritative timer, auto-submission, negative marking, tab-switch monitoring. | Student, Teacher, Admin |
| **4** | **Student Management** | Student lifecycle (onboarding, profile, guardian contact, batch enrollment history, status). | Admin, Staff |
| **5** | **Batch Management** | Academic cohorts, assigned mentors, subject schedules, enrollment rosters. | Admin, Teacher |
| **6** | **Student Performance** | Diagnostic scorecards, percentile calculation, subject mastery indices, weak-area identification, historical trend lines. | Student, Teacher, Admin, Parent |
| **7** | **Reading Hour Management** | Institutional daily/weekly reading targets, assigned literature/materials, verified logs, reading goal compliance. | Teacher, Admin, Student |
| **8** | **Reading Timer** | Client-side active timer with periodic server heartbeats (anti-idle / anti-tamper), pause/resume, distraction log. | Student |
| **9** | **Student Dashboard** | Unified command center: daily streak, upcoming tests, reading compliance meter, recent performance, urgent announcements. | Student |
| **10** | **Admin Panel** | Institutional overview, user provisioning, batch allocation, audit trail inspection, system configuration. | Super Admin, Admin |
| **11** | **Teacher/Staff Management** | Staff directories, qualification records, batch allocations, subject authoring rights. | Super Admin, Admin |
| **12** | **Attendance** | Daily and batch-session attendance tracking, biometric/manual check-in, leaves, chronic absence alerts. | Teacher, Admin, Student |
| **13** | **Notifications** | Multichannel notification inbox, system alerts, exam countdowns, reading milestone achievements. | All Roles |
| **14** | **Reports** | Automated grade cards, institutional attendance sheets, reading audit logs, PDF/CSV export generation. | Admin, Teacher |
| **15** | **Future Payments / Subscriptions** | Fee structures, plan tiers, payment receipts, payment gateway webhook handlers. | Admin, Parent, Student |

---

## 2. System Architecture

### 2.1 The Architectural Paradigm: Modular Monolith
To prevent unnecessary microservices overhead while ensuring zero rewrite when scaling:
- **Modular Monolith**: The entire system resides in a unified codebase with strictly enforced domain boundaries, private module states, and explicit contract-driven public APIs.
- **Why NOT Microservices?** For a 200-student initial user base (and even up to 50,000 users), microservices introduce network latency, distributed transaction complexity, deployment overhead, and significant infrastructure costs.
- **Future Extraction Path:** Each module is structured such that its data access and business logic are isolated behind clean Service interfaces. If Examination or Reading Timer requires independent scaling in the future, the module can be extracted into an isolated container service in less than 2 days.

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|  +-----------------------------+     +-------------------------------+  |
|  | Web Client (Next.js/React)  |     | Future Mobile App (RN/Expo)   |  |
|  | Tailwind CSS + Query + Store|     | Shared DTOs & Auth Client     |  |
|  +-----------------------------+     +-------------------------------+  |
+-------------------------------------------------------------------------+
                                    | (HTTPS / RESTful JSON / WSS)
                                    v
+-------------------------------------------------------------------------+
|                  CLOUDFLARE EDGE (WAF, SSL, Rate Limit)                 |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                         APPLICATION SERVER TIER                         |
|  +-------------------------------------------------------------------+  |
|  | Unified API Gateway / Router (/api/v1/*)                          |  |
|  | Middleware: Auth (Supabase JWT), RBAC Guard, Rate Limiter, Logger |  |
|  +-------------------------------------------------------------------+  |
|                                    |                                    |
|   +-------------------+  +-------------------+  +-------------------+   |
|   | Questions Service |  |  Exams Service    |  |  Reading Service  |   |
|   +-------------------+  +-------------------+  +-------------------+   |
|   +-------------------+  +-------------------+  +-------------------+   |
|   | Students Service  |  |  Batches Service  |  | Attendance Service|   |
|   +-------------------+  +-------------------+  +-------------------+   |
|   +-------------------+  +-------------------+  +-------------------+   |
|   | Performance Serv. |  | Staff / Auth Serv |  | Notifications Svc |   |
|   +-------------------+  +-------------------+  +-------------------+   |
|                                    |                                    |
|  +-------------------------------------------------------------------+  |
|  | Data Access Layer: Prisma ORM (Typed Queries, Prepared Statements)|  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                    | Connection Pool (PgBouncer)
                                    v
+-------------------------------------------------------------------------+
|                   PERSISTENCE TIER (Supabase PostgreSQL)                 |
|  +-------------------------------------------------------------------+  |
|  | 15 Domain Models | Enums | Indexes | Foreign Keys | Row Level Sec |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 3. Database Schema & Data Architecture

The complete database schema is codified in standard Prisma ORM (`prisma/schema.prisma`), mapped directly to PostgreSQL.

### 3.1 Primary Entities & Relations
1. **Users & Auth:**
   - `User`: Primary identity linked to Supabase Auth UID (`id: String @id`).
   - `Role`: Enum (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`).
   - Profiles: `StudentProfile`, `TeacherProfile`, `GuardianProfile`.
2. **Academic Hierarchy:**
   - `Batch`: Groups of students (e.g. "Batch 2026 Alpha").
   - `BatchEnrollment`: Many-to-many relation with status (`ACTIVE`, `SUSPENDED`, `COMPLETED`).
3. **Assessment & Question Bank:**
   - `Subject`, `Topic`: Hierarchical curriculum taxonomy.
   - `Question`: Question item with type (`MCQ_SINGLE`, `MCQ_MULTI`, `NUMERICAL`, `TRUE_FALSE`), options JSON, correct answers, explanation, difficulty (`EASY`, `MEDIUM`, `HARD`), marks, negative marks.
   - `Exam`: Scheduled assessment with duration, window dates, pass percentage, shuffle options.
   - `ExamQuestion`: Join table with custom marks and order.
   - `ExamSubmission`: Student exam session, start time, submit time, calculated score, status (`IN_PROGRESS`, `SUBMITTED`, `EVALUATED`, `TIMED_OUT`), violation count.
   - `ExamAnswer`: Individual question response with awarded score and isCorrect flag.
4. **Practice System:**
   - `PracticeSession`: Untimed or custom practice drill.
   - `PracticeAnswer`: Student attempt logs with time spent per question.
5. **Reading Engine:**
   - `ReadingTarget`: Target minutes set by batch or individual student (e.g., 60 mins/day).
   - `ReadingLog`: Verified reading record, start time, end time, duration in minutes, verified flag.
   - `ReadingHeartbeat`: Client-side anti-tamper heartbeat ping sent every 60 seconds.
6. **Attendance & Performance:**
   - `AttendanceRecord`: Daily or batch-session attendance (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
   - `PerformanceSnapshot`: Cached analytics for fast dashboard rendering (weekly average, rank, percentile).
7. **Institutional & Support:**
   - `Notification`: In-app alerts, read status, channel (`IN_APP`, `PUSH`, `EMAIL`).
   - `ReportAudit`: Record of generated institutional reports.
   - `SubscriptionPlan`, `BillingRecord`: Future monetization and fee collection structures.

---

## 4. Modules and Module Boundaries

To enforce high cohesion and low coupling, each module follows a strict layer structure:

```
src/modules/[module-name]/
├── domain/            # Pure entity interfaces and business invariants
├── dtos/              # Request/Response validation schemas (Zod)
├── services/          # Business logic and cross-module transactions
├── repositories/      # Database queries via Prisma Client
└── routes/            # REST API endpoints & route handlers
```

### Module Boundary Rules
1. **No Cross-Module Database Joins in Code:** A module's service must never directly query another module's internal Prisma models unless explicitly exposed via a public query contract.
2. **DTO Contracts Only:** Inter-module communication happens through typed DTOs (Data Transfer Objects) defined in `@/types/modules`.
3. **Event Dispatches for Side Effects:** When an Exam is completed, `ExamService` does not directly manipulate `NotificationService` synchronously; it emits an event (`exam.submitted`), allowing `PerformanceService` and `NotificationService` to respond cleanly.

---

## 5. Authentication and Authorization

### 5.1 Authentication Mechanism
- **Provider:** Supabase Auth (backed by PostgreSQL `auth.users`).
- **Token Format:** Standard RFC 7519 JSON Web Token (JWT).
- **Transport:**
  - **Web Application:** Secure HTTP-only, SameSite=Strict cookies (primary) or `Authorization: Bearer <token>` headers.
  - **Mobile Application:** `Authorization: Bearer <token>` stored in OS-level secure storage (`expo-secure-store` / Keychain / EncryptedSharedPreferences).
- **Token Verification:** A shared lightweight verification utility parses and validates the Supabase JWT using the project's JWT secret or public key without making network hops to Supabase on every request.

---

## 6. Roles and Permissions (RBAC Matrix)

The system uses declarative Role-Based Access Control (RBAC) with granular capabilities.

### 6.1 Role Definitions
- **SUPER_ADMIN**: Organization owner, platform configurator, full systemic rights.
- **ADMIN**: Academic coordinator, batch creator, student manager, fee and report auditor.
- **TEACHER**: Question author, exam creator, attendance marker, reading mentor.
- **STUDENT**: Learner, exam taker, practice participant, reading timer user.
- **PARENT**: Observer, grade and attendance viewer, fee payer.

### 6.2 Permission Capability Matrix
| Capability | Super Admin | Admin | Teacher | Student | Parent |
|---|:---:|:---:|:---:|:---:|:---:|
| `questions:manage` |  |  |  | ❌ | ❌ |
| `exams:create` |  |  |  | ❌ | ❌ |
| `exams:take` | ❌ | ❌ | ❌ |  | ❌ |
| `exams:grade` |  |  |  | ❌ | ❌ |
| `students:manage` |  |  | 👁️ Read-Only | ❌ | ❌ |
| `batches:manage` |  |  | 👁️ Assigned | ❌ | ❌ |
| `reading:log_self` | ❌ | ❌ | ❌ |  | ❌ |
| `reading:audit_all`|  |  |  | ❌ | 👁️ Child Only |
| `attendance:mark` |  |  |  | ❌ | ❌ |
| `reports:generate` |  |  |  | ❌ | 👁️ Child Card |
| `system:configure` |  | ❌ | ❌ | ❌ | ❌ |

---

## 7. API Boundaries and Contracts

All API endpoints follow RESTful conventions under `/api/v1/`.

### 7.1 Uniform Response Envelope
Every API response adheres to the strict TypeScript contract:

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;       // e.g. "UNAUTHORIZED", "EXAM_EXPIRED", "VALIDATION_FAILED"
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}
```

### 7.2 Core API Endpoints Taxonomy
- `POST /api/v1/auth/session` - Token validation & current actor context
- `GET /api/v1/questions` - Query question bank with pagination and filters
- `POST /api/v1/questions` - Create question (Admin/Teacher)
- `GET /api/v1/exams` - List available/scheduled exams
- `POST /api/v1/exams/:id/start` - Initialize timed exam session
- `POST /api/v1/exams/:id/heartbeat` - Tab switch / activity monitor
- `POST /api/v1/exams/:id/submit` - Finalize exam submission
- `POST /api/v1/reading/start` - Start validated reading timer session
- `POST /api/v1/reading/heartbeat` - Send reading session heartbeat
- `POST /api/v1/reading/stop` - End session and commit verified minutes
- `GET /api/v1/students/me/dashboard` - Aggregated student overview
- `GET /api/v1/admin/overview` - Aggregated institutional KPIs

---

## 8. Folder Structure & Code Organization

The platform uses a scalable modular monorepo structure designed for immediate web execution and seamless sharing with future mobile clients:

```
├── ARCHITECTURE.md              # Authoritative technical specifications
├── prisma/
│   └── schema.prisma            # Single source of truth for database models
├── server.ts                    # Server entry point & API middleware
├── shared/
│   ├── contracts/               # API Request/Response DTOs (used by Web & Mobile)
│   ├── types/                   # Universal TypeScript models & enums
│   └── validation/              # Zod schemas shared across platforms
├── src/
│   ├── core/
│   │   ├── auth/                # JWT verification & RBAC permission evaluator
│   │   ├── config/              # Environment & module feature registry
│   │   └── errors/              # Uniform API error taxonomy
│   ├── modules/                 # Modular domain modules (15 core modules)
│   │   ├── questions/
│   │   ├── practice/
│   │   ├── exams/
│   │   ├── students/
│   │   ├── batches/
│   │   ├── performance/
│   │   ├── reading/
│   │   ├── attendance/
│   │   └── notifications/
│   ├── components/              # Web UI design system & view components
│   └── App.tsx                  # Web application entry & console
```

---

## 9. Testing Strategy

1. **Unit Tests (Target >85% Coverage on Business Rules):**
   - Scoring and negative marking calculators (`ExamScoringEngine`).
   - Anti-tamper reading hour verification algorithms.
   - RBAC permission matrix checks.
2. **Integration Tests:**
   - API route handlers tested against a containerized PostgreSQL test instance.
   - Exam submission concurrency simulations (validating 200 simultaneous submissions).
3. **End-to-End (E2E) Tests:**
   - Critical Path 1: Student takes scheduled exam -> timer expires -> automatic submission -> immediate score calculation.
   - Critical Path 2: Student starts reading timer -> heartbeat pings -> session finish -> streak increment.
4. **CI/CD Automation:**
   - GitHub Actions workflow executes linter, TypeScript check, unit test suite, and Prisma schema validation on every pull request.

---

## 10. Security Requirements & Integrity Enforcements

1. **Server-Authoritative Timing:**
   - Clients never dictate remaining exam time or verified reading duration. The server records `startedAt` and calculates duration upon submission.
2. **Anti-Tampering Heartbeats:**
   - The reading timer and exam sessions require a cryptographic or sequence-tagged heartbeat every 60 seconds. Sessions without heartbeats are flagged or auto-closed.
3. **Database Level Row-Level Security (RLS):**
   - PostgreSQL RLS policies ensure students cannot read draft questions, exam answer keys, or other students' private records even in the event of an application logic bug.
4. **Input Sanitization & Parameterization:**
   - All database queries use Prisma's parameterized queries to completely eliminate SQL injection.
   - All incoming JSON payloads pass through strict Zod schemas before reaching service logic.

---

## 11. Deployment & Infrastructure Architecture

- **Phase 1 Infrastructure (100% Free / Low-Cost Tier):**
  - **Database:** Supabase Free Tier (500MB PostgreSQL, connection pooling via PgBouncer, automated backups).
  - **Application Hosting:** Vercel / Cloud Run (Serverless Next.js API or Node container).
  - **Edge & DNS:** Cloudflare Free Plan (Global CDN, SSL termination, DDoS protection, rate-limiting rules).
  - **File Storage:** Supabase Storage (Question images, student profile pictures).
- **Scale-Up Path (10,000+ Students):**
  - Upgrade Supabase to Pro Tier ($25/mo) with compute add-on for dedicated CPU/RAM.
  - Enable Redis (Upstash / Supabase Redis) solely if exam heartbeat frequency demands high-throughput memory caching.

---

## 12. Future Mobile Application Integration

The future mobile app (React Native / Expo or Flutter) communicates directly with the exact same backend:
1. **Zero Duplicate Business Logic:** All validation rules, scoring logic, and workflows live on the server.
2. **Shared Contract Packages:** The mobile app imports `@shared/contracts` directly, guaranteeing compile-time type safety for every API request and response.
3. **Offline Sync Capability:**
   - For Practice Sets: Practice questions can be cached locally via SQLite, and student answers batched back to `/api/v1/practice/sync` upon network reconnection.
   - Reading Timer: Can run locally in background mode, storing signed interval blocks that sync once back online.
4. **Push Notifications:**
   - Expo Push Service or Firebase Cloud Messaging (FCM) hooks integrated into `NotificationService` alongside in-app alerts.

---

## 13. Phase 1 Implementation Roadmap

| Milestone | Deliverables | Status |
|---|---|---|
| **M1: Architecture & Foundation** | Technical Architecture Document, Complete Prisma Schema (15 modules), RBAC Engine, Modular DTO Contracts, API Envelope. |  **Completed in this phase** |
| **M2: Core Identity & Batches** | Supabase Auth Integration, Student/Staff profile creation, Batch assignments, Role guard middlewares. | Next Step |
| **M3: Assessment Foundation** | Question Bank CRUD, Topic taxonomy, Question filters, Single-student practice engine. | Next Step |
| **M4: Examination & Reading Timer** | Scheduled Exam engine, server-authoritative timer, Reading hour heartbeat tracker. | Next Step |
| **M5: Dashboards, Attendance, Reports** | Student Dashboard, Admin Panel, Attendance register, Exportable grade cards. | Next Step |
