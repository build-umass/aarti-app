# AGENTS.md

Guidance for coding agents working in this monorepo. `CLAUDE.md` covers the same commands and architecture in more depth; this file lists what an agent must verify before claiming work is done, and the traps the codebase sets.

## Monorepo layout

- `apps/mobile_client` - Expo SDK 57 app (React Native 0.86, TypeScript 6). Expo Router for navigation, expo-sqlite for storage.
- `apps/backend` - Express 5 + Mongoose 9 API on port 3002.
- `apps/admin_client` - Next 16 + React 19 dashboard with JWT cookie auth.
- `types/index.ts` - Shared interfaces (`QuizItem`, `Resource`) imported by all three apps.
- `scripts/check-unused-deps.mjs` - Dependency gate (see Verification).
- `docs/` - Architecture guides. `.opencode/skills/verify-aarti-web/` drives the web build end to end.

## Verification gates

Run the gate for every app you touch. A task is done when its gates exit 0, not when the code compiles.

| App | Gates (run from the app folder) |
|-----|--------------------------------|
| mobile_client | `npx tsc --noEmit`, `npm run lint`, `npx jest --ci`, `npx expo-doctor`, `npx expo export --platform web` |
| admin_client | `npx tsc --noEmit`, `npm run lint`, `npm run build` |
| backend | `npm run build`, then `node -e "require('./dist/app.js')"` must load without MongoDB |

From the repo root, `node scripts/check-unused-deps.mjs` must also exit 0. The script fails when any dependency lacks import evidence or a keep-list entry. Adding a dependency means either using it in source or justifying it in the script's `TOOLING` map. Removing code can expose a dependency as unused; rerun the gate after deletions.

### End-to-end UI verification

Compile-time gates do not prove the app behaves. For mobile changes, drive the real UI before declaring done, using the project skill `.opencode/skills/verify-aarti-web/` (its `features/` map defines what a complete proof covers).

```powershell
cd apps/mobile_client
npx expo export --platform web          # dev server can fail on expo-sqlite web worker; the export is the reliable surface
npx expo serve --port 8081              # keep alive for the whole run
agent-browser open http://localhost:8081
agent-browser wait 15000                # first load initializes the database
agent-browser snapshot -i               # expect onboarding textbox or the tab bar
```

Rules the skill enforces:

- Drive only a server this run started. If the port is already owned by another process, stop; never kill or drive it.
- Exercise the real user path (tabs, clicks, typing). Do not seed or mutate state through services, SQL, or devtools.
- Proof needs the action, the resulting state, and one independent persistence view (reload and confirm the stat survived). Screenshots go to `.verify/evidence/` with absolute paths.
- Chat needs `EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY`. Without it, verify the tab renders and the not-configured fallback appears; do not claim the AI path works.
- Cleanup: `agent-browser close --all`, then `& .opencode\skills\verify-aarti-web\scripts\stop-metro.ps1 -Port 8081`. Cleanup preserves `.verify/evidence/`.

## Gotchas

**Mobile.**
- `tsconfig.json` sets `noUnusedLocals` and `noUnusedParameters`. Unused imports fail the build.
- SDK 56+ forbids importing `@react-navigation/*` in app code. Use expo-router primitives (`Stack`, `router.push`, `useLocalSearchParams`). Typed routes in `.expo/types/router.d.ts` regenerate when Metro starts; clear `.expo` if route types go stale.
- Mutating `node_modules` while Metro runs kills the dev server with a `Worker chunk not found` error in expo-sqlite. Finish installs, then restart Metro. The production export contains that worker chunk, so `npx expo export --platform web` plus `npx expo serve` is the reliable way to drive the app in a browser.
- jest exits 1 with `Tests: 1 passed` when the suite is green. The react-test-renderer teardown logs an import error after the environment is torn down; treat the test counts as the result.
- Keep all colors in `constants/Theme.ts` (`BrandColors`). Do not hardcode hex values.
- User-facing strings go through `useAppTranslation` with snake_case keys in `locales/<lang>/`. Quiz content stays in English.
- ESLint (eslint-config-expo 57) errors on setState called synchronously in an effect body. Do async work inside the effect with a `void (async () => { ... })()` IIFE and declare the loader before the effect.

**Naming.** SQLite returns `snake_case` (`topic_id`, `correct_answer`); TypeScript uses `camelCase` (`topicId`, `correctAnswer`). Services return snake_case. Components transform to camelCase on the way in. Reading `question.topicId` from service data returns `undefined`.

**Admin.**
- `cookies()` and `headers()` are async in Next 16. Await them.
- ESLint is flat config (`eslint.config.mjs`); `next lint` no longer exists.
- Login compares against `ADMIN_PASSWORD_HASH`, a bcrypt hash from `.env.local`. Next expands `$` references in env files; store the hash with every `$` escaped as `\$` or login fails with 401 even when the hash matches.

**Backend.**
- `controllers.ts` handlers send responses without returning the `Response` object. @types/express 5 types `RequestHandler` as returning `void | Promise<void>`.
- The backend loads `.env` from the repo root, not from `apps/backend`.
- Do not log `MONGODB_URI` or request bodies.

## Environment

| Variable | File | Used by |
|----------|------|---------|
| `MONGODB_URI` | repo-root `.env` | backend |
| `JWT_SECRET` | `apps/admin_client/.env.local` | admin auth |
| `ADMIN_PASSWORD_HASH` | `apps/admin_client/.env.local` | admin login |
| `EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY` | `apps/mobile_client/.env` | chatbot (optional) |

The mobile app is offline-first and never needs the backend or MongoDB to run.
