# Onboarding

Onboarding is the first-launch gate: a fresh profile lands on `/onboarding`, enters a name, chooses `Get Started`, and is redirected to Home where the name is displayed. Completing it flips `onboarding_completed` in `user_settings`, so subsequent launches skip straight to Home.

## Sub-features

- `onboarding-gate` — a fresh session redirects `/` → `/onboarding`; a session that completed onboarding lands on Home instead.
- `onboarding-name-required` — `Get Started` with an empty name is blocked with an alert.
- `onboarding-complete` — entering a name and submitting lands on Home showing `Welcome back, <name>`.

## How to get to it (user POV)

- Open `http://localhost:8081` in a browser session with no prior Aarti state (new `agent-browser --session` name).
- There is no in-app way back to onboarding once completed; to re-drive it, start another fresh session.

## Driving it with agent-browser

Preconditions:

- Metro healthy per Doctor checks; browser session has no prior Aarti IndexedDB state.
- `agent-browser open http://localhost:8081` then `agent-browser wait 15000`.

- **Gate redirect.** Open the root URL. Run `agent-browser get url` — it must report `http://localhost:8081/onboarding`. A session that already completed onboarding reports `/` instead; do not re-run this recipe in that session.
- **Empty name blocked.** Run `agent-browser find text "Get Started" click` with the textbox empty. A `Name Required` alert appears (`window.alert` — auto-accepted by agent-browser; confirm via `agent-browser console` or the URL still being `/onboarding`).
- **Enter name.** Run `agent-browser find placeholder "Enter your name" fill "Verify Agent"`. The textbox now holds the name (`agent-browser get value` on a fresh snapshot ref).
- **Submit.** Run `agent-browser find text "Get Started" click`, then `agent-browser wait 5000`. `agent-browser get url` reports `/` and `agent-browser snapshot -i` shows `tab` elements for Home, Resources, Quizzes, Chat, Profile, Settings.
- **Name shown.** Run `agent-browser eval "document.body.innerText.slice(0, 120)"` — output contains `Welcome back, Verify Agent`, plus `0` `Quizzes Completed` and `4` `Total Quizzes`.
- **Proof.** `agent-browser screenshot "C:\Users\riddh\aarti-app\.verify\evidence\onboarding-home.png"` with the Home screen and name visible, and save the snapshot text alongside it. Feature ID: `onboarding`.

## Gotchas

- The first load after `agent-browser open` bundles the whole JS app; a snapshot taken too early shows a blank page. Wait for the `/onboarding` URL, then wait again for the textbox.
- `Get Started` is also matched by `find text "Get Started" click`; if the page has scrolled and the click lands on nothing, re-snapshot and click the ref directly.
- Completing onboarding in a session is permanent for that session's IndexedDB. Persistence-style checks can reuse the session; baseline-state checks must not.
- The Home name comes from the database, not the URL: reload the page (`agent-browser open http://localhost:8081/`, wait 10 s) and confirm the name still shows before calling `onboarding-complete` proven.
