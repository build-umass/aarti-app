# Settings Data Synchronization

This document explains how data synchronization works between the Settings page and other pages (like Quizzes) when users reset their quiz progress or bookmarks.

## Problem Statement

### The Issue

When users reset quiz progress or delete bookmarks in the Settings page:
- **On Web:** Changes appeared only after manually reloading the page
- **On Android:** Changes didn't appear even after reopening the app

### Root Cause

The Settings page was modifying the SQLite database (deleting quiz progress or bookmarks), but other pages displaying this data were not being notified of the changes. They continued displaying stale state until the component remounted.

**Why Web Worked (Sometimes):**
- Manual page reload triggered component remount
- Component remount executed `useEffect` hooks
- Fresh data loaded from database

**Why Android Failed:**
- Switching tabs doesn't remount components in React Native
- Component state persisted with old data
- No mechanism to detect database changes

## Solution: Event-Based Synchronization

### Overview

We implemented a custom event emitter system that allows cross-component communication without tight coupling. When data changes in one component (Settings), it emits events that other components (Quizzes) listen for and react to.

### Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Settings Page  │────────▶│  Event Emitter   │────────▶│  Quizzes Page   │
│                 │  emit   │   (appEvents)    │ listen  │                 │
│  - Reset Quiz   │         │                  │         │  - Reload Data  │
│  - Reset        │         │  EVENT_TYPES:    │         │  - Update UI    │
│    Bookmarks    │         │  • DATA_RESET    │         │                 │
└─────────────────┘         │  • QUIZ_PROGRESS │         └─────────────────┘
                            │  • BOOKMARKS     │
                            └──────────────────┘
```

## Implementation Details

### 1. Event Emitter (`lib/eventEmitter.ts`)

A simple custom event emitter that works across all platforms (web, iOS, Android):

```typescript
class SimpleEventEmitter {
  private listeners: { [key: string]: Array<(...args: any[]) => void> } = {};

