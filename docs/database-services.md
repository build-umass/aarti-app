# Database & Service Architecture

This document covers the database schema, service layer architecture, and best practices for the Aarti mobile application using SQLite with raw SQL queries via Expo SQLite's async API.

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
```sql
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  username TEXT NOT NULL DEFAULT 'Example User',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CHECK (id = 1)  -- Ensures single user
);
```

#### 2. topics
```sql
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. quiz_questions
```sql
CREATE TABLE quiz_questions (
  id INTEGER PRIMARY KEY,
  topic_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,  -- JSON array stored as text
  correct_answer TEXT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE INDEX idx_quiz_questions_topic_id ON quiz_questions(topic_id);
```

#### 4. quiz_progress
```sql
CREATE TABLE quiz_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL UNIQUE,
  selected_answer TEXT,
  is_completed INTEGER DEFAULT 0,  -- Boolean (0/1)
  completed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
);

CREATE INDEX idx_quiz_progress_question_id ON quiz_progress(question_id);
```

#### 5. bookmarks
```sql
CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
);

CREATE INDEX idx_bookmarks_question_id ON bookmarks(question_id);
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
- **Type Safety**: Full TypeScript support with typed interfaces
- **Error Handling**: Centralized error management
- **Testing**: Easier unit testing of business logic

## Service Layer Pattern

### Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │───▶│   Service Layer  │───▶│  Database Layer │
│                 │    │                  │    │   (Raw SQL)     │
│ - QuizPage      │    │ - UserService    │    │                 │
│ - ProfileScreen │    │ - QuizService    │    │ - SQLite DB     │
│ - BookmarkList  │    │ - BookmarkService│    │ - Expo SQLite   │
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
import { getDatabase } from '../lib/database';

export interface UserSettings {
  id: number;
  username: string;
  created_at: string | null;
  updated_at: string | null;
}

export class UserService {
  static async getUserSettings(): Promise<UserSettings> {
    const db = getDatabase();
    const user = await db.getFirstAsync<UserSettings>(
      'SELECT * FROM user_settings WHERE id = 1'
    );
    
    if (!user) {
      // Fallback: create default user
      await db.runAsync(
        'INSERT OR IGNORE INTO user_settings (id, username) VALUES (?, ?)',
        [1, 'Example User']
      );
      
      const newUser = await db.getFirstAsync<UserSettings>(
        'SELECT * FROM user_settings WHERE id = 1'
      );
      if (!newUser) throw new Error('Failed to create default user');
      return newUser;
    }
    
    return user;
  }

  static async updateUsername(username: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'UPDATE user_settings SET username = ?, updated_at = ? WHERE id = 1',
      [username, new Date().toISOString()]
    );
  }
}
```

**Key Features**:
- **Singleton User**: Manages a single user record with ID 1
- **Fallback Creation**: Creates default user if none exists
- **Timestamp Updates**: Automatically updates `updated_at` field
- **Type Safety**: Full TypeScript interface definitions
- **Async API**: Uses `getFirstAsync` and `runAsync` for web compatibility

### 2. QuizService

**Location**: `services/QuizService.ts`

**Purpose**: Handles all quiz-related operations including questions, progress, and statistics.

```typescript
import { getDatabase } from '../lib/database';

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

export class QuizService {
  static async getQuizQuestions(topicId?: number): Promise<QuizQuestion[]> {
    const db = getDatabase();
    
    if (topicId) {
      return await db.getAllAsync<QuizQuestion>(
        'SELECT * FROM quiz_questions WHERE topic_id = ? ORDER BY id',
        [topicId]
      );
    }
    
    return await db.getAllAsync<QuizQuestion>('SELECT * FROM quiz_questions ORDER BY id');
  }

  static async getTopics(): Promise<Topic[]> {
    const db = getDatabase();
    return await db.getAllAsync<Topic>('SELECT * FROM topics ORDER BY name');
  }

