# Aarti

Aarti is a quiz-based learning app with an AI chatbot that answers questions from a local knowledge base. It is a monorepo with three apps:

| App | Path | Stack | Default port |
|-----|------|-------|--------------|
| Mobile client | `apps/mobile_client` | Expo SDK 57 (React Native 0.86), expo-sqlite, expo-router | 8081 |
| Backend | `apps/backend` | Express 5, Mongoose 9, MongoDB | 3002 |
| Admin client | `apps/admin_client` | Next 16, React 19, Tailwind 4, JWT auth | 3000 |

The mobile app is offline-first. It stores quizzes, progress, bookmarks, and the chatbot's knowledge base in a local SQLite database. The backend centralizes quiz content for the admin dashboard. Shared TypeScript interfaces live in `types/index.ts`.

## Prerequisites

- Node.js 20+ and npm
- For native builds: Android Studio or Xcode. The web build needs neither.

## Install

```bash
(cd apps/mobile_client && npm i) && (cd apps/admin_client && npm i) && (cd apps/backend && npm i)
```

## Environment variables

Each app reads its own variables from a different file.

**Backend.** Create `.env` in the repository root (the backend loads it with `dotenv.config({ path: "../../.env" })`):

```
MONGODB_URI=<your-mongodb-connection-string>
```

**Admin client.** Create `.env.local` in `apps/admin_client`:

```
JWT_SECRET=<random-string>
ADMIN_PASSWORD_HASH=<bcrypt hash of your admin password>
```

Generate the password hash from the admin folder:

```bash
node -e "console.log(require('bcrypt').hashSync('your-password', 10))"
```

**Mobile client.** Create `.env` in `apps/mobile_client` (optional; only for the chatbot):

```
EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY=<your-google-ai-api-key>
```

Without a key the app runs normally, and the chat replies with a not-configured message.

## Run

Mobile (web):

```bash
cd apps/mobile_client
npx expo start        # press w for web, or scan the QR code with Expo Go
```

Mobile (native):

```bash
cd apps/mobile_client
npx expo prebuild
npx expo run:android   # or: npx expo run:ios
```

Backend:

```bash
cd apps/backend
npm run build
npm run start         # serves on port 3002, requires MONGODB_URI
```

Admin:

```bash
cd apps/admin_client
npm run dev           # serves on port 3000
```

## Checks

Run these from each app folder unless noted.

| Check | Command | Where |
|-------|---------|-------|
| Types (mobile) | `npx tsc --noEmit` | `apps/mobile_client` |
| Types (admin) | `npx tsc --noEmit` | `apps/admin_client` |
| Backend build | `npm run build` | `apps/backend` |
| Tests | `npx jest --ci` | `apps/mobile_client` |
| Lint (mobile) | `npm run lint` | `apps/mobile_client` |
| Lint (admin) | `npm run lint` | `apps/admin_client` |
| Expo health | `npx expo-doctor` | `apps/mobile_client` |
| Production web bundle | `npx expo export --platform web` | `apps/mobile_client` |
| Production admin build | `npm run build` | `apps/admin_client` |
| Dependency gate | `node scripts/check-unused-deps.mjs` | repo root |

The dependency gate fails when a package in any `package.json` has no import evidence in its app's source and no entry in the script's keep-list. `npx expo install --fix` keeps Expo packages aligned with the installed SDK.

## Verify in a browser

After changing the mobile app, exercise it the way a user would before calling the work done. Serve the production export rather than the dev server; the dev server can fail with a Metro `Worker chunk not found` error in expo-sqlite on SDK 57, and the export contains that worker chunk.

```bash
cd apps/mobile_client
npx expo export --platform web
npx expo serve --port 8081     # keep this process running
```

Then open http://localhost:8081 in a browser. A complete pass covers onboarding (enter a name, Get Started), one quiz answer (Capital Cities accepts `Paris`; completion moves to 25%), the resources list and a detail page with back navigation, and the chat tab (it renders and, without an API key, replies with a not-configured message).

Agents can drive the same flow headlessly. The project skill at `.opencode/skills/verify-aarti-web/` contains the full procedure, the launch scripts, and a feature map under `features/` that defines what a complete proof covers. Screenshots and transcripts belong in `.verify/evidence/`.

## More documentation

Deeper guides live in `docs/`: database and service design (`database-services.md`, `service-architecture.md`), naming conventions (`field-naming-conventions.md`), internationalization (`i18n-guide.md`), local setup and troubleshooting (`run-locally.md`, `troubleshooting.md`), and Expo SQLite web notes (`web-support_expo_sqlite.md`). The chatbot's setup and roadmap live in `apps/mobile_client/RAG_SETUP.md` and `apps/mobile_client/NEXT_STEPS.md`. `CLAUDE.md` and `AGENTS.md` at the repo root carry the conventions agents and contributors are expected to follow.
