# Settings and data management

The Settings tab edits the display username and exposes destructive data management: Reset Quiz Progress and Delete All Bookmarks. On web these confirmations and successes use native browser dialogs (`window.confirm`, `window.alert`), not in-app UI. Saved values persist in SQLite (IndexedDB on web) and are reflected on other tabs.

## Sub-features

- `settings-username` — changing the username persists and updates Home's greeting.
- `settings-reset-progress` — Reset Quiz Progress deletes all `quiz_progress` rows; counters return to 0.
- `settings-delete-bookmarks` — Delete All Bookmarks removes all `bookmarks` rows; the Bookmarked filter empties.
- `settings-cancel` — dismissing a confirm dialog leaves data untouched.

## How to get to it (user POV)

- Choose the `Settings` tab in the bottom tab bar.

## Driving it with agent-browser

Preconditions:

- Session with onboarding completed.
- For `settings-reset-progress` / `settings-delete-bookmarks`: non-empty state to delete — answer at least one question and bookmark one card first (see [quiz-answering.md](./quiz-answering.md)).

- **Open Settings.** Run `agent-browser find role tab click --name "Settings"`, then `agent-browser wait 4000`. The snapshot shows the `Username` section with a textbox (placeholder `Enter your username`) and the Data Management buttons `Reset Quiz Progress` and `Delete All Bookmarks`.
- **Change username.** Re-snapshot; `agent-browser fill "@eN" "Verify Agent 2"` on the username ref, then click `Save` (`agent-browser find text "Save" click --exact`). A `Success` alert appears (auto-accepted) and the console shows the update. 
- **Username side effect.** Choose the Home tab and `agent-browser eval "document.body.innerText.slice(0, 80)"` — it contains `Welcome back, Verify Agent 2`. Reload the page and confirm it again before calling this proven.
- **Reset progress.** With ≥1 answered question: run `agent-browser find text "Reset Quiz Progress" click`, then `agent-browser wait 1500`, then `agent-browser dialog status` — it must report the confirm: `Reset Quiz Progress … This action cannot be undone.` Run `agent-browser dialog accept`. Home then shows `0` Quizzes Completed / `Overall Completion 0%`, and the Quizzes tab shows `0/4`.
- **Cancel instead.** Answer a question again, run the same click, then `agent-browser dialog dismiss`. The counter must stay `1/4`.
- **Delete bookmarks.** With ≥1 bookmark: click `Delete All Bookmarks`, `dialog status` shows `Reset Bookmarks …`, `dialog accept`. The Quizzes tab's `Bookmarked` chip then lists no questions.
- **Proof.** Screenshots before/after each destructive action into `.verify/evidence/`, plus counter eval outputs and `agent-browser console | Out-File -Encoding utf8 C:\Users\riddh\aarti-app\.verify\evidence\console-transcript.log` (the reset logs `Quiz progress reset successful` and emits `data_reset`). Feature ID: `settings`.

## Gotchas

- The confirm dialog **pauses the page**: any `eval` or `get` between clicking the button and `dialog accept`/`dismiss` can fail with a connection error (`os error 10060`). Check `dialog status`, resolve the dialog, then wait (`agent-browser wait 3000`) and retry the read.
- After a successful action a second native alert (`Success …`) appears; agent-browser auto-accepts alerts, but reads immediately after can still fail transiently — wait and retry rather than concluding failure.
- `dialog accept` confirms the destructive action for real. These resets are the intended way to restore baseline state at the end of a run.
- The `Save` click with an unchanged or empty username pops an alert (`No changes to save` / `Username cannot be empty`) instead of saving; that is the correct behavior for those inputs, not a failure.
- Buttons are matched by visible text; after locale changes re-derive strings from `locales/en/settings.json`.
