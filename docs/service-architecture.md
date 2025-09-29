# Database & Service Architecture

This document covers the database schema, service layer architecture, and best practices for the Aarti mobile application using Drizzle ORM and SQLite.

## Table of Contents

- [Database Schema](#database-schema)
- [Service Layer Pattern](#service-layer-pattern)
- [Database Services](#database-services)
- [Service Implementation](#service-implementation)
- [React Hooks Best Practices](#react-hooks-best-practices)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Best Practices](#best-practices)

## Database Schema

The Aarti database schema supports a quiz-based learning application with the following core features:

- **User Management**: Single user with customizable settings
- **Topic Organization**: Hierarchical organization of quiz content  
- **Quiz System**: Questions, answers, and progress tracking
- **Bookmarking**: User bookmark management for questions
- **Progress Tracking**: Detailed completion and performance metrics

### Schema Statistics
- **Tables**: 5 core tables
- **Relationships**: 4 foreign key relationships
- **Indexes**: 3 performance indexes
- **Constraints**: Multiple unique and check constraints

### Table Definitions

#### 1. user_settings
```typescript
export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: false }).default(1),
  username: text('username').notNull().default('Example User'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
```

#### 2. topics
```typescript
export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
```

#### 3. quiz_questions
```typescript
export const quizQuestions = sqliteTable('quiz_questions', {
  id: integer('id').primaryKey({ autoIncrement: false }),
  topicId: integer('topic_id').notNull().references(() => topics.id),
  title: text('title').notNull(),
  question: text('question').notNull(),
  options: text('options').notNull(), // JSON string
  correctAnswer: text('correct_answer').notNull(),
  feedback: text('feedback').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  topicIdx: index('idx_quiz_questions_topic_id').on(table.topicId),
}));
```

#### 4. quiz_progress
```typescript
export const quizProgress = sqliteTable('quiz_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').notNull().references(() => quizQuestions.id),
  selectedAnswer: text('selected_answer'),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false).notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  questionIdUnique: uniqueIndex('idx_quiz_progress_question_id_unique').on(table.questionId),
}));
```

#### 5. bookmarks
```typescript
export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').notNull().references(() => quizQuestions.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  questionIdUnique: uniqueIndex('idx_bookmarks_question_id_unique').on(table.questionId),
}));
```

### Relationships

```
┌─────────────┐    1:N    ┌──────────────────┐    1:1    ┌─────────────────┐
│   topics    │──────────▶│  quiz_questions  │◀──────────│  quiz_progress  │
└─────────────┘           └──────────────────┘           └─────────────────┘
                                   │                              │
                                   │ 1:1                         │
                                   │                             │
                          ┌──────────────────┐                   │
                          │    bookmarks     │                   │
                          │                  │                   │
                          │ - question_id    │───────────────────┘
                          │   (FK, UNIQUE)   │
                          └──────────────────┘
```

## Service Layer Overview

The service layer provides a clean abstraction between the UI components and the database layer. This architecture ensures:

- **Separation of Concerns**: Business logic separated from UI logic
- **Reusability**: Services can be used across multiple components
- **Type Safety**: Full TypeScript support with Drizzle ORM
- **Error Handling**: Centralized error management
- **Testing**: Easier unit testing of business logic

## Service Layer Pattern

### Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │───▶│   Service Layer  │───▶│  Database Layer │
│                 │    │                  │    │   (Drizzle ORM) │
│ - QuizPage      │    │ - UserService    │    │                 │
│ - ProfileScreen │    │ - QuizService    │    │ - SQLite DB     │
│ - BookmarkList  │    │ - BookmarkService│    │ - Schema        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Service Responsibilities

1. **Data Access**: Encapsulate all database operations
2. **Business Logic**: Implement application-specific logic
3. **Data Transformation**: Convert between database and application formats
4. **Error Handling**: Manage and transform database errors
5. **Caching**: Implement data caching where appropriate

## Database Services

### 1. UserService

**Location**: `services/UserService.ts`

**Purpose**: Manages user settings and profile data.

```typescript
import { getDatabase } from '@/lib/database';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface UserSettings {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export const UserService = {
  async getUserSettings(): Promise<UserSettings> {
    const db = getDatabase();
    let user = await db.select().from(userSettings).where(eq(userSettings.id, 1)).get();

    if (!user) {
      // Fallback: create default user
      await db.insert(userSettings).values({ id: 1, username: 'Example User' });
      user = await db.select().from(userSettings).where(eq(userSettings.id, 1)).get();
    }
    return user!;
  },

  async updateUsername(username: string): Promise<void> {
    const db = getDatabase();
    await db.update(userSettings)
      .set({ 
        username, 
        updatedAt: new Date().toISOString() 
      })
      .where(eq(userSettings.id, 1));
  },
};
```

**Key Features**:
- **Singleton User**: Manages a single user record with ID 1
- **Fallback Creation**: Creates default user if none exists
- **Timestamp Updates**: Automatically updates `updatedAt` field
- **Type Safety**: Full TypeScript interface definitions

### 2. QuizService

**Location**: `services/QuizService.ts`

**Purpose**: Handles all quiz-related operations including questions, progress, and statistics.

```typescript
import { getDatabase } from '@/lib/database';
import { quizQuestions, quizProgress, topics } from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';

export interface QuizQuestion {
  id: number;
  topicId: number;
  title: string;
  question: string;
  options: string; // JSON string
  correct_answer: string;
  feedback: string;
  createdAt: string;
}

export interface Topic {
  id: number;
  name: string;
  createdAt: string;
}

export const QuizService = {
  async getQuizQuestions(): Promise<QuizQuestion[]> {
    const db = getDatabase();
    return db.select().from(quizQuestions).all();
  },

  async getTopics(): Promise<Topic[]> {
    const db = getDatabase();
    return db.select().from(topics).all();
  },

  async saveQuizAnswer(questionId: number, selectedAnswer: string): Promise<void> {
    const db = getDatabase();
    const question = await db.select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, questionId))
      .get();

    if (!question) {
      console.warn(`Question with ID ${questionId} not found.`);
      return;
    }

    await db.insert(quizProgress)
      .values({
        questionId,
        selectedAnswer,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: quizProgress.questionId,
        set: {
          selectedAnswer,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
  },

  async getSelectedAnswers(): Promise<Record<number, string>> {
    const db = getDatabase();
    const progress = await db.select().from(quizProgress).all();
    return progress.reduce((acc, item) => {
      if (item.selectedAnswer) {
        acc[item.questionId] = item.selectedAnswer;
      }
      return acc;
    }, {} as Record<number, string>);
  },

  async getCompletedQuestions(topicId?: number): Promise<number[]> {
    const db = getDatabase();
    let query = db.select({ id: quizProgress.questionId })
      .from(quizProgress)
      .where(eq(quizProgress.isCompleted, true));

    if (topicId) {
      query = query.innerJoin(quizQuestions, eq(quizProgress.questionId, quizQuestions.id))
                   .where(eq(quizQuestions.topicId, topicId));
    }
    
    const result = await query.all();
    return result.map(item => item.id);
  },

  async getCompletionStats(): Promise<{ total: number; completed: number; percentage: number }> {
    const db = getDatabase();
    const totalQuestionsResult = await db.select({ count: count() })
      .from(quizQuestions)
      .get();
    
    const completedQuestionsResult = await db.select({ count: count() })
      .from(quizProgress)
      .where(eq(quizProgress.isCompleted, true))
      .get();

    const total = totalQuestionsResult?.count || 0;
    const completed = completedQuestionsResult?.count || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  },
};
```

**Key Features**:
- **CRUD Operations**: Complete create, read, update, delete functionality
- **Progress Tracking**: Tracks user progress through quizzes
- **Statistics**: Provides completion statistics and analytics
- **Topic Filtering**: Supports filtering by topic
- **Conflict Resolution**: Handles duplicate answers with upsert operations

### 3. BookmarkService

**Location**: `services/BookmarkService.ts`

**Purpose**: Manages user bookmarks for quiz questions.

```typescript
import { getDatabase } from '@/lib/database';
import { bookmarks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const BookmarkService = {
  async getBookmarkedQuestionIds(): Promise<number[]> {
    const db = getDatabase();
    const result = await db.select({ id: bookmarks.questionId })
      .from(bookmarks)
      .all();
    return result.map(item => item.id);
  },

  async isBookmarked(questionId: number): Promise<boolean> {
    const db = getDatabase();
    const bookmark = await db.select()
      .from(bookmarks)
      .where(eq(bookmarks.questionId, questionId))
      .get();
    return !!bookmark;
  },

  async toggleBookmark(questionId: number): Promise<boolean> {
    const db = getDatabase();
    const isCurrentlyBookmarked = await this.isBookmarked(questionId);

    if (isCurrentlyBookmarked) {
      await db.delete(bookmarks)
        .where(eq(bookmarks.questionId, questionId));
      return false;
    } else {
      await db.insert(bookmarks)
        .values({ questionId });
      return true;
    }
  },
};
```

**Key Features**:
- **Toggle Functionality**: Easy bookmark/unbookmark operations
- **Status Checking**: Quick bookmark status verification
- **Bulk Operations**: Retrieve all bookmarked question IDs
- **Atomic Operations**: Ensures data consistency

## Service Implementation

### Database Connection Pattern

All services follow a consistent pattern for database access:

```typescript
// 1. Import dependencies
import { getDatabase } from '@/lib/database';
import { tableName } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

// 2. Define TypeScript interfaces
export interface ServiceData {
  id: number;
  // ... other fields
}

// 3. Implement service methods
export const ServiceName = {
  async methodName(): Promise<ServiceData[]> {
    const db = getDatabase();
    return await db.select().from(tableName).all();
  },
  
  // ... other methods
};
```

### Query Building

Services use Drizzle ORM's query builder for type-safe operations:

```typescript
// Simple queries
const users = await db.select().from(usersTable).all();

// Filtered queries
const user = await db.select()
  .from(usersTable)
  .where(eq(usersTable.id, userId))
  .get();

// Complex queries with joins
const userWithPosts = await db.select()
  .from(usersTable)
  .leftJoin(postsTable, eq(usersTable.id, postsTable.userId))
  .where(eq(usersTable.id, userId))
  .all();

// Aggregations
const stats = await db.select({ 
  count: count(),
  avg: sql<number>`avg(${table.rating})`
}).from(table).get();
```

### Data Transformation

Services handle conversion between database and application formats:

```typescript
// Database format (JSON string) -> Application format (Array)
const questions = await QuizService.getQuizQuestions();
const formattedQuestions = questions.map(q => ({
  ...q,
  options: JSON.parse(q.options), // Convert JSON string to array
}));

// Application format -> Database format
const saveData = {
  ...questionData,
  options: JSON.stringify(questionData.options), // Convert array to JSON string
};
```

## Error Handling

### Service-Level Error Handling

```typescript
export const ServiceName = {
  async riskyOperation(): Promise<Result> {
    try {
      const db = getDatabase();
      const result = await db.insert(table).values(data);
      return result;
    } catch (error) {
      console.error('Service operation failed:', error);
      
      // Transform database errors to user-friendly messages
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Duplicate entry found');
      }
      
      throw new Error('Operation failed. Please try again.');
    }
  },
};
```

### Component-Level Error Handling

```typescript
// In React components
const handleOperation = async () => {
  try {
    await ServiceName.riskyOperation();
    // Handle success
  } catch (error) {
    // Display user-friendly error message
    setError(error.message);
  }
};
```

### Error Types

Define custom error types for better error handling:

```typescript
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Testing

### Unit Testing Services

```typescript
// __tests__/services/UserService.test.ts
import { UserService } from '@/services/UserService';
import { getDatabase } from '@/lib/database';

// Mock the database
jest.mock('@/lib/database');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get user settings', async () => {
    const mockUser = { id: 1, username: 'Test User' };
    (getDatabase as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockUser)
          })
        })
      })
    });

    const result = await UserService.getUserSettings();
    expect(result).toEqual(mockUser);
  });
});
```

### Integration Testing

```typescript
// Test with real database
describe('QuizService Integration', () => {
  beforeEach(async () => {
    // Set up test database
    await initializeTestDatabase();
  });

  afterEach(async () => {
    // Clean up test data
    await cleanupTestDatabase();
  });

  it('should save and retrieve quiz answers', async () => {
    await QuizService.saveQuizAnswer(1, 'Option A');
    const answers = await QuizService.getSelectedAnswers();
    expect(answers[1]).toBe('Option A');
  });
});
```

## Best Practices

### 1. Service Design

- **Single Responsibility**: Each service handles one domain
- **Stateless**: Services don't maintain state between calls
- **Pure Functions**: Methods should be predictable and testable
- **Error Boundaries**: Handle errors at the service level

### 2. Performance

- **Batch Operations**: Use transactions for multiple related operations
- **Selective Queries**: Only fetch data you need
- **Indexing**: Ensure proper database indexes for performance
- **Caching**: Implement caching where appropriate

```typescript
// Batch operation example
export const QuizService = {
  async saveMultipleAnswers(answers: Record<number, string>): Promise<void> {
    const db = getDatabase();
    
    await db.transaction(async (tx) => {
      for (const [questionId, answer] of Object.entries(answers)) {
        await tx.insert(quizProgress).values({
          questionId: parseInt(questionId),
          selectedAnswer: answer,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        });
      }
    });
  },
};
```

### 3. Type Safety

- **Interface Definitions**: Define clear interfaces for all data types
- **Generic Types**: Use generics for reusable patterns
- **Runtime Validation**: Validate data at service boundaries

```typescript
// Generic service pattern
export class BaseService<T> {
  constructor(private table: Table) {}

