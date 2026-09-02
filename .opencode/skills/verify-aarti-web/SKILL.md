---
name: verify-aarti-web
description: Verify the Aarti mobile client (React Native Expo quiz-learning app) running on web at localhost:8081. Use when a task needs proof that user-facing behavior works — onboarding, quiz answering, bookmarks, data resets, profile stats, resources. Serves the web build, drives the real UI with agent-browser, captures screenshots/logs/DOM evidence. Refuses to drive instances it did not start.
---

# verify-aarti-web

Scripted verification for the Aarti app. You launch the mobile client's web build, drive it the way a user would with `agent-browser`, capture evidence, and tear down only what you started.

**Surface.** The primary user surface is the mobile client (`apps/mobile_client`), a React Native Expo app. This skill verifies its **web build** served by Metro — the only surface an agent can drive end to end here. Native iOS/Android need simulators, and the Express backend (`apps/backend`) plus admin client (`apps/admin_client`) need a MongoDB URI and JWT secret that are not in this checkout. Do not verify those unless explicitly asked, and never start the backend to "help" a mobile verification — the mobile app is offline-first and does not need it.

The app seeds a local SQLite database (IndexedDB on web) from `apps/mobile_client/assets/quizData.json`: 4 topics (Geography, Science, Mathematics, Technology), 4 questions. Correct answers: Capital Cities → `Paris`, Solar System → `Mars`, Basic Math → `4`, Programming → `JavaScript`.

## Launch

Serve the production web build. On SDK 57 the Metro dev server can fail with `Worker chunk not found` in expo-sqlite, and the export contains that worker chunk, so the export is the reliable surface:

```powershell
cd apps\mobile_client
npx expo export --platform web
npx expo serve --port 8081     # "Server running at http://localhost:8081"; keep it alive for the whole run
```

Alternative for quick iteration: start the Metro dev server with the helper (creates `.verify/`, writes `.verify/metro.pid`, blocks until ready):

```powershell
& .opencode\skills\verify-aarti-web\scripts\start-metro.ps1 -Port 8081
```

Ready is `METRO_READY port=8081 wrapperPid=...`, or `expo serve` printing `Server running at http://localhost:8081` (10–30 s). Then open the app:

```powershell
agent-browser open http://localhost:8081
agent-browser wait 15000   # first page load bundles the JS app; give it time
```

The page is not ready when the URL answers — wait until the client-side app has initialized its database. Signal of readiness: `agent-browser get url` shows either `/onboarding` (fresh browser profile) or `/` with the Home screen, and `agent-browser snapshot -i` shows a `textbox "Enter your name"` or `tab` elements. The server stays alive for the whole run; do not exit it between drives.

If the port is already owned, both paths refuse on purpose (`start-metro.ps1` names the owner; `expo serve` reports `Port is not available`): never drive an instance this run did not start. Verify with your own instance on another port only if you started it (`-Port 8082`) and keep every artifact labeled with the port.

Teardown is `stop-metro.ps1` (see Cleanup).

## Doctor

Run these read-only checks whenever anything looks off, before driving:

```powershell
# 1. Is the port owned by an Expo/Metro process (and not someone else's server)?
$owner = (Get-NetTCPConnection -LocalPort 8081 -State Listen | Select-Object -First 1).OwningProcess
(Get-CimInstance Win32_Process -Filter "ProcessId=$owner").CommandLine   # must contain 'expo' or 'metro'

# 2. Is the web bundle being served?
agent-browser get url          # should be http://localhost:8081/... not a chrome-error page

# 3. Did the client app initialize (DB seeded, router redirected)?
agent-browser snapshot -i      # expect onboarding textbox OR the 6 tab elements (Home, Resources, Quizzes, Chat, Profile, Settings)
```

If check 1 fails, the port belongs to someone else — stop, do not kill or drive it. If check 3 stalls on a blank page, re-check `.verify/metro-out.log` for `Unable to resolve module ...` (a dependency is missing: run `npm install` in `apps/mobile_client`, then restart Metro — mutating `node_modules` while Metro runs kills it).

## Drive

Harness: `agent-browser` (see its own skill for the full loop: open → `snapshot -i` → act on `@eN` refs → re-snapshot). The app has **no testIDs or ARIA labels**, so drive by text, placeholder, and role:

