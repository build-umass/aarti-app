# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aarti is a quiz-based learning application built as a monorepo with three main applications:
- **Mobile Client**: React Native Expo app with SQLite for offline-first functionality (Expo SDK 57, React Native 0.86, TypeScript 6)
- **Backend**: Node.js Express server with MongoDB for centralized data storage (Express 5, Mongoose 9)
- **Admin Client**: Next.js dashboard for managing quiz content and resources (Next 16, React 19)

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
npm run build
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

**Dependency Gate (from repo root):**
```bash
node scripts/check-unused-deps.mjs
```

### Verification Gates

A change is done when its gates exit 0, not when it compiles. Run the gate set for every app you touch:

- **mobile_client:** `npx tsc --noEmit`, `npm run lint`, `npx jest --ci`, `npx expo-doctor`, `npx expo export --platform web`
- **admin_client:** `npx tsc --noEmit`, `npm run lint`, `npm run build`
- **backend:** `npm run build`, then `node -e "require('./dist/app.js')"` must load without MongoDB
- **repo root:** `node scripts/check-unused-deps.mjs`

`scripts/check-unused-deps.mjs` fails when a dependency has no import evidence and no entry in its `TOOLING` keep-list. Use a dependency in source or justify it there. Rerun the gate after deletions; removing code can expose dependencies as unused.

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

**Key Technologies:** Expo Router, expo-sqlite, react-native-reanimated

**Architecture Pattern:** Service Layer + SQLite Database

**Directory Structure:**
- `app/` - Expo Router file-based routing (like Next.js)
  - `_layout.tsx` - Root layout where database initialization happens
  - `(tabs)/` - Tab-based navigation screens
    - `resources/` - Nested expo-router stack (`_layout.tsx`, `index.tsx`, `[resource].tsx`)
- `lib/database.ts` - SQLite database setup and initialization (single source of table definitions)
- `lib/gemini.ts` - Gemini API client (`@google/genai`): embeddings and text generation
- `lib/vector-db.ts` - Embedding storage and cosine-similarity search
- `services/` - Business logic layer (QuizService, BookmarkService, UserService, RAGService, PDFService)
- `components/` - Reusable UI components
- `constants/` - Theme, colors, and app-wide constants
  - `Theme.ts` - Centralized brand colors and theme values
  - `Colors.ts` - Light/dark mode color definitions

**Database:**
- **Type:** SQLite (local, offline-first)
- **Location:** `lib/database.ts`
- **Initialization:** During splash screen in `app/_layout.tsx`
- **Tables:** user_settings, topics, quiz_questions, quiz_progress, bookmarks, knowledge_base, vector_embeddings

**RAG Chatbot:**
- `services/RAGService.ts` - Knowledge base lifecycle and query pipeline: loads documents, chunks them, stores embeddings, and answers queries (embed question, cosine search, pass top 3 chunks to `gemini-2.5-flash`, fall back to a plain response)
- `services/PDFService.ts` - Loads pre-extracted document text from `assets/Resources/documents.json` and chunks it (500 words, 50 overlap)
- `lib/gemini.ts` - `@google/genai` client. Embeddings use `text-embedding-004`; missing API key degrades the chat to a not-configured message, never a crash
- `lib/vector-db.ts` - `vector_embeddings` table CRUD and cosine similarity (embeddings stored as JSON strings)
- Initialization runs in `app/_layout.tsx` after the database seeds; the knowledge base persists across restarts and re-seeds only when empty

**Service Layer:**
- Services use raw SQL with expo-sqlite's async API
- Located in `services/` directory
- Pattern: `QuizService.methodName()` - static methods

**Theme and Colors:**
- **Location:** `constants/Theme.ts` and `constants/Colors.ts`
- **Centralized Design System:** All brand colors defined in `Theme.ts`
- **Key Brand Colors:**
  - Primary purple: `#5f2446` (used for headers, progress bars, primary actions)
  - Primary light: `#f0e6ed` (light purple backgrounds)
  - Pink: `#EE628C` (from logo, secondary accent)
  - Blue: `#2270CA` (resources/info)
  - Green: `#22c55e` (success/chat)
  - Orange: `#f59e0b` (warning/profile)

**IMPORTANT Color Usage:**
- **ALWAYS** use `BrandColors` from `constants/Theme.ts` instead of hardcoded hex values
- **NEVER** hardcode colors like `#5f2446` directly in components
- Progress bars use `BrandColors.primary` (purple) consistently throughout the app
- `Colors.light.tint` references `BrandColors.primary` for theme consistency

**Example:**
```typescript
import { BrandColors } from '@/constants/Theme';

// ✅ CORRECT - Use centralized colors
const styles = StyleSheet.create({
  progressBar: {
    backgroundColor: BrandColors.primary,  // Purple
  }
});

// ❌ WRONG - Don't hardcode colors
const styles = StyleSheet.create({
  progressBar: {
    backgroundColor: '#5f2446',  // Hardcoded
  }
});
```

**Internationalization (i18n):**

The mobile client uses **i18next** for internationalization support with English as the baseline language.

