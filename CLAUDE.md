# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aarti is a quiz-based learning application built as a monorepo with three main applications:
- **Mobile Client**: React Native Expo app with SQLite for offline-first functionality
- **Backend**: Node.js Express server with MongoDB for centralized data storage
- **Admin Client**: Next.js dashboard for managing quiz content and resources

## Common Commands

### Installing Dependencies

Install packages for all applications:
```bash
(cd apps/mobile_client && npm i) && (cd apps/admin_client && npm i) && (cd apps/backend && npm i)
```

### Running Applications

**Backend Server:**
```bash
cd apps/backend
npm run start
```

**Mobile App (Android Simulator):**
```bash
cd apps/mobile_client
npx expo prebuild
npx expo run:android
```

**Mobile App (iOS Simulator):**
```bash
cd apps/mobile_client
npx expo prebuild
npx expo run:ios
```

**Mobile App (Web):**
```bash
cd apps/mobile_client
npx expo start
# Then press 'w' for web
```

**Admin Client:**
```bash
cd apps/admin_client
npm run dev
```

### Testing and Linting

**Mobile Client Tests:**
```bash
cd apps/mobile_client
npm test
```

**Mobile Client Linting:**
```bash
cd apps/mobile_client
npm run lint
```

**Admin Client Linting:**
```bash
cd apps/admin_client
npm run lint
```

**TypeScript Type Checking:**
```bash
npx tsc --noEmit
```

### Troubleshooting Mobile App

**Diagnose potential issues:**
```bash
cd apps/mobile_client
npx expo-doctor
```

**Check package compatibility:**
```bash
cd apps/mobile_client
npx expo install --check
```

**After major changes or adding new packages:**
```bash
cd apps/mobile_client
npx expo prebuild
```

## Architecture Overview

### Monorepo Structure

```
aarti-app/
├── apps/
│   ├── mobile_client/     (React Native Expo + SQLite)
│   ├── backend/           (Express + MongoDB)
│   └── admin_client/      (Next.js + JWT auth)
├── types/                 (Shared TypeScript interfaces)
└── docs/                  (Architecture documentation)
```

### Mobile Client (React Native Expo)

**Key Technologies:** Expo Router, expo-sqlite, React Navigation

**Architecture Pattern:** Service Layer + SQLite Database

**Directory Structure:**
- `app/` - Expo Router file-based routing (like Next.js)
  - `_layout.tsx` - Root layout where database initialization happens
  - `(tabs)/` - Tab-based navigation screens
- `lib/database.ts` - SQLite database setup and initialization
- `services/` - Business logic layer (QuizService, BookmarkService, UserService)
- `components/` - Reusable UI components

**Database:**
- **Type:** SQLite (local, offline-first)
- **Location:** `lib/database.ts`
- **Initialization:** During splash screen in `app/_layout.tsx`
- **Tables:** user_settings, topics, quiz_questions, quiz_progress, bookmarks

**Service Layer:**
- Services use raw SQL with expo-sqlite's async API
- Located in `services/` directory
- Pattern: `QuizService.methodName()` - static methods

### Backend (Node.js Express)

**Key Technologies:** Express, MongoDB, Mongoose

**Architecture Pattern:** Routes → Controllers → Services → Models

**Directory Structure:**
- `index.ts` - Server entry point, starts on port 3002
- `app.ts` - Express app configuration
- `db.ts` - MongoDB connection
- `routes.ts` - API endpoint definitions
- `controllers.ts` - Request handlers
- `services.ts` - Business logic
- `models/` - Mongoose schemas

**Request Flow:**
```
HTTP Request → Route → Controller → Service → Model → MongoDB
```

**Available Endpoints:**
- `POST /quiz` - Create quiz item
- `PUT /quiz/:id` - Update quiz item
- `DELETE /quiz/:id` - Delete quiz item
- `GET /quiz` - Get all quiz items
- `GET /quiz/topic/:topic` - Get items by topic
- `GET /quiz/:id` - Get single item

### Admin Client (Next.js)

**Key Technologies:** Next.js 15, shadcn/ui, React Hook Form, JWT (jose)