  static async saveQuizAnswer(questionId: number, selectedAnswer: string): Promise<void> {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    await db.runAsync(
      `INSERT INTO quiz_progress (question_id, selected_answer, is_completed, completed_at, updated_at)
       VALUES (?, ?, 1, ?, ?)
       ON CONFLICT(question_id) DO UPDATE SET
         selected_answer = excluded.selected_answer,
         is_completed = 1,
         completed_at = excluded.completed_at,
         updated_at = excluded.updated_at`,
      [questionId, selectedAnswer, now, now]
    );
  }

  static async getCompletionStats(): Promise<{ total: number; completed: number; percentage: number }> {
    const db = getDatabase();
    
    const totalResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM quiz_questions'
    );
    const completedResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM quiz_progress WHERE is_completed = 1'
    );
    
    const total = totalResult?.count || 0;
    const completed = completedResult?.count || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }
  
  static async getSelectedAnswers(): Promise<Record<number, string>> {
    const db = getDatabase();
    const results = await db.getAllAsync<{ question_id: number; selected_answer: string }>(
      'SELECT question_id, selected_answer FROM quiz_progress WHERE selected_answer IS NOT NULL'
    );
    
    const answers: Record<number, string> = {};
    results.forEach(row => {
      answers[row.question_id] = row.selected_answer;
    });
    return answers;
  }

  static async getCompletedQuestions(topicId?: number): Promise<number[]> {
    const db = getDatabase();
    
    if (topicId) {
      const results = await db.getAllAsync<{ question_id: number }>(
        `SELECT qp.question_id 
         FROM quiz_progress qp
         JOIN quiz_questions qq ON qp.question_id = qq.id
         WHERE qp.is_completed = 1 AND qq.topic_id = ?`,
        [topicId]
      );
      return results.map(r => r.question_id);
    }
    
    const results = await db.getAllAsync<{ question_id: number }>(
      'SELECT question_id FROM quiz_progress WHERE is_completed = 1'
    );
    return results.map(r => r.question_id);
  }
}
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
import { getDatabase } from '../lib/database';

export interface Bookmark {
  id: number;
  question_id: number;
  created_at: string | null;
}

export class BookmarkService {
  static async getBookmarkedQuestionIds(): Promise<number[]> {
    const db = getDatabase();
    const results = await db.getAllAsync<{ question_id: number }>(
      'SELECT question_id FROM bookmarks'
    );
    return results.map(r => r.question_id);
  }

  static async isBookmarked(questionId: number): Promise<boolean> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
      'SELECT id FROM bookmarks WHERE question_id = ?',
      [questionId]
    );
    return result !== null;
  }

  static async toggleBookmark(questionId: number): Promise<boolean> {
    const isCurrentlyBookmarked = await this.isBookmarked(questionId);
    
    if (isCurrentlyBookmarked) {
      const db = getDatabase();
      await db.runAsync(
        'DELETE FROM bookmarks WHERE question_id = ?',
        [questionId]
      );
      return false; // Now not bookmarked
    } else {
      const db = getDatabase();
      await db.runAsync(
        'INSERT OR IGNORE INTO bookmarks (question_id) VALUES (?)',
        [questionId]
      );
      return true; // Now bookmarked
    }
  }
}
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
import { getDatabase } from '../lib/database';

// 2. Define TypeScript interfaces
export interface ServiceData {
  id: number;
  name: string;
  // ... other fields
}

// 3. Implement service class with static methods
export class ServiceName {
  static async getAll(): Promise<ServiceData[]> {
    const db = getDatabase();
    return await db.getAllAsync<ServiceData>('SELECT * FROM table_name');
  }
  
  static async getById(id: number): Promise<ServiceData | null> {
    const db = getDatabase();
    return await db.getFirstAsync<ServiceData>(
      'SELECT * FROM table_name WHERE id = ?',
      [id]
    );
  }
  
  static async create(data: Omit<ServiceData, 'id'>): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO table_name (name) VALUES (?)',
      [data.name]
    );
  }
}
```

### Query Building

Services use raw SQL with parameterized queries for type-safe operations:

```typescript
// Simple SELECT queries
const users = await db.getAllAsync<User>('SELECT * FROM users');

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

*This documentation covers the database schema, service architecture, and React Hooks best practices for the Aarti mobile application using SQLite with raw SQL queries via Expo SQLite's async API*