- **Location:** `i18n/config.ts` - i18n configuration and initialization
- **Translation Files:** `locales/en/` - Organized by namespace (navigation, home, quiz, profile, chat, onboarding, settings)
- **Context:** `contexts/LanguageContext.tsx` - Language state management
- **Hook:** `hooks/useAppTranslation.ts` - Custom translation hook
- **Storage:** AsyncStorage for language preference persistence

**Key Features:**
- Namespace-based organization for better maintainability
- Snake_case translation keys (e.g., `welcome_back`, `select_topic_label`)
- Interpolation support for dynamic values (e.g., `{{count}}`, `{{topic}}`)
- Language selector UI in Profile screen
- Future-ready for adding additional languages

**Translation Key Naming Convention:**
- Use `snake_case` for all translation keys
- Be descriptive and indicate purpose
- Group related strings under namespaces
- Keep phrases atomic (complete, not fragmented)

**Example Usage:**
```typescript
import { useAppTranslation } from '@/hooks/useAppTranslation';

function HomeScreen() {
  const { t } = useAppTranslation('home');

  return (
    <View>
      <Text>{t('welcome_back')}</Text>
      <Text>{t('stats.quizzes_completed')}</Text>
      <Text>{t('quiz.questions_completed', { completed: 5, total: 10 })}</Text>
    </View>
  );
}
```

**Available Namespaces:**
- `navigation` - Tab labels and headers
- `home` - Home screen content
- `quiz` - Quiz screen with question progress
- `profile` - Profile screen with statistics
- `chat` - Chat messages and placeholders
- `onboarding` - Welcome and feature descriptions
- `settings` - Settings screen labels and messages

**IMPORTANT Translation Rules:**
- **NEVER** hardcode user-facing strings in components
- **ALWAYS** use translation keys via `t()` function
- **ALWAYS** keep complete phrases together (not fragmented)
- Quiz content (questions, options, feedback) remains in English

See `docs/i18n-guide.md` for detailed implementation guide and how to add new languages.

### Backend (Node.js Express)

**Key Technologies:** Express 5, MongoDB, Mongoose 9, dotenv 17

**Architecture Pattern:** Routes → Controllers → Services → Models

**Directory Structure:**
- `index.ts` - Server entry point, starts on port 3002
- `app.ts` - Express app configuration
- `db.ts` - MongoDB connection (loads `.env` from the repository root via `dotenv.config({ path: "../../.env" })`)
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

**Key Technologies:** Next 16, shadcn/ui, React Hook Form, Tailwind 4, JWT (jose)

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
- Login compares the password against `ADMIN_PASSWORD_HASH` (bcrypt) from `.env.local`; `JWT_SECRET` signs the token

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

-- RAG chatbot documents
knowledge_base (id, content, metadata, content_type, created_at)

-- Embeddings for knowledge base documents (JSON array of numbers)
vector_embeddings (id, content_id, embedding, created_at)
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

Each app reads its variables from its own file. See `AGENTS.md` for the same table with usage notes.

| Variable | File | Used by |
|----------|------|---------|
| `MONGODB_URI` | repo-root `.env` | backend (loaded via `../../.env`) |
| `JWT_SECRET` | `apps/admin_client/.env.local` | admin JWT signing |
| `ADMIN_PASSWORD_HASH` | `apps/admin_client/.env.local` | admin login (bcrypt hash) |
| `EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY` | `apps/mobile_client/.env` | chatbot (optional) |

Generate the admin password hash from `apps/admin_client`:

```bash
node -e "console.log(require('bcrypt').hashSync('your-password', 10))"
```

The mobile app is offline-first and runs without the backend or MongoDB.

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
- `i18n-guide.md` - Internationalization implementation and extension guide
- `develop.md` - Contribution guide and architectural patterns
- `run-locally.md` - Setup and troubleshooting
- `troubleshooting.md` - Common issues and solutions
- `settings-data-sync.md` - Settings data synchronization
- `web-support_expo_sqlite.md` - Web compatibility notes

## Key Files to Know

### Mobile Client
- `app/_layout.tsx` - Root layout, database initialization, i18n initialization
- `lib/database.ts` - Database setup and migrations
- `lib/gemini.ts` - Gemini API client (embeddings and text)
- `lib/vector-db.ts` - Embedding storage and similarity search
- `services/RAGService.ts` - RAG knowledge base and query pipeline
- `services/PDFService.ts` - Document loading and chunking
- `services/QuizService.ts` - Quiz operations
- `app/(tabs)/quizzes.tsx` - Main quiz screen
- `app/(tabs)/resources/` - Resources list and detail (expo-router nested stack)
- `constants/Theme.ts` - Centralized brand colors and theme
- `constants/Colors.ts` - Light/dark mode colors
- `i18n/config.ts` - i18next configuration
- `contexts/LanguageContext.tsx` - Language state management
- `hooks/useAppTranslation.ts` - Custom translation hook
- `locales/en/` - English translation files (navigation, home, quiz, profile, chat, onboarding, settings)

### Backend
- `index.ts` - Server entry point
- `routes.ts` - All API endpoints
- `services.ts` - Business logic

### Admin Client
- `app/layout.tsx` - Root layout with auth
- `middleware.ts` - Route protection
- `lib/auth.ts` - JWT utilities