**Architecture Pattern:** App Router + JWT Authentication

**Directory Structure:**
- `app/` - Next.js App Router (file-based routing)
  - `layout.tsx` - Root layout with Header
  - `signin/page.tsx` - Login page
  - `quizzes/page.tsx` - Quiz management (protected)
  - `resources/page.tsx` - Resources management (protected)
  - `api/` - API routes for login/logout
- `middleware.ts` - Route protection using JWT
- `lib/auth.ts` - JWT encoding/decoding with jose
- `components/` - UI components (shadcn/ui)

**Authentication:**
- JWT tokens stored in `auth_token` cookie
- Tokens expire in 1 hour
- Middleware protects all routes except `/signin`
- Algorithm: HS256

## Critical Naming Conventions

**IMPORTANT:** This codebase uses different naming conventions in different layers.

### Database Layer (SQLite)
- Uses `snake_case` for column names
- Examples: `correct_answer`, `topic_id`, `created_at`

### TypeScript/Application Layer
- Uses `camelCase` for properties
- Examples: `correctAnswer`, `topicId`, `createdAt`

### Service Layer Returns Database Format
Services return data with `snake_case` (as returned by SQLite):

```typescript
// QuizService.ts interface
export interface QuizQuestion {
  id: number;
  topic_id: number;          // ← snake_case from database
  correct_answer: string;    // ← snake_case from database
}
```

### Component Layer Transforms to camelCase
When using service data in components, transform to `camelCase`:

```typescript
// In React component
const formattedQuestions = questions.map(q => ({
  id: q.id,
  topicId: q.topic_id,              // ✅ Transform snake_case to camelCase
  correctAnswer: q.correct_answer    // ✅ Transform snake_case to camelCase
}));
```

**Common Mistake:**
```typescript
// ❌ WRONG - Will return undefined
const topicId = question.topicId;  // Database has topic_id, not topicId

// ✅ CORRECT
const topicId = question.topic_id;
```

### Field Mapping Reference

| Database (snake_case) | TypeScript (camelCase) |
|----------------------|------------------------|
| `topic_id` | `topicId` |
| `question_id` | `questionId` |
| `correct_answer` | `correctAnswer` |
| `selected_answer` | `selectedAnswer` |
| `is_completed` | `isCompleted` |
| `completed_at` | `completedAt` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

See `docs/field-naming-conventions.md` for complete details.

## React Hooks Rules

**CRITICAL:** Always follow the Rules of Hooks:

1. **Only call hooks at the top level** - Never inside loops, conditions, or nested functions
2. **Call hooks in the same order every render**
3. **All hooks must run before any early returns**

**Common Violation:**
```typescript
// ❌ WRONG - Early return before hooks
function Component({ showData }) {
  if (!showData) return null;
  const [data, setData] = useState([]); // May not be called every render
}
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - All hooks at top level
function Component({ showData }) {
  const [data, setData] = useState([]); // Always called
  if (!showData) return null;
}
```

## Database Architecture

### Mobile Client Database

**Location:** `apps/mobile_client/lib/database.ts`

**Schema:**
```sql
-- Single user with settings
user_settings (id, username, created_at, updated_at)

-- Quiz topics
topics (id, name, created_at)

-- Quiz questions with options stored as JSON
quiz_questions (id, topic_id, title, question, options, correct_answer, feedback, created_at)

-- User's quiz progress
quiz_progress (id, question_id, selected_answer, is_completed, completed_at, created_at, updated_at)

-- User's bookmarks
bookmarks (id, question_id, created_at)
```

**Relationships:**
- `quiz_questions.topic_id` → `topics.id` (many-to-one)
- `quiz_progress.question_id` → `quiz_questions.id` (one-to-one)
- `bookmarks.question_id` → `quiz_questions.id` (one-to-one)

**Initialization:**
- Database is initialized during the splash screen in `app/_layout.tsx`
- Uses expo-sqlite's async API (`getAllAsync`, `getFirstAsync`, `runAsync`)
- Seed data loaded from JSON files during first launch

