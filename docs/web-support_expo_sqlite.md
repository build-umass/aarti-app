# Web Support for Expo SQLite

This document explains how web support was added to the Aarti app using Expo SQLite's experimental web features.

## Overview

Expo SQLite now supports web platforms using a WebAssembly build of SQLite. However, web support is **experimental** and has some limitations:

- The `directory` parameter is not supported on web
- Only the **async API** (`openDatabaseAsync`) works on web
- The **sync API** (`openDatabaseSync`) only works on native platforms (iOS/Android)

## Implementation

### Platform Detection

The app now uses platform detection to choose the appropriate database initialization method:

- **Web**: Uses `openDatabaseAsync` (async API)
- **Native (iOS/Android)**: Uses `openDatabaseSync` (sync API)

### Code Changes

#### 1. Database Initialization (`lib/database.ts`)

```typescript
import { openDatabaseSync, openDatabaseAsync } from 'expo-sqlite';
import { Platform } from 'react-native';

export const initializeDatabase = async () => {
  if (!db) {
    if (Platform.OS === 'web') {
      // Use async API for web (experimental web support)
      const expoDb = await openDatabaseAsync('aarti_app.db');
      db = drizzle(expoDb, { schema });
    } else {
      // Use sync API for native platforms
      const expoDb = openDatabaseSync('aarti_app.db');
      db = drizzle(expoDb, { schema });
    }
  }
  return db;
};
```

#### 2. App Layout (`app/_layout.tsx`)

Updated the initialization to handle async database setup:

```typescript
useEffect(() => {
  if (loaded && !dbInitialized) {
    const initDb = async () => {
      try {
        await initializeDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initDb();
  }
}, [loaded, dbInitialized]);
```

## Running on Web

To run the app on web:

```bash
# Start the Expo development server with web support
npx expo start --web

# Or use the shortcut
npm run web
```

## Known Limitations

1. **Experimental Feature**: Web support is still experimental in Expo SQLite
2. **Performance**: WebAssembly SQLite may have different performance characteristics than native
3. **Storage**: Web SQLite uses IndexedDB for persistence under the hood
4. **Feature Parity**: Not all SQLite features may be available on web

## Browser Compatibility

The web version requires browsers that support:
- WebAssembly
- IndexedDB
- Modern JavaScript (ES2020+)

Supported browsers:
- ✅ Chrome 87+
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Edge 88+

## Troubleshooting

### Database Not Persisting on Web

If data is not persisting between page refreshes on web:
1. Check browser's IndexedDB in DevTools
2. Ensure cookies/storage are enabled
3. Check for browser extensions blocking storage

### Performance Issues on Web

WebAssembly SQLite may be slower than native. Consider:
1. Reducing query complexity
2. Limiting data set size
3. Using indexes effectively
4. Implementing pagination

### "openDatabaseSync is not supported on web" Error

This error means you're trying to use the sync API on web. Make sure:
1. Platform detection is working correctly
2. `Platform.OS === 'web'` branch uses `openDatabaseAsync`
3. All database calls properly await async operations

## References

- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo SQLite Web Setup](https://docs.expo.dev/versions/latest/sdk/sqlite/#web)
- [Expo SDK 53 Beta Announcement](https://blog.expo.dev/expo-sdk-53-beta-is-now-available-9e8bc46677e9)

## Future Improvements

As Expo's web support for SQLite matures, consider:
1. Monitoring for feature parity updates
2. Testing performance optimizations
3. Implementing web-specific caching strategies
4. Adding offline-first capabilities for web

---

*Last updated: October 2025*

