# Quiz answering and bookmarks

The Quizzes tab lists the four seeded questions with topic filter chips. A user expands a question card, picks an option, and the answer is saved to `quiz_progress`; completion counters update on the Quizzes tab, Home, and Profile. An answered question shows a feedback block with a localized verdict (`Correct` when the pick is right, `Incorrect` otherwise) above the seeded feedback text. The bookmark icon on each card toggles a `bookmarks` row, and the `Bookmarked` chip filters to bookmarked questions. Answered questions can be changed once all are completed.

## Sub-features

- `quiz-filter` — topic chips (All, Bookmarked, Geography, Mathematics, Science, Technology) filter the question cards.
- `quiz-expand` — clicking a question title expands it to reveal its options.
- `quiz-answer` — selecting an option saves the answer, increments the completion counters, and shows a feedback block with a localized `Correct` or `Incorrect` verdict.
- `quiz-bookmark` — the icon on a card toggles bookmark state; the `Bookmarked` chip reflects it.
- `quiz-persist` — answers survive a full page reload (IndexedDB), and aggregates on Home/Profile agree.

## How to get to it (user POV)

- Choose the `Quizzes` tab in the bottom tab bar.
- From Home, choose the `Quizzes` card in the Explore section.

## Driving it with agent-browser

Preconditions:

- Baseline session: onboarding completed, no answers yet (Home shows `0` Quizzes Completed, `Questions completed: 0/4` on the Quizzes tab).
- Metro healthy per Doctor checks.

- **Open Quizzes.** Run `agent-browser find role tab click --name "Quizzes"`, then `agent-browser wait 6000`. `agent-browser snapshot -i` shows the chips `All`, `Bookmarked`, `Geography`, `Mathematics`, `Science`, `Technology` and four collapsed cards: `Capital Cities`, `Solar System`, `Basic Math`, `Programming`.
- **Topic filter.** Run `agent-browser find text "Geography" click --exact`, then `agent-browser wait 3000`. Only `Capital Cities` remains. Return with `agent-browser find text "All" click --exact`.
- **Expand.** Run `agent-browser find text "Capital Cities" click --exact`, then `agent-browser wait 3000`. The snapshot now shows options `London`, `Berlin`, `Paris`, `Madrid`.
- **Answer.** Re-snapshot and click the ref on `Paris` (correct answer), e.g. `agent-browser click "@e21"` with YOUR ref. Then `agent-browser eval "document.body.innerText.match(/Questions completed: \d+\/\d+/)?.[0]"` must report `1/4`. `agent-browser eval "document.body.innerText.match(/Correct|Incorrect/)"` must report `Correct` in the feedback block.
- **Bookmark.** Re-snapshot; each card has an icon-only ref next to its title. Click the one on `Solar System`, then choose the `Bookmarked` chip (`agent-browser find text "Bookmarked" click --exact`): `Solar System` is listed and `Capital Cities` is not.
- **Persistence.** Run `agent-browser open http://localhost:8081/`, `agent-browser wait 10000`, then `agent-browser eval "document.body.innerText.match(/Quizzes Completed\s*\d+\/\d+|Overall Completion\s*\d+%|Welcome back,[^\n]*/g)"`. Home must still show 1 completed / 25% and the saved name. Reopen the Quizzes tab: `1/4` again.
- **Proof.** Screenshots of the expanded question with options and of Home after reload into `.verify/evidence/`, plus the eval outputs. Feature ID: `quiz`.

## Gotchas

- `find text "Paris"` can fail with a coverage error (an overlaying element intercepts the click). If so, `agent-browser snapshot -i` and click the quoted ref instead — that always worked.
- The bookmark control is an icon with no text; identify it as the small clickable ref nested inside the question card in the snapshot, not by name.
- Counters are computed from filtered questions: with the `Geography` chip active the counter says `0/1`-style numbers for that topic only. Assert counters with `All` selected.
- The expanded card collapses when another card is clicked; re-expand before asserting options.
- Answering is ignored while some questions are incomplete (`handleAnswer` no-ops for already-answered questions until completion is 100%). To test changing an answer, complete all four first.
- Do not trust the counter alone as proof — a re-render can show stale state. The reload step (`quiz-persist`) is what proves the write reached IndexedDB.