### Backend Database

**Location:** `apps/backend/db.ts`

**Connection:** MongoDB via Mongoose

**Models:**
- `QuizItem` - Quiz questions and metadata

**Connection String:** Stored in `.env` file (see `.env.example`)

## Service Layer Pattern

### Mobile Client Services

Services are static classes with async methods that encapsulate database operations:

```typescript
// Example: QuizService
export class QuizService {
  static async getQuizQuestions(): Promise<QuizQuestion[]> {
    const db = getDatabase();
    return await db.getAllAsync<QuizQuestion>('SELECT * FROM quiz_questions');
  }

  static async saveQuizAnswer(questionId: number, answer: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO quiz_progress (question_id, selected_answer, is_completed) VALUES (?, ?, 1)',
      [questionId, answer]
    );
  }
}
```

**Available Services:**
- `QuizService` - Quiz questions, progress, statistics
- `BookmarkService` - Bookmark management
- `UserService` - User settings and profile

**Service Responsibilities:**
- Encapsulate all database operations
- Handle data transformation
- Manage error handling
- Provide type-safe interfaces

### Backend Services

Located in `apps/backend/services.ts`, containing business logic that sits between controllers and models.

**Pattern:**
```
Controller → Service → Model → Database
```

## Shared Types

**Location:** `types/index.ts`

Shared TypeScript interfaces used across all applications:

```typescript
export interface QuizItem {
  id: number;
  topic: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;  // Note: camelCase in shared types
  feedback: string;
}
```

**Usage:**
- Backend uses for model definitions
- Admin client uses for forms and API requests
- Mobile client transforms to these types for UI layer

## Environment Setup

1. Copy `.env.example` to `.env`
2. Add MongoDB connection string (contact team for credentials)
3. Backend requires `MONGODB_URI` environment variable

## Important Patterns

### 1. Expo Router File-Based Routing
- Files in `app/` directory automatically become routes
- `_layout.tsx` files define nested layouts
- `(folder)/` syntax creates route groups without affecting URL

### 2. Service Layer Abstraction
- All database operations go through services
- Components never access database directly
- Services return data in database format (snake_case)
- Components transform to application format (camelCase)

### 3. Backend Modular Architecture
- Separate concerns: routes, controllers, services, models
- Controllers handle HTTP request/response
- Services contain business logic
- Models define database schema

### 4. JWT Authentication (Admin)
- Tokens created on successful login
- Stored in HTTP-only cookies
- Middleware validates on each protected route request
- Uses jose library for encoding/decoding

## Data Flow

### Quiz Data Flow Example:

1. **Admin creates quiz in Next.js app**
   - Form submission → API call to backend

2. **Backend stores in MongoDB**
   - Controller receives request → Service processes → Model saves

3. **Mobile app fetches and stores locally**
   - Service fetches from backend → Transforms data → Stores in SQLite

4. **User takes quiz**
   - Component calls QuizService → Service updates quiz_progress table

### Naming Convention Data Flow:

```
JSON File (camelCase) → Database (snake_case) → Service (snake_case) → Component (camelCase)
```

## Documentation

Comprehensive documentation available in `docs/`:
- `database-services.md` - Database schema and service architecture
- `field-naming-conventions.md` - Critical naming convention details
- `service-architecture.md` - Service layer patterns and best practices
- `develop.md` - Contribution guide and architectural patterns
- `run-locally.md` - Setup and troubleshooting
- `troubleshooting.md` - Common issues and solutions
- `web-support_expo_sqlite.md` - Web compatibility notes

## Key Files to Know

### Mobile Client
- `app/_layout.tsx` - Root layout, database initialization
- `lib/database.ts` - Database setup and migrations
- `services/QuizService.ts` - Quiz operations
- `app/(tabs)/quizzes.tsx` - Main quiz screen

### Backend
- `index.ts` - Server entry point
- `routes.ts` - All API endpoints
- `services.ts` - Business logic

### Admin Client
- `app/layout.tsx` - Root layout with auth
- `middleware.ts` - Route protection
- `lib/auth.ts` - JWT utilities
