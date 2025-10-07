# Field Naming Conventions

This document outlines the naming conventions used across the Aarti app to prevent field name mismatches between different layers.

## Overview

The app uses different naming conventions in different layers:
- **Database (SQLite)**: `snake_case` (e.g., `correct_answer`, `topic_id`)
- **TypeScript/JavaScript**: `camelCase` (e.g., `correctAnswer`, `topicId`)
- **JSON Files**: `camelCase` (e.g., `correctAnswer`, `topicId`)

## Field Mapping Reference

### Database ↔ TypeScript Mapping

| Database Field (snake_case) | TypeScript Field (camelCase) | Type |
|------------------------------|------------------------------|------|
| `id` | `id` | `number` |
| `topic_id` | `topicId` | `number` |
| `question_id` | `questionId` | `number` |
| `correct_answer` | `correctAnswer` | `string` |
| `selected_answer` | `selectedAnswer` | `string` |
| `is_completed` | `isCompleted` | `boolean` (0/1 in DB) |
| `completed_at` | `completedAt` | `string \| null` |
| `created_at` | `createdAt` | `string \| null` |
| `updated_at` | `updatedAt` | `string \| null` |

## Service Layer (Correct Usage)

Services return data using **snake_case** (as returned by the database):

```typescript
// QuizService.ts
export interface QuizQuestion {
  id: number;
  topic_id: number;          // ← snake_case from database
  title: string;
  question: string;
  options: string;
  correct_answer: string;    // ← snake_case from database
  feedback: string;
  created_at: string | null;
}
```

## Component Layer (Correct Usage)

Components transform database fields to **camelCase** when mapping:

```typescript
// quizzes.tsx
const formattedQuestions: QuizItem[] = questions.map(q => ({
  id: q.id,
  topic: '',
  title: q.title,
  question: q.question,
  options: JSON.parse(q.options),
  correctAnswer: q.correct_answer,  // ✅ Transform snake_case to camelCase
  feedback: q.feedback
}));
```

## Common Mistakes to Avoid

### ❌ Wrong: Accessing database fields with camelCase

```typescript
// This will return undefined!
const topicId = question.topicId;  // Wrong!
const answer = q.correctAnswer;    // Wrong!
```

### ✅ Correct: Accessing database fields with snake_case

```typescript
// This works correctly
const topicId = question.topic_id;   // Correct!
const answer = q.correct_answer;     // Correct!
```

### ❌ Wrong: Using snake_case in component state

```typescript
// This breaks TypeScript interfaces
const quiz: QuizItem = {
  id: 1,
  correct_answer: 'Paris',  // Wrong! Should be correctAnswer
  topic_id: 1               // Wrong! Should be topicId
};
```

### ✅ Correct: Using camelCase in component state

```typescript
// This matches the QuizItem interface
const quiz: QuizItem = {
  id: 1,
  correctAnswer: 'Paris',   // Correct!
  topicId: 1                // Correct! (if added to interface)
};
```

## Data Flow

```
JSON File          Database          Service Layer      Component Layer
(camelCase)    →   (snake_case)  →   (snake_case)   →   (camelCase)
─────────────────────────────────────────────────────────────────────
correctAnswer  →   correct_answer →  correct_answer →   correctAnswer
topicId        →   topic_id       →  topic_id       →   topicId
```

## TypeScript Interfaces

### Database Layer (snake_case)

```typescript
// services/QuizService.ts
export interface QuizQuestion {
  id: number;
  topic_id: number;
  correct_answer: string;
  // ... other fields
}
```

### Application Layer (camelCase)

```typescript
// types/index.ts
export interface QuizItem {
  id: number;
  topic: string;
  correctAnswer: string;
  // ... other fields
}
```

## Seeding Data

When seeding from JSON files, map camelCase to snake_case:

```typescript
// database.ts
await database.runAsync(
  'INSERT INTO quiz_questions (id, topic_id, correct_answer) VALUES (?, ?, ?)',
  [
    quiz.id,
    topicId,
    quiz.correctAnswer  // ← camelCase from JSON
  ]
  // Column name is correct_answer (snake_case)
);
```

## Querying Data

When querying, remember the database returns snake_case:

```typescript
// Service method
static async getQuizQuestions(): Promise<QuizQuestion[]> {
  const db = getDatabase();
  const results = await db.getAllAsync<QuizQuestion>(
    'SELECT * FROM quiz_questions'
  );
  // results[0].correct_answer ← snake_case
  // results[0].topic_id ← snake_case
  return results;
}
```

## Best Practices

1. **Always transform at the boundary**: Convert snake_case to camelCase when data enters the component layer
2. **Use TypeScript interfaces**: Define clear interfaces for each layer
3. **Document field mappings**: Keep this document updated when adding new fields
4. **Run type checking**: Use `npx tsc --noEmit` to catch type errors
5. **Test data flow**: Verify data displays correctly in the UI

## Checklist for Adding New Fields

When adding a new database field:

- [ ] Define the field in SQL with `snake_case` (e.g., `new_field`)
- [ ] Add to service interface with `snake_case` (e.g., `new_field: string`)
- [ ] Add to component interface with `camelCase` (e.g., `newField: string`)
- [ ] Map the field when transforming data (e.g., `newField: q.new_field`)
- [ ] Test the data flow end-to-end
- [ ] Run TypeScript compiler (`npx tsc --noEmit`)
- [ ] Update this documentation

## Testing

To verify field mappings are correct:

```bash
# Run TypeScript compiler
npx tsc --noEmit

# Run linter
npm run lint

# Test the app
npx expo start --web
```

## References

- [SQLite Naming Conventions](https://www.sqlite.org/pragma.html)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [JavaScript Naming Conventions](https://www.w3schools.com/js/js_conventions.asp)

---

*Last updated: October 2025*

