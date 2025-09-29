# Troubleshooting Guide

This guide covers common issues and solutions when working with SQLite, Drizzle ORM, and React Native in the Aarti mobile application.

## Table of Contents

- [Build and Configuration Issues](#build-and-configuration-issues)
- [Database Issues](#database-issues)
- [React Hooks Issues](#react-hooks-issues)
- [Performance Issues](#performance-issues)
- [Development Environment Issues](#development-environment-issues)
- [Migration Issues](#migration-issues)
- [Debugging Tools](#debugging-tools)

## Build and Configuration Issues

### 1. "Cannot find native module 'ExpoSQLite'"

**Error Message:**
```
Cannot find native module 'ExpoSQLite'
```

**Cause:** Trying to run the app in Expo Go instead of a development build.

**Solution:**
```bash
# Use development build instead of Expo Go
npx expo run:android
# or
npx expo run:ios
```

**Prevention:** Always use development builds when working with native modules like expo-sqlite.

### 2. Gradle Build Failures

**Error Message:**
```
BUILD FAILED in 16s
Cannot convert '' to File.
```

**Cause:** Invalid entry file configuration in package.json.

**Solution:**
```json
// package.json
{
  "main": "expo-router/entry"  // ✅ Correct entry point
}
```

**Alternative Causes and Solutions:**

#### Android SDK Not Found
```bash
# Create local.properties file
echo "sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk" > android/local.properties

# Set environment variable
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

#### Metro Configuration Issues
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('sql');
module.exports = config;
```

### 3. Babel Configuration Errors

**Error Message:**
```
Module not found: Can't resolve './drizzle/migrations'
```

**Cause:** Missing babel-plugin-inline-import configuration.

**Solution:**
```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [["inline-import", { "extensions": [".sql"] }]]
  };
};
```

**Installation:**
```bash
npm install babel-plugin-inline-import --save-dev
```

## Database Issues

### 1. "Database not initialized" Error

**Error Message:**
```
Database not initialized. Call initializeDatabase() first.
```

**Cause:** Accessing database before initialization or improper initialization order.

**Solution:**
```typescript
// ✅ Correct initialization order
function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);
  
  // Initialize database first
  useEffect(() => {
    if (!dbInitialized) {
      try {
        initializeDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    }
  }, [dbInitialized]);
  
  // Use database only after initialization
  const { success, error } = dbInitialized ? useDatabaseMigrations() : { success: false, error: null };
  
  // Rest of component
}
```

### 2. Migration Failures

**Error Message:**
```
Migration error: SQLITE_ERROR: no such table: __drizzle_migrations
```

**Cause:** Migration system not properly initialized.

**Solution:**
```typescript
// Ensure migrations directory exists
// drizzle/meta/_journal.json should contain migration entries
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "when": 1759156806776,
      "tag": "0000_short_khan",
      "breakpoints": true
    }
  ]
}
```

**Generate new migrations:**
```bash
npx drizzle-kit generate:sqlite
```

### 3. SQLite Version Compatibility

**Error Message:**
```
Cannot find module 'expo-sqlite/next'
```

**Cause:** Using incompatible expo-sqlite version with Drizzle ORM.

**Solution:**
```bash
# Uninstall current version
npm uninstall expo-sqlite

# Install compatible version
npm install expo-sqlite@14
```

**Verify installation:**
```bash
npm list expo-sqlite
# Should show: expo-sqlite@14.x.x
```

### 4. Schema Validation Errors

**Error Message:**
```
TypeError: Cannot read property 'id' of undefined
```

**Cause:** Missing data or incorrect schema relationships.

**Solution:**
```typescript
// Add proper null checks
const questions = await QuizService.getQuizQuestions();
const validQuestions = questions.filter(q => q && q.id && q.topicId);

// Use optional chaining
const topicName = question?.topic?.name || 'Unknown Topic';
```

## React Hooks Issues

### 1. "Rendered fewer hooks than expected"

**Error Message:**
```
Rendered fewer hooks than expected. This may be caused by an accidental early return statement.
```

**Cause:** Conditional hook calls or early returns before hooks.

**Solution:**
```typescript
// ❌ Incorrect - conditional hooks
function Component({ showData }) {
  if (!showData) return null; // Early return before hooks
  
  const [data, setData] = useState([]); // This hook may not be called
}

// ✅ Correct - all hooks at top level
function Component({ showData }) {
  const [data, setData] = useState([]); // Always called
  
  if (!showData) return null; // Conditional rendering after hooks
}
```

### 2. "Rules of Hooks" Violations

**Error Message:**
```
React has detected a change in the order of Hooks called by ComponentName
```

**Cause:** Hooks called in different order between renders.

**Solution:**
```typescript
// ❌ Incorrect - conditional hook order
function Component({ activeTab }) {
  const [quizData, setQuizData] = useState([]);
  
  if (activeTab === 'quiz') {
    const [quizStats, setQuizStats] = useState({}); // Conditional hook
  }
  
  const [userData, setUserData] = useState({});
}

// ✅ Correct - consistent hook order
function Component({ activeTab }) {
  const [quizData, setQuizData] = useState([]);
  const [quizStats, setQuizStats] = useState({}); // Always called
  const [userData, setUserData] = useState({});
  
  // Handle conditional logic inside effects
  useEffect(() => {
    if (activeTab === 'quiz') {
      // Load quiz stats
    }
  }, [activeTab]);
}
```

### 3. Infinite Re-render Loops

**Error Message:**
```
Maximum update depth exceeded
```

**Cause:** useEffect with incorrect dependencies causing infinite loops.

**Solution:**
```typescript
// ❌ Incorrect - infinite loop
function Component() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    setData([...data, newItem]); // This triggers the effect again
  }, [data]); // Dependency on data causes loop
  
  return <div>{data.length}</div>;
}

// ✅ Correct - proper dependencies
function Component() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      const newData = await fetchData();
      setData(newData);
    };
    loadData();
  }, []); // Empty array - run once on mount
  
  return <div>{data.length}</div>;
}
```

## Performance Issues

### 1. Slow Database Queries

**Symptoms:**
- UI freezes during data loading
- Slow response times
- High memory usage

**Solutions:**

#### Use Indexes
```sql
-- Ensure indexes exist for frequently queried columns
CREATE INDEX idx_quiz_questions_topic_id ON quiz_questions(topic_id);
CREATE UNIQUE INDEX idx_quiz_progress_question_id_unique ON quiz_progress(question_id);
```

#### Optimize Queries
```typescript
// ❌ Inefficient - loads all data
const allQuestions = await db.select().from(quizQuestions).all();

// ✅ Efficient - load only needed data
const questions = await db.select({
  id: quizQuestions.id,
  title: quizQuestions.title,
  topicId: quizQuestions.topicId
}).from(quizQuestions).all();
```

#### Use Memoization
```typescript
function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('All');
  
  // Memoize expensive calculations
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => 
      selectedTopic === 'All' || q.topic === selectedTopic
    );
  }, [questions, selectedTopic]);
  
  return <div>{filteredQuestions.map(q => <QuestionItem key={q.id} question={q} />)}</div>;
}
```

### 2. Memory Leaks

**Symptoms:**
- App becomes slower over time
- High memory usage
- Crashes on low-memory devices

**Solutions:**

#### Clean Up Subscriptions
```typescript
function Component() {
  useEffect(() => {
    const subscription = someObservable.subscribe(data => {
      // Handle data
    });
    
    // ✅ Clean up subscription
    return () => subscription.unsubscribe();
  }, []);
}
```

#### Avoid Memory Retention
```typescript
// ❌ Incorrect - retains large objects
const [data, setData] = useState(largeDataSet);

// ✅ Correct - load data when needed
const [data, setData] = useState([]);

useEffect(() => {
  const loadData = async () => {
    const result = await fetchData();
    setData(result);
  };
  loadData();
}, []);
```

## Development Environment Issues

### 1. Metro Bundler Cache Issues

**Symptoms:**
- Old code still running
- Changes not reflecting
- Random build failures

**Solutions:**
```bash
# Clear Metro cache
npx expo start --clear

# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo
npm start -- --reset-cache
```

### 2. Android SDK Issues

**Error Message:**
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable
```

**Solutions:**

#### Windows
```powershell
# Set environment variable
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"

# Create local.properties
echo "sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

#### macOS/Linux
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Create local.properties
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### 3. Node.js Version Issues

**Error Message:**
```
This version of Node.js is not supported
```

**Solution:**
```bash
# Check current version
node --version

# Use Node Version Manager (nvm) to switch versions
nvm install 18
nvm use 18

# Or use npx with specific Node version
npx --node-version=18 expo start
```

## Migration Issues

### 1. Schema Changes Not Applied

**Symptoms:**
- New columns not appearing
- Database structure unchanged
- Migration errors

**Solutions:**

#### Verify Migration Files
```bash
# Check if migrations were generated
ls -la drizzle/

# Should contain:
# - 0000_short_khan.sql
# - meta/_journal.json
```

#### Regenerate Migrations
```bash
# Delete old migrations
rm -rf drizzle/

# Regenerate
npx drizzle-kit generate:sqlite
```

#### Check Migration Application
```typescript
// Verify migrations are being applied
const { success, error } = useDatabaseMigrations();

if (error) {
  console.error('Migration failed:', error);
}

if (!success) {
  console.log('Migrations in progress...');
}
```

### 2. Data Migration Failures

**Error Message:**
```
SQLITE_ERROR: no such column: new_column_name
```

**Cause:** Trying to access new column before migration is applied.

**Solution:**
```typescript
// Add defensive programming
const getUserData = async () => {
  try {
    const user = await db.select().from(userSettings).get();
    
    // Check if new column exists
    if (user && 'newColumn' in user) {
      return user;
    } else {
      // Handle legacy data
      return { ...user, newColumn: 'default_value' };
    }
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};
```

## Debugging Tools

### 1. Drizzle Studio

**Installation:**
```bash
npm install drizzle-studio-expo --save-dev
```

**Usage:**
```bash
# Launch Drizzle Studio
npx drizzle-studio
```

**Benefits:**
- Visual database inspection
- Query execution
- Data browsing
- Schema visualization

### 2. React Native Debugger

**Installation:**
```bash
# Download from GitHub releases
# https://github.com/jhen0409/react-native-debugger/releases
```

**Features:**
- Redux DevTools integration
- Network inspection
- Component tree inspection
- Console debugging

### 3. Flipper Integration

**Setup:**
```bash
# Install Flipper
# https://fbflipper.com/

# Add React Native plugin
# Search for "React Native" in Flipper plugins
```

**Features:**
- Database inspection
- Network monitoring
- Layout inspection
- Performance profiling

### 4. Console Debugging

**Database Queries:**
```typescript
// Enable query logging
const db = drizzle(expoDb, { 
  schema, 
  logger: true // Enable query logging
});

// Manual query debugging
const result = await db.select().from(users).all();
console.log('Query result:', result);
```

**Component State:**
```typescript
function Component() {
  const [state, setState] = useState({});
  
  useEffect(() => {
    console.log('State changed:', state);
  }, [state]);
  
  return <div>...</div>;
}
```

### 5. Error Boundary

**Implementation:**
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to crash reporting service
    // crashlytics().recordError(error);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Common Error Patterns

### 1. Async/Await Issues

**Problem:**
```typescript
// ❌ Incorrect - not awaiting async operation
useEffect(() => {
  const data = QuizService.getQuizQuestions(); // Returns Promise
  setQuestions(data); // data is Promise, not array
}, []);
```

**Solution:**
```typescript
// ✅ Correct - properly awaiting
useEffect(() => {
  const loadData = async () => {
    const data = await QuizService.getQuizQuestions();
    setQuestions(data);
  };
  loadData();
}, []);
```

### 2. State Update Race Conditions

**Problem:**
```typescript
// ❌ Race condition
const handleAnswer = async (questionId, answer) => {
  await QuizService.saveQuizAnswer(questionId, answer);
  setAnswers(prev => ({ ...prev, [questionId]: answer }));
  // If component unmounts, setState will cause warning
};
```

**Solution:**
```typescript
// ✅ Using ref to check if component is mounted
const isMountedRef = useRef(true);

useEffect(() => {
  return () => {
    isMountedRef.current = false;
  };
}, []);

const handleAnswer = async (questionId, answer) => {
  await QuizService.saveQuizAnswer(questionId, answer);
  if (isMountedRef.current) {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }
};
```

### 3. Memory Leaks in Event Listeners

**Problem:**
```typescript
// ❌ Memory leak
useEffect(() => {
  const handleEvent = () => {
    // Handle event
  };
  
  document.addEventListener('customEvent', handleEvent);
  // Missing cleanup
}, []);
```

**Solution:**
```typescript
// ✅ Proper cleanup
useEffect(() => {
  const handleEvent = () => {
    // Handle event
  };
  
  document.addEventListener('customEvent', handleEvent);
  
  return () => {
    document.removeEventListener('customEvent', handleEvent);
  };
}, []);
```

## Getting Help

### 1. Check Logs

```bash
# Android logs
npx expo run:android --variant debug
adb logcat | grep -E "(ReactNative|Expo|SQLite)"

# iOS logs
npx expo run:ios --variant debug
# Check Xcode console or device logs
```

### 2. Community Resources

- **Drizzle ORM Documentation**: [https://orm.drizzle.team/](https://orm.drizzle.team/)
- **Expo SQLite Docs**: [https://docs.expo.dev/versions/latest/sdk/sqlite/](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **React Hooks Rules**: [https://react.dev/reference/rules/rules-of-hooks](https://react.dev/reference/rules/rules-of-hooks)
- **Expo Discord**: [https://discord.gg/expo](https://discord.gg/expo)

### 3. Debugging Checklist

- [ ] Check if using development build (not Expo Go)
- [ ] Verify all dependencies are installed
- [ ] Check Metro cache (try clearing it)
- [ ] Verify database initialization order
- [ ] Check React Hooks rules compliance
- [ ] Review error logs for specific error messages
- [ ] Test with minimal reproduction case
- [ ] Check environment variables and configuration

---

*This troubleshooting guide covers the most common issues encountered when working with SQLite, Drizzle ORM, and React Native in the Aarti mobile application*