  // Register event listener
  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove event listener
  off(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Emit event to all listeners
  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

export const appEvents = new SimpleEventEmitter();

export const EVENT_TYPES = {
  QUIZ_PROGRESS_UPDATED: 'quiz_progress_updated',
  BOOKMARKS_UPDATED: 'bookmarks_updated',
  USERNAME_UPDATED: 'username_updated',
  DATA_RESET: 'data_reset',
} as const;
```

**Key Features:**
- Platform-agnostic (no dependencies on Node EventEmitter)
- Error handling prevents one listener from breaking others
- Logging for debugging
- TypeScript-safe event type constants

### 2. Settings Page (Emitter)

The Settings page emits events after successful data modifications:

```typescript
import { appEvents, EVENT_TYPES } from '@/lib/eventEmitter';

const handleResetQuizProgress = () => {
  showConfirmDialog(
    'Reset Quiz Progress',
    'Are you sure?',
    async () => {
      try {
        // Delete data from database
        await UserService.resetQuizProgress();

        // Emit events to notify other components
        appEvents.emit(EVENT_TYPES.QUIZ_PROGRESS_UPDATED);
        appEvents.emit(EVENT_TYPES.DATA_RESET);

        showAlert('Success', 'Quiz progress has been reset');
      } catch (error) {
        console.error('Failed to reset quiz progress:', error);
        showAlert('Error', 'Failed to reset quiz progress');
      }
    }
  );
};

const handleResetBookmarks = () => {
  showConfirmDialog(
    'Reset Bookmarks',
    'Are you sure?',
    async () => {
      try {
        // Delete data from database
        await UserService.resetBookmarks();

        // Emit events to notify other components
        appEvents.emit(EVENT_TYPES.BOOKMARKS_UPDATED);
        appEvents.emit(EVENT_TYPES.DATA_RESET);

        showAlert('Success', 'Bookmarks have been deleted');
      } catch (error) {
        console.error('Failed to reset bookmarks:', error);
        showAlert('Error', 'Failed to reset bookmarks');
      }
    }
  );
};
```

**Why Multiple Events?**
- `DATA_RESET`: Generic event for major data changes (full reload)
- `QUIZ_PROGRESS_UPDATED`: Specific event for quiz-related changes
- `BOOKMARKS_UPDATED`: Specific event for bookmark changes

This allows components to choose how granular they want to be with updates.

### 3. Quizzes Page (Listener)

The Quizzes page listens for events and reloads data accordingly:

```typescript
import { appEvents, EVENT_TYPES } from '@/lib/eventEmitter';

export default function QuizPage() {
  // ... state declarations ...

  // Reusable function to load all quiz data
  const loadQuizData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Load quiz questions
      const questions = await QuizService.getQuizQuestions();
      // ... format and set quiz data ...

      // Load topics
      const topicData = await QuizService.getTopics();
      setTopics(['All', 'Bookmarked', ...topicData.map(t => t.name)]);

      // Load selected answers
      const answers = await QuizService.getSelectedAnswers();
      setSelectedAnswers(answers);

      // Load completed questions
      const completed = await QuizService.getCompletedQuestions();
      setCompletedQuestions(new Set(completed));

      // Load bookmarks
      const bookmarkIds = await BookmarkService.getBookmarkedQuestionIds();
      const bookmarks = {};
      bookmarkIds.forEach(id => { bookmarks[id] = true; });
      setBookmarkedQuestions(bookmarks);

      // Update started state
      setHasStarted(completed.length > 0);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for data reset events from settings page
  useEffect(() => {
    const handleDataReset = () => {
      console.log('Data reset event received, reloading quiz data...');
      loadQuizData();
    };

    const handleQuizProgressUpdate = () => {
      console.log('Quiz progress update event received, reloading quiz data...');
      loadQuizData();
    };

    const handleBookmarksUpdate = () => {
      console.log('Bookmarks update event received, reloading bookmarks...');
      // Efficient: only reload bookmarks, not all data
      BookmarkService.getBookmarkedQuestionIds().then(bookmarkIds => {
        const bookmarks = {};
        bookmarkIds.forEach(id => { bookmarks[id] = true; });
        setBookmarkedQuestions(bookmarks);
      });
    };

    // Register event listeners
    appEvents.on(EVENT_TYPES.DATA_RESET, handleDataReset);
    appEvents.on(EVENT_TYPES.QUIZ_PROGRESS_UPDATED, handleQuizProgressUpdate);
    appEvents.on(EVENT_TYPES.BOOKMARKS_UPDATED, handleBookmarksUpdate);

    // CRITICAL: Cleanup listeners on unmount
    return () => {
      appEvents.off(EVENT_TYPES.DATA_RESET, handleDataReset);
      appEvents.off(EVENT_TYPES.QUIZ_PROGRESS_UPDATED, handleQuizProgressUpdate);
      appEvents.off(EVENT_TYPES.BOOKMARKS_UPDATED, handleBookmarksUpdate);
    };
  }, [loadQuizData]);

  // ... rest of component ...
}
```

**Key Implementation Details:**

1. **Extracted Data Loading Function:**
   - `loadQuizData` is a `useCallback` to prevent unnecessary re-creation
   - Can be called on initial mount and when events fire
   - Resets `hasStarted` to `false` if no completed questions

2. **Event Handlers:**
   - `handleDataReset`: Full data reload (comprehensive)
   - `handleQuizProgressUpdate`: Full data reload (comprehensive)
   - `handleBookmarksUpdate`: Efficient partial reload (only bookmarks)

3. **Proper Cleanup:**
   - `useEffect` return function removes all listeners
   - Prevents memory leaks
   - Prevents handlers from firing after unmount

## Data Flow Sequence

### Reset Quiz Progress Flow

```
1. User clicks "Reset Quiz Progress" in Settings
   └─> Settings: showConfirmDialog()

2. User confirms deletion
   └─> Settings: await UserService.resetQuizProgress()
       └─> Service: DELETE FROM quiz_progress

3. Database updated successfully
   └─> Settings: appEvents.emit(EVENT_TYPES.QUIZ_PROGRESS_UPDATED)
   └─> Settings: appEvents.emit(EVENT_TYPES.DATA_RESET)

4. Events propagate to all listeners
   └─> Quizzes: handleQuizProgressUpdate() called
       └─> Quizzes: loadQuizData()
           └─> Service: getQuizQuestions()
           └─> Service: getCompletedQuestions()
           └─> Service: getSelectedAnswers()
           └─> Service: getBookmarkedQuestionIds()

5. State updated with fresh data from database
   └─> Quizzes: UI re-renders with empty progress
```

### Reset Bookmarks Flow

```
1. User clicks "Delete All Bookmarks" in Settings
   └─> Settings: showConfirmDialog()

2. User confirms deletion
   └─> Settings: await UserService.resetBookmarks()
       └─> Service: DELETE FROM bookmarks

3. Database updated successfully
   └─> Settings: appEvents.emit(EVENT_TYPES.BOOKMARKS_UPDATED)
   └─> Settings: appEvents.emit(EVENT_TYPES.DATA_RESET)

4. Events propagate to all listeners
   └─> Quizzes: handleBookmarksUpdate() called
       └─> Quizzes: BookmarkService.getBookmarkedQuestionIds()

5. State updated with empty bookmarks
   └─> Quizzes: UI re-renders showing no bookmarks
```

## Benefits of This Approach

### 1. **Loose Coupling**
- Settings page doesn't need to know about Quizzes page
- Quizzes page doesn't need to know about Settings page
- Easy to add new listeners without modifying emitters

### 2. **Scalability**
- Adding new pages that need to react to data changes is simple
- Just add event listeners in the new component
- No modifications needed to existing components

### 3. **Platform Consistency**
- Works identically on web, iOS, and Android
- No platform-specific code needed
- Reliable behavior across all environments

### 4. **Testability**
- Event emitter can be easily mocked in tests
- Event handlers can be tested independently
- Clear separation of concerns

### 5. **Debuggability**
- Console logs show exactly when events fire
- Easy to trace data flow through the application
- Event names are constants (prevent typos)

## Best Practices

### When Adding New Events

1. **Define Event Type Constant:**
   ```typescript
   // In lib/eventEmitter.ts
   export const EVENT_TYPES = {
     // ... existing events ...
     NEW_EVENT_NAME: 'new_event_name',
   } as const;
   ```

2. **Emit After Successful Database Operation:**
   ```typescript
   try {
     await Service.performOperation();
     appEvents.emit(EVENT_TYPES.NEW_EVENT_NAME, dataPayload);
     showAlert('Success', 'Operation completed');
   } catch (error) {
     // Don't emit on error
     showAlert('Error', 'Operation failed');
   }
   ```

3. **Listen and Clean Up Properly:**
   ```typescript
   useEffect(() => {
     const handleNewEvent = (data) => {
       // Handle the event
     };

     appEvents.on(EVENT_TYPES.NEW_EVENT_NAME, handleNewEvent);

     // ALWAYS clean up
     return () => {
       appEvents.off(EVENT_TYPES.NEW_EVENT_NAME, handleNewEvent);
     };
   }, [dependencies]);
   ```

### Performance Considerations

**Full Reload vs Partial Reload:**

- **Full Reload:** Use for major data changes
  ```typescript
  const handleDataReset = () => {
    loadQuizData(); // Reloads everything
  };
  ```

- **Partial Reload:** Use for specific data changes
  ```typescript
  const handleBookmarksUpdate = () => {
    // Only reload bookmarks, not quiz questions/progress
    BookmarkService.getBookmarkedQuestionIds().then(bookmarkIds => {
      setBookmarkedQuestions(formatBookmarks(bookmarkIds));
    });
  };
  ```

**Choose based on:**
- How much data changed
- Cost of database queries
- UI update complexity

### Common Pitfalls to Avoid

1. **Forgetting Cleanup:**
   ```typescript
   // ❌ BAD: Memory leak
   useEffect(() => {
     appEvents.on(EVENT_TYPES.DATA_RESET, handler);
     // Missing cleanup!
   }, []);

   // ✅ GOOD: Proper cleanup
   useEffect(() => {
     appEvents.on(EVENT_TYPES.DATA_RESET, handler);
     return () => appEvents.off(EVENT_TYPES.DATA_RESET, handler);
   }, []);
   ```

2. **Emitting Before Database Update:**
   ```typescript
   // ❌ BAD: Event fires before data saved
   appEvents.emit(EVENT_TYPES.DATA_RESET);
   await Service.resetData(); // Listeners fetch old data!

   // ✅ GOOD: Event fires after data saved
   await Service.resetData();
   appEvents.emit(EVENT_TYPES.DATA_RESET); // Listeners fetch new data
   ```

3. **Missing Error Handling:**
   ```typescript
   // ❌ BAD: Event fires even on error
   try {
     await Service.resetData();
   } catch (error) {
     console.error(error);
   }
   appEvents.emit(EVENT_TYPES.DATA_RESET); // Fires even if operation failed!

   // ✅ GOOD: Event only fires on success
   try {
     await Service.resetData();
     appEvents.emit(EVENT_TYPES.DATA_RESET);
   } catch (error) {
     console.error(error);
     // Don't emit event
   }
   ```

4. **Handler Function Recreated Every Render:**
   ```typescript
   // ❌ BAD: New function every render, cleanup doesn't work
   useEffect(() => {
     appEvents.on(EVENT_TYPES.DATA_RESET, () => loadData());
     return () => appEvents.off(EVENT_TYPES.DATA_RESET, () => loadData());
   }, []);

   // ✅ GOOD: Stable function reference
   useEffect(() => {
     const handler = () => loadData();
     appEvents.on(EVENT_TYPES.DATA_RESET, handler);
     return () => appEvents.off(EVENT_TYPES.DATA_RESET, handler);
   }, []);
   ```

## Testing

### Manual Testing Checklist

**On Web:**
- [ ] Reset quiz progress in Settings → Quizzes page shows reset data
- [ ] Delete bookmarks in Settings → Quizzes page shows no bookmarks
- [ ] No page reload required

**On Android Emulator:**
- [ ] Reset quiz progress in Settings → Quizzes page shows reset data
- [ ] Delete bookmarks in Settings → Quizzes page shows no bookmarks
- [ ] Close and reopen app → Changes persist
- [ ] Switch between tabs → Changes visible immediately

**On iOS Simulator:**
- [ ] Reset quiz progress in Settings → Quizzes page shows reset data
- [ ] Delete bookmarks in Settings → Quizzes page shows no bookmarks
- [ ] Close and reopen app → Changes persist
- [ ] Switch between tabs → Changes visible immediately

### Debugging

**Enable Event Logging:**

The event emitter already logs all events. Check console for:
```
Event emitted: quiz_progress_updated []
Event listener added for: quiz_progress_updated
Event listener removed for: quiz_progress_updated
```

**Check Listener Registration:**

Add this to your component for debugging:
```typescript
useEffect(() => {
  console.log('Registering event listeners...');
  // ... register listeners ...

  return () => {
    console.log('Cleaning up event listeners...');
    // ... cleanup ...
  };
}, []);
```

## Future Enhancements

### Possible Improvements

1. **Typed Events:**
   ```typescript
   interface EventPayloads {
     [EVENT_TYPES.QUIZ_PROGRESS_UPDATED]: { questionId: number };
     [EVENT_TYPES.BOOKMARKS_UPDATED]: { bookmarkIds: number[] };
   }
   ```

2. **Event Replay:**
   - Store recent events
   - Replay on component mount
   - Useful for late-mounting components

3. **Event Debouncing:**
   - Prevent rapid-fire events
   - Batch multiple updates
   - Improve performance

4. **Global State Integration:**
   - Consider React Context or Zustand
   - May reduce need for events
   - Evaluate trade-offs

## Related Documentation

- [Database Services](./database-services.md) - Service layer architecture
- [Field Naming Conventions](./field-naming-conventions.md) - Database vs TypeScript naming
- [Service Architecture](./service-architecture.md) - Service patterns and best practices

## Summary

The event-based synchronization system ensures data consistency across all pages in the mobile app. When users reset data in Settings, the Quizzes page (and any future pages) automatically refresh to reflect the changes, providing a seamless user experience across all platforms.

**Key Takeaway:** Emit events after successful database operations, listen for events in components that display that data, and always clean up listeners to prevent memory leaks.