```powershell
# Tab navigation (6 tabs; the icon glyph makes exact names like " Quizzes" fragile — substring match works)
agent-browser find role tab click --name "Quizzes"

# Onboarding: enter name, submit
agent-browser find placeholder "Enter your name" fill "Verify Agent"
agent-browser find text "Get Started" click

# Quizzes: expand a question card, answer it (Paris is correct for "Capital Cities")
agent-browser find text "Capital Cities" click --exact
agent-browser snapshot -i                     # options appear: London, Berlin, Paris, Madrid
agent-browser click "@e21"                    # click by ref from YOUR latest snapshot

# Settings: username field, action buttons
agent-browser find role tab click --name "Settings"
agent-browser find text "Reset Quiz Progress" click
```

Read state without refs (works while the page re-renders):

```powershell
agent-browser eval "document.body.innerText.match(/Questions completed: \d+\/\d+/)?.[0]"
agent-browser eval "document.body.innerText.slice(0, 300)"
agent-browser console                          # app log: seeding, events, errors
agent-browser snapshot -i                      # full interactive tree
```

PowerShell quoting traps, each of which broke a real run:

- **Refs must be quoted**: `agent-browser click "@e21"`. Unquoted `@e21` is parsed as splatting and fails with `Missing arguments for: click`.
- **Screenshots need absolute paths**: `agent-browser screenshot "C:\Users\riddh\aarti-app\.verify\evidence\quiz.png"`. A relative path is silently accepted and the file lands in `~\.agent-browser\tmp\screenshots\` instead of your evidence directory.
- **`wait N` is milliseconds**; after clicks that trigger data reloads, `agent-browser wait 5000` before asserting.

Native dialogs: Settings uses `window.confirm`/`window.alert` on web (see features/settings-data-management.md). `confirm` pauses the page until you resolve it:

```powershell
agent-browser dialog status     # shows the pending dialog text
agent-browser dialog accept     # or: dialog dismiss
```

## Evidence

All proof goes to `C:\Users\riddh\aarti-app\.verify\evidence\` (create the directory if missing; it survives cleanup). A proof of a feature captures, at minimum:

1. **The action and the resulting state**, not just the final screen — e.g. the snapshot showing the expanded question with options, then the answer click, then `Questions completed: 1/4`.
2. **The side effect in a second, independent view**: quiz answers persist in IndexedDB. Reload the app (`agent-browser open http://localhost:8081/`, wait 10 s) and confirm the state survived — Home shows `Overall Completion 25%` after one correct answer; the Quizzes tab still shows `1/4`. A stat that only lives in React state is not proof.
3. **Screenshots with the app identity visible** (absolute paths, per the Drive section).
4. **A console transcript** when behavior is event-driven (resets emit `data_reset` / `quiz_progress_updated` events visible in `agent-browser console`); save it with `agent-browser console | Out-File -Encoding utf8 C:\Users\riddh\aarti-app\.verify\evidence\console-transcript.log`.

Standards: exercise the real user path (tabs, clicks, typing) — never seed or mutate state through services, SQL, or devtools as a substitute for driving. The chat tab needs a Gemini API key that is not configured in this checkout; verify at most that the tab renders, and say so rather than claiming the chat flow works. Report any entry point you could not reach with the command you attempted; do not report it verified via a different path.

The feature map in `features/` is the source of truth for what a complete proof covers — driving one convenient entry point is incomplete when the map lists others.

## Cleanup

```powershell
agent-browser close --all
& .opencode\skills\verify-aarti-web\scripts\stop-metro.ps1 -Port 8081
```

`stop-metro.ps1` kills only what the run started: the recorded wrapper PID from `.verify/metro.pid`, then the port owner as a fallback — and only after confirming its command line matches `expo|metro`. Never kill by process name; if the port owner is not Metro, the script leaves it and warns. Run cleanup after every attempt, including failed ones.

Cleanup removes instances and scratch state (`.verify/metro.pid`, `.verify/metro-out.log`, `.verify/metro-err.log`) — **never the evidence**: `.verify/evidence/` must still contain every screenshot and transcript after teardown. Verify that after cleaning up.

Browser sessions are disposable: `agent-browser close --all` discards the headless browser including its IndexedDB, which is exactly what you want — a verification run must not leave state behind for the user's own browsing.
