# Aarti App - Multilingual Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to implement internationalization (i18n) in the Aarti mobile app. The implementation will support per-user language preferences with UI-only translations (quiz content remains in English).

**Scope:** Mobile client only (admin panel unchanged)
**Estimated Effort:** 10-14 hours
**Status:** Planning Phase
**Target Languages:** Flexible (framework supports unlimited languages)

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Technical Architecture](#2-technical-architecture)
3. [Implementation Phases](#3-implementation-phases)
4. [File Structure](#4-file-structure)
5. [Database Changes](#5-database-changes)
6. [Translation Inventory](#6-translation-inventory)
7. [Code Examples](#7-code-examples)
8. [Testing Strategy](#8-testing-strategy)
9. [Rollout Plan](#9-rollout-plan)

---

## 1. Current State Analysis

### 1.1 Findings

- **No existing i18n implementation** - Clean slate for implementation
- **49 unique UI strings** identified across 6 screens
- **User settings table** ready for language preference field
- **Service pattern** established for user preferences
- **React Hooks compliance** - All components use hooks correctly

### 1.2 Text Distribution by Screen

| Screen | UI Strings | Priority |
|--------|-----------|----------|
| Onboarding | 15 | High (first impression) |
| Home | 16 | High (main screen) |
| Tab Navigation | 10 | High (always visible) |
| Quiz | 7 | Medium |
| Profile | 5 | Medium |
| Chat | 3 | Low |
| Resources | 0 | N/A (content-only) |
| **TOTAL** | **49** | |

### 1.3 Current Challenges

- All text is hardcoded inline (no constants file)
- No translation infrastructure exists
- Language preference not stored in database
- No language selection UI

---

## 2. Technical Architecture

### 2.1 Technology Stack

**Recommended Libraries:**

```json
{
  "i18next": "^23.7.0",
  "react-i18next": "^14.0.0",
  "expo-localization": "^15.0.0"
}
```

**Why These Libraries?**

- **i18next**: Industry standard, mature, excellent TypeScript support
- **react-i18next**: Perfect React Hooks integration (`useTranslation`)
- **expo-localization**: Lightweight device locale detection for Expo apps

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│ App Startup (_layout.tsx)                       │
│ 1. Initialize i18next                           │
│ 2. Load user language preference from SQLite    │
│ 3. Fallback to device locale (expo-localization)│
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ LanguageContext (React Context)                 │
│ - Provides current language                     │
│ - Provides changeLanguage() function            │
│ - Triggers re-render on language change         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Components (Home, Quiz, Profile, etc.)          │
│ - Use useTranslation() hook                     │
│ - Call t('key') to get translated strings       │
│ - Auto re-render when language changes          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Translation Files (JSON)                        │
│ locales/en/home.json                            │
│ locales/es/home.json                            │
│ locales/fr/home.json                            │
└─────────────────────────────────────────────────┘
```

### 2.3 Data Flow

```
User selects language in Profile
        ↓
UserService.updateLanguagePreference(lang)
        ↓
Save to SQLite database
        ↓
i18next.changeLanguage(lang)
        ↓
All components re-render with new language
```

---

## 3. Implementation Phases

### Phase 1: Setup & Infrastructure (1-2 hours)

**Tasks:**
1. Install dependencies
   ```bash
   cd apps/mobile_client
   npm install i18next react-i18next expo-localization
   ```

2. Create directory structure:
   ```
   apps/mobile_client/
   ├── locales/
   │   └── en/
   │       ├── navigation.json
   │       ├── home.json
   │       ├── quiz.json
   │       ├── profile.json
   │       ├── chat.json
   │       └── onboarding.json
   └── i18n/
       └── config.ts
   ```

3. Create i18n configuration file
4. Set up namespaces for each feature

**Deliverables:**
- ✅ Dependencies installed
- ✅ Translation file structure created
- ✅ i18n config file with English baseline

---

### Phase 2: Database Migration (30 minutes)

**Tasks:**
1. Add `language_preference` column to `user_settings` table
2. Update `UserSettings` TypeScript interface
3. Create migration in `lib/database.ts`
4. Add methods to `UserService`:
   - `getLanguagePreference(): Promise<string>`
   - `updateLanguagePreference(language: string): Promise<void>`

**Database Changes:**
```sql
ALTER TABLE user_settings
ADD COLUMN language_preference TEXT DEFAULT 'en';
```

**Deliverables:**
- ✅ Database migration complete
- ✅ UserService methods implemented
- ✅ TypeScript interfaces updated

---

### Phase 3: App Integration (2-3 hours)

**Tasks:**
1. Create `contexts/LanguageContext.tsx`
2. Create `hooks/useAppTranslation.ts` wrapper
3. Update `app/_layout.tsx`:
   - Initialize i18next on app startup
   - Load saved language preference
   - Fallback to device locale
   - Wrap app with LanguageProvider
4. Test language initialization flow

**Deliverables:**
- ✅ Language context provider working
- ✅ App loads correct language on startup
- ✅ Device locale detection works

---

### Phase 4: Component Conversion (2-3 hours)

**Tasks:**

Convert all screens to use translation keys:

1. **Tab Navigation** (`app/(tabs)/_layout.tsx`)
   - 10 strings: tab labels and headers

2. **Onboarding** (`app/onboarding.tsx`)
   - 15 strings: welcome text, feature cards, alerts

3. **Home Screen** (`app/(tabs)/index.tsx`)
   - 16 strings: greeting, stats, feature cards

4. **Quiz Screen** (`app/(tabs)/quizzes.tsx`)
   - 7 strings: loading, topic selection, progress

5. **Profile Screen** (`app/(tabs)/profile.tsx`)
   - 5 strings: button labels, stats

6. **Chat Components**
   - 3 strings: chat messages, placeholders

**Pattern:**
```typescript
// Before
<Text>Welcome back,</Text>

// After
const { t } = useAppTranslation('home');
<Text>{t('greeting')}</Text>
```

**Deliverables:**
- ✅ All 49 strings converted to translation keys
- ✅ All components use `useAppTranslation()` hook
- ✅ Dynamic content uses interpolation

---

### Phase 5: Language Selector UI (1 hour)

**Tasks:**
1. Add language selector to Profile screen
2. Display available languages (EN, ES, FR, etc.)
3. Highlight current language
4. Save preference on selection
5. Trigger app-wide language change

**UI Design:**
```
┌────────────────────────────┐
│ Profile                     │
├────────────────────────────┤
│ [Username]                  │
│                             │
│ Language Preference         │
│ ┌────────┬────────┬────────┐│
│ │  EN ✓  │   ES   │   FR   ││
│ └────────┴────────┴────────┘│
│                             │
│ [Other settings...]         │
└────────────────────────────┘
```

**Deliverables:**
- ✅ Language selector component created
- ✅ Selection saves to database
- ✅ App switches language immediately

---

### Phase 6: Create Translation Files (1-2 hours per language)

**Tasks:**
1. Extract all 49 English strings into JSON files
2. Organize by namespace (navigation, home, quiz, etc.)
3. For each additional language:
   - Copy English JSON structure
   - Translate all strings
   - Verify special characters and plurals

**Translation File Example:**
```json
// locales/en/home.json
{
  "greeting": "Welcome back,",
  "stats": {
    "completed": "Quizzes Completed",
    "total": "Total Quizzes",
    "bookmarks": "Bookmarks"
  },
  "progress": {
    "title": "Your Progress",
    "overall": "Overall Completion"
  },
  "features": {
    "resources": {
      "title": "Resources",
      "description": "Access helpful information and support materials"
    }
  }
}
```

**Deliverables:**
- ✅ English baseline files complete
- ✅ Additional language files created
- ✅ Translation keys validated

---

### Phase 7: Testing (2-3 hours)

**Test Cases:**

1. **Language Persistence**
   - ✅ Selected language saves to database
   - ✅ Language persists across app restarts
   - ✅ Language loads correctly on fresh install

2. **Language Switching**
   - ✅ All screens update immediately
   - ✅ Navigation labels update
   - ✅ Dynamic content updates correctly

3. **Fallback Behavior**
   - ✅ Missing translation keys show English fallback
   - ✅ Device locale detection works
   - ✅ Unsupported locales default to English

4. **Edge Cases**
   - ✅ Long text doesn't break UI
   - ✅ Special characters render correctly
   - ✅ Right-to-left languages (if supported)

5. **Performance**
   - ✅ No lag when switching languages
   - ✅ App startup time unchanged

**Deliverables:**
- ✅ All test cases pass
- ✅ No regressions in existing features
- ✅ Performance benchmarks meet targets

---

### Phase 8: Documentation (1 hour)

**Tasks:**
1. Update `CLAUDE.md` with i18n section
2. Create translation guide for contributors
3. Document how to add new languages
4. Document translation key naming conventions

**Deliverables:**
- ✅ Updated project documentation
- ✅ Translation contribution guide
- ✅ Developer guide for adding new screens

---

## 4. File Structure

### 4.1 New Files to Create

```
apps/mobile_client/
├── locales/                          # Translation files
│   ├── en/                           # English (baseline)
│   │   ├── navigation.json           # 10 strings
│   │   ├── home.json                 # 16 strings
│   │   ├── quiz.json                 # 7 strings
│   │   ├── profile.json              # 5 strings
│   │   ├── chat.json                 # 3 strings
│   │   └── onboarding.json           # 15 strings
│   ├── es/                           # Spanish (copy structure)
│   │   └── [same structure]
│   ├── fr/                           # French (copy structure)
│   │   └── [same structure]
│   └── hi/                           # Hindi (copy structure)
│       └── [same structure]
│
├── i18n/
│   └── config.ts                     # i18next configuration
│
├── contexts/
│   └── LanguageContext.tsx           # Language state management
│
└── hooks/
    └── useAppTranslation.ts          # Custom translation hook
```

### 4.2 Files to Modify

```
apps/mobile_client/
├── lib/
│   └── database.ts                   # Add language column migration
├── services/
│   └── UserService.ts                # Add language methods
├── app/
│   ├── _layout.tsx                   # Initialize i18n
│   ├── onboarding.tsx                # Convert to use t()
│   └── (tabs)/
│       ├── _layout.tsx               # Convert to use t()
│       ├── index.tsx                 # Convert to use t()
│       ├── quizzes.tsx               # Convert to use t()
│       ├── profile.tsx               # Convert to use t() + add selector
│       └── chatbot.tsx               # Convert to use t()
└── package.json                      # Add dependencies
```

---

## 5. Database Changes

### 5.1 Migration

**Add to `lib/database.ts` in `runMigrations()` function:**

```typescript
// Check if language_preference column exists
if (!columnNames.includes('language_preference')) {
  console.log('Adding language_preference column to user_settings table');
  await db.execAsync(
    'ALTER TABLE user_settings ADD COLUMN language_preference TEXT DEFAULT \'en\''
  );
}
```

### 5.2 Updated Schema

```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  username TEXT NOT NULL DEFAULT 'Example User',
  onboarding_completed INTEGER DEFAULT 0,
  first_launch_date TEXT,
  language_preference TEXT DEFAULT 'en',        -- NEW
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CHECK (id = 1)
);
```

### 5.3 Updated TypeScript Interface

```typescript
export interface UserSettings {
  id: number;
  username: string;
  onboarding_completed: number;
  first_launch_date: string | null;
  language_preference: string;                    // NEW
  created_at: string | null;
  updated_at: string | null;
}
```

### 5.4 New UserService Methods

```typescript
export class UserService {
  // ... existing methods ...

  /**
   * Get user's language preference
   */
  static async getLanguagePreference(): Promise<string> {
    const user = await this.getUserSettings();
    return user.language_preference || 'en';
  }

  /**
   * Update user's language preference
   */
  static async updateLanguagePreference(language: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'UPDATE user_settings SET language_preference = ?, updated_at = ? WHERE id = 1',
      [language, new Date().toISOString()]
    );
  }
}
```

---

## 6. Translation Inventory

### 6.1 Navigation (10 strings)

**File:** `locales/[lang]/navigation.json`

```json
{
  "tabs": {
    "home": "Home",
    "resources": "Resources",
    "quizzes": "Quizzes",
    "chat": "Chat",
    "profile": "Profile"
  },
  "headers": {
    "home": "Home",
    "resources": "Resources",
    "quizzes": "Quizzes",
    "chat": "Chat",
    "profile": "Profile"
  }
}
```

---

### 6.2 Onboarding (15 strings)

**File:** `locales/[lang]/onboarding.json`

```json
{
  "welcome": {
    "title": "Welcome to Aarti",
    "subtitle": "Your support and resource companion"
  },
  "features": {
    "title": "Explore the App",
    "resources": {
      "title": "Resources",
      "description": "Access helpful information and support materials"
    },
    "quizzes": {
      "title": "Quizzes",
      "description": "Test your knowledge and track your learning progress"
    },
    "chat": {
      "title": "Chat",
      "description": "Get instant answers to your questions"
    },
    "profile": {
      "title": "Profile",
      "description": "Track your progress and customize your experience"
    }
  },
  "form": {
    "label": "What should we call you?",
    "placeholder": "Enter your name"
  },
  "button": "Get Started",
  "alerts": {
    "nameRequired": "Name Required",
    "nameRequiredMessage": "Please enter your name to continue.",
    "error": "Error",
    "errorMessage": "Something went wrong. Please try again."
  }
}
```

---

### 6.3 Home (16 strings)

**File:** `locales/[lang]/home.json`

```json
{
  "greeting": "Welcome back,",
  "stats": {
    "completed": "Quizzes Completed",
    "total": "Total Quizzes",
    "bookmarks": "Bookmarks"
  },
  "progress": {
    "title": "Your Progress",
    "overall": "Overall Completion"
  },
  "explore": "Explore",
  "features": {
    "resources": {
      "title": "Resources",
      "description": "Access support materials and helpful information"
    },
    "quizzes": {
      "title": "Quizzes",
      "description": "Test your knowledge with interactive quizzes"
    },
    "chat": {
      "title": "Chat",
      "description": "Get instant answers from Aarti"
    },
    "profile": {
      "title": "Profile",
      "description": "View your progress and settings"
    }
  }
}
```

---

### 6.4 Quiz (7 strings)

**File:** `locales/[lang]/quiz.json`

```json
{
  "loading": "Loading quiz data...",
  "topicLabel": "Select Topic:",
  "completed": "Questions completed: {{count}}",
  "review": "You can now review and change your answers",
  "noQuestions": "No quiz questions available",
  "error": "Failed to load quiz data",
  "retry": "Retry"
}
```

**Note:** Topic names, questions, options, and feedback remain in English (quiz content not translated per requirements).

---

### 6.5 Profile (5 strings)

**File:** `locales/[lang]/profile.json`

```json
{
  "tabs": {
    "quizzes": "Quizzes",
    "resources": "Resources"
  },
  "stats": {
    "completed": "Quizzes Completed: {{count}}",
    "byTopic": "by {{topic}}: {{count}}"
  },
  "language": {
    "title": "Language Preference",
    "select": "Select Language"
  }
}
```

---

### 6.6 Chat (3 strings)

**File:** `locales/[lang]/chat.json`

```json
{
  "initialMessage": "Hey my name is Aarti! Here to help...",
  "resourcesMessage": "Here are some resources you can refer to...",
  "placeholder": "Type a message..."
}
```

---

## 7. Code Examples

### 7.1 i18n Configuration

**File:** `i18n/config.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import English translation files
import navigationEN from '../locales/en/navigation.json';
import homeEN from '../locales/en/home.json';
import quizEN from '../locales/en/quiz.json';
import profileEN from '../locales/en/profile.json';
import chatEN from '../locales/en/chat.json';
import onboardingEN from '../locales/en/onboarding.json';

// Import Spanish translation files (example)
import navigationES from '../locales/es/navigation.json';
import homeES from '../locales/es/home.json';
// ... import other Spanish files

const resources = {
  en: {
    navigation: navigationEN,
    home: homeEN,
    quiz: quizEN,
    profile: profileEN,
    chat: chatEN,
    onboarding: onboardingEN,
  },
  es: {
    navigation: navigationES,
    home: homeES,
    // ... other Spanish namespaces
  },
  // ... other languages
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0], // Default to device locale
    fallbackLng: 'en',
    ns: ['navigation', 'home', 'quiz', 'profile', 'chat', 'onboarding'],
    defaultNS: 'home',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

---

### 7.2 Language Context

**File:** `contexts/LanguageContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '@/i18n/config';
import { UserService } from '@/services/UserService';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  availableLanguages: { code: string; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'hi', name: 'हिन्दी' },
  ];

  useEffect(() => {
    // Load saved language preference on mount
    const loadLanguage = async () => {
      try {
        const savedLang = await UserService.getLanguagePreference();
        setCurrentLanguage(savedLang);
        await i18n.changeLanguage(savedLang);
      } catch (error) {
        console.error('Failed to load language preference:', error);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      await UserService.updateLanguagePreference(lang);
      setCurrentLanguage(lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, changeLanguage, availableLanguages }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
```

---

### 7.3 Custom Translation Hook

**File:** `hooks/useAppTranslation.ts`

```typescript
import { useTranslation } from 'react-i18next';

/**
 * Wrapper around useTranslation for better TypeScript support
 * and namespace management
 */
export const useAppTranslation = (namespace?: string) => {
  const { t, i18n } = useTranslation(namespace);

  return {
    t,
    i18n,
    currentLanguage: i18n.language,
  };
};
```

---

### 7.4 Component Conversion Example

**Before:**

```typescript
// app/(tabs)/index.tsx (Home Screen)
export default function HomeScreen() {
  return (
    <View>
      <Text style={styles.welcomeText}>Welcome back,</Text>
      <Text style={styles.usernameText}>{username}</Text>
      <Text>Quizzes Completed</Text>
      <Text>{stats.completedQuizzes}/{stats.totalQuizzes}</Text>
    </View>
  );
}
```

**After:**

```typescript
// app/(tabs)/index.tsx (Home Screen)
import { useAppTranslation } from '@/hooks/useAppTranslation';

export default function HomeScreen() {
  const { t } = useAppTranslation('home');

  return (
    <View>
      <Text style={styles.welcomeText}>{t('greeting')}</Text>
      <Text style={styles.usernameText}>{username}</Text>
      <Text>{t('stats.completed')}</Text>
      <Text>{stats.completedQuizzes}/{stats.totalQuizzes}</Text>
    </View>
  );
}
```

---

### 7.5 Dynamic Content with Interpolation

**Before:**

```typescript
<Text>Questions completed: {count}</Text>
```

**After:**

```typescript
const { t } = useAppTranslation('quiz');
<Text>{t('completed', { count })}</Text>

// Translation file:
// "completed": "Questions completed: {{count}}"
```

---

### 7.6 Language Selector Component

**File:** `app/(tabs)/profile.tsx` (addition)

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfileScreen() {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { t } = useAppTranslation('profile');

  return (
    <View>
      {/* ... existing profile content ... */}

      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>{t('language.title')}</Text>
        <View style={styles.languageButtons}>
          {availableLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                currentLanguage === lang.code && styles.languageButtonActive
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  currentLanguage === lang.code && styles.languageButtonTextActive
                ]}
              >
                {lang.code.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Test File:** `__tests__/i18n.test.ts`

```typescript
import i18n from '@/i18n/config';

describe('i18n Configuration', () => {
  it('should initialize with English as default', () => {
    expect(i18n.language).toBe('en');
  });

  it('should have all required namespaces', () => {
    const namespaces = ['navigation', 'home', 'quiz', 'profile', 'chat', 'onboarding'];
    namespaces.forEach(ns => {
      expect(i18n.hasResourceBundle('en', ns)).toBe(true);
    });
  });

  it('should translate simple keys', () => {
    expect(i18n.t('home:greeting')).toBe('Welcome back,');
  });

  it('should interpolate variables', () => {
    const result = i18n.t('quiz:completed', { count: 5 });
    expect(result).toBe('Questions completed: 5');
  });
});
```

### 8.2 Integration Tests

**Test Scenarios:**

1. Language persistence across app restarts
2. Language selector updates all screens
3. Fallback to English for missing keys
4. Device locale detection on fresh install

### 8.3 Manual Testing Checklist

- [ ] Change language in Profile → all screens update
- [ ] Restart app → language persists
- [ ] Fresh install → uses device locale
- [ ] Missing translation key → shows English fallback
- [ ] Special characters render correctly (é, ñ, ü, etc.)
- [ ] Long text doesn't break layouts
- [ ] Numbers format correctly for locale
- [ ] All 49 strings translated in each language

---

## 9. Rollout Plan

### 9.1 Phased Rollout

**Week 1: Infrastructure**
- Day 1-2: Install dependencies, create file structure
- Day 3: Database migration and UserService methods
- Day 4-5: App integration and context setup

**Week 2: Component Conversion**
- Day 1: Navigation and Onboarding
- Day 2: Home and Quiz screens
- Day 3: Profile and Chat screens
- Day 4-5: Language selector UI

**Week 3: Translation & Testing**
- Day 1-2: Create English baseline files
- Day 3-4: Translate to 2-3 languages
- Day 5: Testing and bug fixes

**Week 4: Polish & Deploy**
- Day 1-2: Additional languages (if needed)
- Day 3: Documentation
- Day 4-5: Final testing and deployment

### 9.2 Success Metrics

- ✅ All 49 UI strings successfully translated
- ✅ Language switching works without app restart
- ✅ Zero layout breakages with long text
- ✅ Language preference persists correctly
- ✅ Performance unchanged (no lag on language switch)
- ✅ 100% test coverage for i18n logic

### 9.3 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Text too long for UI | Use shorter translations, test with longest language |
| Missing translations | Implement fallback to English for all keys |
| Performance issues | Lazy-load namespaces, cache translations |
| Database migration fails | Test migration on multiple database states |
| Breaking existing features | Comprehensive regression testing |

---

## 10. Translation Key Naming Convention

### 10.1 Standard Pattern

```
namespace.category.element
```

**Examples:**
- `navigation.tabs.home`
- `home.stats.completed`
- `onboarding.form.placeholder`
- `profile.language.title`

### 10.2 Guidelines

1. **Use lowercase** for all keys
2. **Use descriptive names** that indicate purpose
3. **Group related strings** under categories
4. **Avoid abbreviations** unless obvious (e.g., 'btn' for button)
5. **Use plural forms** when needed: `quiz.question` vs `quiz.questions`

### 10.3 Special Cases

**Dynamic Content:**
```json
{
  "quiz": {
    "completed": "Questions completed: {{count}}",
    "remaining": "{{remaining}} questions left"
  }
}
```

**Pluralization:**
```json
{
  "quiz": {
    "question_one": "{{count}} question",
    "question_other": "{{count}} questions"
  }
}
```

---

## 11. Adding New Languages

### 11.1 Step-by-Step Guide

1. **Create Language Directory**
   ```bash
   cd apps/mobile_client/locales
   mkdir [language-code]  # e.g., 'de' for German
   ```

2. **Copy English Structure**
   ```bash
   cp -r en/* [language-code]/
   ```

3. **Translate All Files**
   - Update each JSON file with translations
   - Maintain the same key structure
   - Test special characters

4. **Update i18n Config**
   ```typescript
   // i18n/config.ts
   import navigationDE from '../locales/de/navigation.json';
   // ... import other German files

   const resources = {
     // ... existing languages
     de: {
       navigation: navigationDE,
       // ... other German namespaces
     },
   };
   ```

5. **Add to Language Selector**
   ```typescript
   // contexts/LanguageContext.tsx
   const availableLanguages = [
     // ... existing languages
     { code: 'de', name: 'Deutsch' },
   ];
   ```

6. **Test Thoroughly**
   - Switch to new language
   - Check all screens
   - Verify persistence

---

## 12. Maintenance & Future Considerations

### 12.1 Adding New UI Strings

When adding new features:

1. **Never hardcode strings** in components
2. **Add to appropriate namespace** JSON file
3. **Use translation key** in component
4. **Update all language files** with translations

**Example:**
```typescript
// ❌ Bad
<Text>New Feature Title</Text>

// ✅ Good
<Text>{t('home.newFeature.title')}</Text>

// In locales/en/home.json:
{
  "newFeature": {
    "title": "New Feature Title"
  }
}
```

### 12.2 Translation Management Tools

Consider using translation management platforms:
- **Crowdin**: Collaborative translation with context
- **Lokalise**: Developer-friendly translation management
- **POEditor**: Simple, affordable option

### 12.3 Future Enhancements

**Potential Additions:**
- Date/time formatting per locale
- Number formatting (1,000 vs 1.000)
- Currency formatting
- Right-to-left language support (Arabic, Hebrew)
- Translating quiz content (separate from UI)
- Backend API localization for resources

---

## 13. Resources & References

### 13.1 Documentation

- [i18next Official Docs](https://www.i18next.com/)
- [react-i18next Guide](https://react.i18next.com/)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)

### 13.2 Language Codes (ISO 639-1)

| Language | Code | Native Name |
|----------|------|-------------|
| English | en | English |
| Spanish | es | Español |
| French | fr | Français |
| Hindi | hi | हिन्दी |
| German | de | Deutsch |
| Portuguese | pt | Português |
| Arabic | ar | العربية |
| Chinese (Simplified) | zh | 简体中文 |

### 13.3 Translation Resources

- **Google Translate**: Quick drafts (review required)
- **DeepL**: Higher quality translations
- **Professional Services**: For production-quality translations

---

## 14. Appendix

### 14.1 Complete String Inventory

All 49 strings categorized:

**Navigation (10):**
- Home (label + header)
- Resources (label + header)
- Quizzes (label + header)
- Chat (label + header)
- Profile (label + header)

**Onboarding (15):**
- Welcome title, subtitle
- Feature section title
- 4 feature cards (title + description each = 8)
- Name input label, placeholder
- Get Started button
- 2 alert messages

**Home (16):**
- Greeting
- 3 stat labels
- 2 progress labels
- Explore button
- 4 feature cards (title + description each = 8)

**Quiz (7):**
- Loading message
- Topic label
- Completed count message
- Review message
- Error messages (3)

**Profile (5):**
- 2 tab labels
- 2 stat messages
- Language section title

**Chat (3):**
- Initial message
- Resources message
- Input placeholder

---

## Conclusion

This plan provides a comprehensive roadmap for implementing i18n in the Aarti mobile app. With 49 strings across 6 screens, the scope is manageable and can be completed in 10-14 hours of development time.

The architecture uses industry-standard libraries (i18next, react-i18next) and follows React best practices. The implementation is additive and non-breaking, with proper fallbacks and error handling.

**Next Steps:**
1. Review and approve this plan
2. Select initial target languages
3. Begin Phase 1 implementation
4. Establish translation workflow

**Questions or Clarifications?**
Contact the development team or refer to this document throughout implementation.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Author:** Claude Code
**Status:** Ready for Implementation
