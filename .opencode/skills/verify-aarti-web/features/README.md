# Aarti web verification map

This directory is the maintained source for verifying the user-facing behavior of the Aarti mobile client running on web (Metro, `http://localhost:8081`). Read the index before driving the app, then use the matching feature file as the recipe. Launch, doctor, drive, evidence, and cleanup procedures live in the parent [SKILL.md](../SKILL.md).

## Baseline preconditions

- Metro started by this run via `start-metro.ps1` and healthy per the Doctor checks. Never drive an instance this run did not start.
- A browser session with a **fresh profile state** when the recipe needs the seeded starting state (0 answers, 0 bookmarks, onboarding incomplete). Use a new `agent-browser --session <name>` per run; reuse the same session only when deliberately testing persistence.
- Fresh state shows onboarding at `/onboarding`. Completing it creates the single user row (`onboarding_completed = 1`) — there is no UI to undo this short of a new session.
- Seed data comes from `apps/mobile_client/assets/quizData.json`: topics Geography, Science, Mathematics, Technology; questions Capital Cities (correct: Paris), Solar System (Mars), Basic Math (4), Programming (JavaScript). The app has no user-facing content editor; if the data file changed, update the expected values here.
- No Gemini API key is configured (`EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY` missing in `apps/mobile_client/.env`), so chat responses cannot work. Chat is deliberately not mapped as a verifiable feature; verify only that the tab renders.

## Driving conventions

- Drive only through the real UI: tabs, text, placeholders, refs from `agent-browser snapshot -i`. Never mutate state via services, SQL, or devtools.
- Re-snapshot after every navigation or expansion; refs go stale on re-render.
- Quote refs in PowerShell (`click "@e21"`); use absolute paths for screenshots.
- The app i18n default is English (`locales/en/`); all quoted strings below are the English values. If locales change, re-derive the strings from those files.
- Restore baseline after a mutation (e.g. Settings → Reset Quiz Progress) or start a fresh session before the next recipe. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- Mutation proof requires a second, independent view: reload the app and re-read the stat, or check the cross-screen aggregate (Home/Profile) — quiz state lives in IndexedDB and must survive a full page reload.
- UI proof includes a screenshot (absolute path into `.verify/evidence/`) plus a DOM read (`eval` on `document.body.innerText`) or snapshot line showing the asserted text.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition. Do not report a skipped entry point as verified through a different path.

## Features

- [Onboarding](./onboarding.md) — first-launch name capture, `Get Started`, redirect, name shown on Home.
- [Quiz answering and bookmarks](./quiz-answering.md) — topic filters, expanding questions, answering, completion counters, bookmarking, persistence.
- [Settings and data management](./settings-data-management.md) — username change, reset quiz progress, delete bookmarks, native confirm/alert dialogs.
- [Profile stats](./profile-stats.md) — aggregate completion stats reflecting quiz progress.
- [Resources browsing](./resources-browsing.md) — resource list and detail navigation.