  async findById(id: number): Promise<T | null> {
    const db = getDatabase();
    return await db.select().from(this.table)
      .where(eq(this.table.id, id))
      .get() as T | null;
  }
}
```

### 4. Documentation

- **JSDoc Comments**: Document all public methods
- **Type Annotations**: Use explicit type annotations
- **Examples**: Provide usage examples for complex methods

```typescript
/**
 * Saves a quiz answer and marks the question as completed
 * @param questionId - The ID of the question being answered
 * @param selectedAnswer - The answer selected by the user
 * @throws {Error} When question is not found
 * @example
 * await QuizService.saveQuizAnswer(123, 'Option A');
 */
async saveQuizAnswer(questionId: number, selectedAnswer: string): Promise<void> {
  // Implementation
}
```

## React Hooks Best Practices

### Rules of Hooks

1. **Only Call Hooks at the Top Level**: Never call hooks inside loops, conditions, or nested functions
2. **Only Call Hooks from React Functions**: Use hooks only in React components or custom hooks
3. **Consistent Hook Order**: Hooks must be called in the same order every render

### Common Violations and Solutions

#### ❌ Conditional Hook Calls
```typescript
function Component({ showData }) {
  if (!showData) return null; // Early return before hooks
  
  const [data, setData] = useState([]); // This may not be called
}
```

#### ✅ All Hooks at Top Level
```typescript
function Component({ showData }) {
  const [data, setData] = useState([]); // Always called
  
  if (!showData) return null; // Conditional rendering after hooks
}
```

### Database Hook Patterns

#### Custom Hook for Data Fetching
```typescript
function useQuizData() {
  const [data, setData] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const questions = await QuizService.getQuizQuestions();
        setData(questions);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { data, loading, error };
}
```

#### Performance Optimization
```typescript
function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('All');
  
  // Memoize expensive calculations
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => 
      selectedTopic === 'All' || q.topic === selectedTopic
    );
  }, [questions, selectedTopic]);
  
  // Memoize event handlers
  const handleAnswer = useCallback(async (questionId: number, answer: string) => {
    await QuizService.saveQuizAnswer(questionId, answer);
    // Update state...
  }, []);
  
  return <div>{/* Component JSX */}</div>;
}
```

## Service Extension

### Adding New Services

1. **Create Service File**: `services/NewService.ts`
2. **Define Interfaces**: TypeScript interfaces for data structures
3. **Implement Methods**: CRUD operations and business logic
4. **Add Error Handling**: Proper error management
5. **Write Tests**: Unit and integration tests
6. **Update Documentation**: Add to this documentation

### Service Composition

Services can be composed to create higher-level functionality:

```typescript
export const AnalyticsService = {
  async getUserProgress(userId: number): Promise<UserProgress> {
    const user = await UserService.getUserSettings();
    const quizStats = await QuizService.getCompletionStats();
    const bookmarks = await BookmarkService.getBookmarkedQuestionIds();
    
    return {
      user,
      quizStats,
      bookmarkCount: bookmarks.length,
    };
  },
};
```

---

*This documentation covers the database schema, service architecture, and React Hooks best practices for the Aarti mobile application using Drizzle ORM and SQLite*
