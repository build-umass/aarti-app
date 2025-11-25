# Internationalization (i18n) Guide

## Overview

The Aarti mobile client uses **i18next** for internationalization, providing a robust, scalable solution for multi-language support. This guide covers the implementation details and how to extend it for additional languages.

**Current Status:** ✅ Phase 1 Complete (English baseline)
**Future:** Ready for Indian languages (Hindi, Tamil, Telugu, etc.)

## Table of Contents

1. [Architecture](#architecture)
2. [File Structure](#file-structure)
3. [Translation Key Naming](#translation-key-naming)
4. [Using Translations in Components](#using-translations-in-components)
5. [Adding New Languages](#adding-new-languages)
6. [Adding New Screens](#adding-new-screens)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

## Architecture

### Technology Stack

- **i18next** (v23.7.0+) - Core internationalization framework
- **react-i18next** (v14.0.0+) - React bindings for i18next
- **expo-localization** (v15.0.0+) - Device locale detection
- **AsyncStorage** - Language preference persistence

### Data Flow

```
User selects language in Profile
        ↓
LanguageContext.changeLanguage(lang)
        ↓
AsyncStorage saves preference
        ↓
i18next.changeLanguage(lang)
        ↓
All components re-render with new translations
```

### Key Components

1. **i18n/config.ts** - Initializes i18next with all translations
2. **contexts/LanguageContext.tsx** - Manages language state and persistence
3. **hooks/useAppTranslation.ts** - Custom hook for accessing translations
4. **locales/{lang}/{namespace}.json** - Translation files organized by language and namespace

## File Structure

```
apps/mobile_client/
├── i18n/
│   └── config.ts                    # i18next configuration
├── contexts/
│   └── LanguageContext.tsx          # Language state management
├── hooks/
│   └── useAppTranslation.ts         # Custom translation hook
└── locales/
    ├── en/                          # English (baseline)
    │   ├── navigation.json          # Tab labels and headers
    │   ├── home.json                # Home screen content
    │   ├── quiz.json                # Quiz screen
    │   ├── profile.json             # Profile screen
    │   ├── chat.json                # Chat messages
    │   └── onboarding.json          # Welcome and features
    ├── hi/                          # Hindi (future)
    │   └── [same structure]
    └── es/                          # Spanish (future)
        └── [same structure]
```

## Translation Key Naming

### Convention: snake_case

All translation keys use `snake_case` for consistency and readability.

**Examples:**
```json
{
  "welcome_back": "Welcome back,",
  "select_topic_label": "Select Topic:",
  "questions_completed": "Questions completed: {{completed}}/{{total}}"
}
```

### Naming Rules

1. **Use snake_case** - All lowercase with underscores
   - ✅ `welcome_back`, `quiz_completed`
   - ❌ `welcomeBack`, `QuizCompleted`, `welcome-back`

2. **Be descriptive** - Indicate what the string represents
   - ✅ `name_input_placeholder` ("Enter your name")
   - ❌ `placeholder1`, `text`, `str`

3. **Group logically** - Use nested objects for related content
   - ✅ `stats.quizzes_completed`, `stats.total_quizzes`
   - ❌ Flat structure with `stats_quizzes_completed`

4. **Keep phrases atomic** - Don't fragment sentences
   - ✅ `"welcome_message": "Welcome to Aarti"`
   - ❌ `"welcome": "Welcome"`, `"to": "to"`, `"aarti": "Aarti"`

5. **Use semantic names** - Not positional
   - ✅ `error_title`, `error_message`
   - ❌ `alert1`, `text_top`, `label_first`

### Interpolation Variables

For dynamic content, use double curly braces:

```json
{
  "questions_completed": "Questions completed: {{completed}}/{{total}}",
  "by_topic": "by {{topic}}: {{completed}}/{{total}}"
}
```

**Variable naming:**
- Use lowercase camelCase for variable names
- Be descriptive: `{{count}}`, `{{username}}`, `{{topicName}}`

## Using Translations in Components

### Basic Usage

```typescript
import { useAppTranslation } from '@/hooks/useAppTranslation';

export default function HomeScreen() {
  // Specify the namespace
  const { t } = useAppTranslation('home');

  return (
    <View>
      <Text>{t('welcome_back')}</Text>
      <Text>{t('stats.quizzes_completed')}</Text>
    </View>
  );
}
```

### With Interpolation

```typescript
const { t } = useAppTranslation('quiz');

// Simple interpolation
<Text>
  {t('questions_completed', { completed: 5, total: 10 })}
</Text>
// Output: "Questions completed: 5/10"

// Complex interpolation
<Text>
  {t('profile.stats.by_topic', {
    topic: 'Math',
    completed: 3,
    total: 5
  })}
</Text>
// Output: "by Math: 3/5"
```

### Multiple Namespaces

If you need translations from multiple namespaces:

```typescript
export default function MyScreen() {
  const { t: tNav } = useAppTranslation('navigation');
  const { t: tHome } = useAppTranslation('home');

  return (
    <View>
      <Text>{tNav('tabs.home')}</Text>
      <Text>{tHome('welcome_back')}</Text>
    </View>
  );
}
```

### In Alerts

```typescript
import { Alert } from 'react-native';
import { useAppTranslation } from '@/hooks/useAppTranslation';

export default function OnboardingScreen() {
  const { t } = useAppTranslation('onboarding');

  const handleSubmit = () => {
    if (!username) {
      Alert.alert(
        t('alerts.name_required_title'),
        t('alerts.name_required_message')
      );
      return;
    }
  };
}
```

### Rules of Hooks Compliance

**IMPORTANT:** Always call `useAppTranslation()` at the top level, before any conditions or early returns.

```typescript
// ❌ WRONG - Hook after condition
function MyComponent({ shouldShow }) {
  if (!shouldShow) return null;
  const { t } = useAppTranslation('home'); // May not be called every render
}

// ✅ CORRECT - Hook at top level
function MyComponent({ shouldShow }) {
  const { t } = useAppTranslation('home'); // Always called
  if (!shouldShow) return null;
}
```

## Adding New Languages

### Step 1: Create Translation Directory

Create a new directory in `locales/` with the [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes):

```bash
cd apps/mobile_client
mkdir -p locales/hi  # Hindi
mkdir -p locales/ta  # Tamil
mkdir -p locales/te  # Telugu
```

### Step 2: Copy English Structure

Copy all English translation files as a template:

```bash
# For Hindi
cp locales/en/navigation.json locales/hi/navigation.json
cp locales/en/home.json locales/hi/home.json
cp locales/en/quiz.json locales/hi/quiz.json
cp locales/en/profile.json locales/hi/profile.json
cp locales/en/chat.json locales/hi/chat.json
cp locales/en/onboarding.json locales/hi/onboarding.json

# Or copy all at once
cp -r locales/en/* locales/hi/
```

### Step 3: Translate All Strings

Update each JSON file with translated strings, maintaining the same key structure:

**Example - locales/hi/navigation.json:**
```json
{
  "tabs": {
    "home": "होम",
    "resources": "संसाधन",
    "quizzes": "प्रश्नोत्तरी",
    "chat": "चैट",
    "profile": "प्रोफ़ाइल",
    "settings": "सेटिंग्स"
  },
  "headers": {
    "home": "होम",
    "resources": "संसाधन",
    "quizzes": "प्रश्नोत्तरी",
    "chat": "चैट",
    "profile": "प्रोफ़ाइल",
    "settings": "सेटिंग्स"
  }
}
```

**Important:**
- Keep the **keys** identical to English
- Only translate the **values**
- Maintain interpolation variables: `{{count}}`, `{{topic}}`, etc.
- Test special characters render correctly

### Step 4: Import Translations in i18n/config.ts

```typescript
// Import Hindi translation files
import navigationHI from '../locales/hi/navigation.json';
import homeHI from '../locales/hi/home.json';
import quizHI from '../locales/hi/quiz.json';
import profileHI from '../locales/hi/profile.json';
import chatHI from '../locales/hi/chat.json';
import onboardingHI from '../locales/hi/onboarding.json';

const resources = {
  en: {
    navigation: navigationEN,
    home: homeEN,
    quiz: quizEN,
    profile: profileEN,
    chat: chatEN,
    onboarding: onboardingEN,
  },
  hi: {
    navigation: navigationHI,
    home: homeHI,
    quiz: quizHI,
    profile: profileHI,
    chat: chatHI,
    onboarding: onboardingHI,
  },
  // Add more languages here
};
```

### Step 5: Add to Language Selector

Update `contexts/LanguageContext.tsx` to include the new language:

```typescript
const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  // Add more languages here
];
```

### Step 6: Test Thoroughly

1. **Switch to new language** in Profile screen
2. **Navigate all screens** to verify translations
3. **Test interpolation** with dynamic values
4. **Check special characters** render correctly
5. **Test persistence** - restart app, verify language persists
6. **Test RTL** (if applicable) - Arabic, Hebrew

## Adding New Screens

When adding a new screen with user-facing text:

### 1. Create Translation File

Create a new namespace JSON file in all language directories:

```bash
# Create English version first
touch locales/en/settings.json

# Then create for other languages
touch locales/hi/settings.json
touch locales/ta/settings.json
```

### 2. Add Translations

**locales/en/settings.json:**
```json
{
  "title": "Settings",
  "sections": {
    "account": "Account Settings",
    "notifications": "Notifications",
    "privacy": "Privacy & Security"
  },
  "buttons": {
    "save": "Save Changes",
    "cancel": "Cancel",
    "reset": "Reset to Default"
  }
}
```

### 3. Import in i18n/config.ts

```typescript
import settingsEN from '../locales/en/settings.json';
import settingsHI from '../locales/hi/settings.json';

const resources = {
  en: {
    // ... existing namespaces
    settings: settingsEN,
  },
  hi: {
    // ... existing namespaces
    settings: settingsHI,
  },
};

// Add to ns array
i18n.use(initReactI18next).init({
  // ...
  ns: ['navigation', 'home', 'quiz', 'profile', 'chat', 'onboarding', 'settings'],
  // ...
});
```

### 4. Use in Component

```typescript
import { useAppTranslation } from '@/hooks/useAppTranslation';

export default function SettingsScreen() {
  const { t } = useAppTranslation('settings');

  return (
    <View>
      <Text>{t('title')}</Text>
      <Text>{t('sections.account')}</Text>
      <Button title={t('buttons.save')} />
    </View>
  );
}
```

## Best Practices

### ✅ DO

1. **Always use translation keys** - Never hardcode user-facing strings
   ```typescript
   // ✅ Good
   <Text>{t('welcome_message')}</Text>

   // ❌ Bad
   <Text>Welcome to Aarti</Text>
   ```

2. **Keep phrases complete** - Don't fragment sentences
   ```json
   // ✅ Good
   {
     "welcome_message": "Welcome to Aarti! Let's get started."
   }

   // ❌ Bad
   {
     "welcome": "Welcome to",
     "app_name": "Aarti",
     "exclamation": "!",
     "lets_start": "Let's get started."
   }
   ```

3. **Use interpolation for dynamic content**
   ```json
   {
     "greeting": "Hello, {{name}}!",
     "progress": "You've completed {{count}} of {{total}} quizzes."
   }
   ```

4. **Group related translations**
   ```json
   {
     "stats": {
       "completed": "Completed",
       "in_progress": "In Progress",
       "total": "Total"
     }
   }
   ```

5. **Test with longest language** - Some languages (German, Finnish) are ~30% longer

### ❌ DON'T

1. **Don't hardcode strings**
   ```typescript
   // ❌ Bad
   <Button title="Save" />

   // ✅ Good
   <Button title={t('buttons.save')} />
   ```

2. **Don't fragment sentences**
   ```typescript
   // ❌ Bad
   <Text>{t('you_have')} {count} {t('items')}</Text>

   // ✅ Good
   <Text>{t('item_count', { count })}</Text>
   ```

3. **Don't assume word order**
   ```typescript
   // ❌ Bad - Word order varies by language
   <Text>{t('completed')} {count} {t('quizzes')}</Text>

   // ✅ Good
   <Text>{t('quizzes_completed', { count })}</Text>
   ```

4. **Don't use English as keys**
   ```json
   // ❌ Bad
   {
     "Welcome back": "Welcome back"
   }

   // ✅ Good
   {
     "welcome_back": "Welcome back"
   }
   ```

5. **Don't translate technical terms unnecessarily**
   - Keep brand names: "Aarti"
   - Keep technical terms: "SQLite", "React Native"
   - Quiz content stays in English (per requirements)

## Common Patterns

### Alerts and Modals

```typescript
const { t } = useAppTranslation('onboarding');

Alert.alert(
  t('alerts.error_title'),
  t('alerts.error_message'),
  [
    { text: t('alerts.cancel'), style: 'cancel' },
    { text: t('alerts.retry'), onPress: handleRetry }
  ]
);
```

### Form Placeholders

```typescript
const { t } = useAppTranslation('onboarding');

<TextInput
  placeholder={t('name_input_placeholder')}
  value={name}
  onChangeText={setName}
/>
```

### Dynamic Lists

```typescript
const { t } = useAppTranslation('profile');

{topicStats.map((topic, i) => (
  <Text key={i}>
    {t('stats.by_topic', {
      topic: topic.name,
      completed: topic.completed,
      total: topic.total
    })}
  </Text>
))}
```

### Conditional Content

```typescript
const { t } = useAppTranslation('quiz');

{isCompleted && (
  <Text>{t('review_note')}</Text>
)}
```

## Troubleshooting

### Translation Not Showing

**Problem:** Text shows translation key instead of translated text

**Solutions:**
1. Check namespace is correct: `useAppTranslation('home')`
2. Verify key exists in JSON file
3. Check for typos in key name
4. Ensure JSON is valid (no trailing commas)
5. Restart development server after adding new translations

### Interpolation Not Working

**Problem:** Shows `{{variable}}` instead of value

**Solutions:**
1. Pass variables as second argument: `t('key', { variable })`
2. Check variable name matches JSON: `{{count}}` needs `{ count: 5 }`
3. Verify double curly braces in JSON: `{{count}}` not `{count}`

### Language Not Persisting

**Problem:** App reverts to default language after restart

**Solutions:**
1. Check AsyncStorage permissions
2. Verify `changeLanguage()` is being called
3. Check for errors in console
4. Test with: `AsyncStorage.getItem('@aarti_language_preference')`

### Special Characters Not Rendering

**Problem:** Shows boxes or garbled text

**Solutions:**
1. Ensure UTF-8 encoding for JSON files
2. Test with actual device (not just simulator)
3. Check font supports the character set
4. For some scripts (Arabic, Thai), may need custom fonts

### Keys Missing After Update

**Problem:** Some translations missing after adding new language

**Solutions:**
1. Compare new language JSON structure with English
2. Check all keys exist in both files
3. Use a JSON diff tool to find missing keys
4. Create a validation script to check completeness

## Translation Validation Script

Create `scripts/validate-translations.js`:

```javascript
const fs = require('fs');
const path = require('path');

const baseLanguage = 'en';
const localesDir = path.join(__dirname, '../apps/mobile_client/locales');

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function validateTranslations() {
  const languages = fs.readdirSync(localesDir).filter(f =>
    fs.statSync(path.join(localesDir, f)).isDirectory()
  );

  const baseDir = path.join(localesDir, baseLanguage);
  const namespaces = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));

  languages.forEach(lang => {
    if (lang === baseLanguage) return;

    console.log(`\nValidating ${lang}...`);
    let missingCount = 0;

    namespaces.forEach(namespace => {
      const basePath = path.join(baseDir, namespace);
      const langPath = path.join(localesDir, lang, namespace);

      if (!fs.existsSync(langPath)) {
        console.error(`  ❌ Missing file: ${namespace}`);
        return;
      }

      const baseContent = JSON.parse(fs.readFileSync(basePath, 'utf8'));
      const langContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));

      const baseKeys = getAllKeys(baseContent);
      const langKeys = getAllKeys(langContent);

      const missing = baseKeys.filter(k => !langKeys.includes(k));
      if (missing.length > 0) {
        console.error(`  ❌ ${namespace}: Missing ${missing.length} keys`);
        missing.forEach(k => console.error(`     - ${k}`));
        missingCount += missing.length;
      } else {
        console.log(`  ✅ ${namespace}: Complete`);
      }
    });

    if (missingCount === 0) {
      console.log(`\n✅ ${lang} is complete!`);
    } else {
      console.log(`\n⚠️  ${lang} is missing ${missingCount} translations`);
    }
  });
}

validateTranslations();
```

Run with:
```bash
node scripts/validate-translations.js
```

## Resources

### Documentation
- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Guide](https://react.i18next.com/)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)

### Language Codes
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- Common codes: `en` (English), `hi` (Hindi), `ta` (Tamil), `te` (Telugu), `es` (Spanish), `fr` (French)

### Translation Services
- **DeepL** - High-quality automated translation
- **Google Translate** - Quick drafts (review required)
- **Professional Services** - For production-quality translations

### Testing
- Test with actual native speakers
- Use accessibility tools for RTL languages
- Check text doesn't overflow UI elements
- Verify special characters render correctly

---

**Version:** 1.0
**Last Updated:** 2025-11-24
**Status:** Production Ready (English baseline)
