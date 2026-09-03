# Profile stats

The Profile tab shows aggregate learning statistics: overall quizzes completed out of total, per-topic breakdowns, and the language preference selector. Its numbers are computed from `quiz_progress` joined to `topics`, so they must always agree with the Quizzes tab and Home aggregates for the same data.

## Sub-features

- `profile-aggregate` — `Quizzes Completed: {{completed}}/{{total}}` reflects answered questions.
- `profile-by-topic` — per-topic lines (`by {{topic}}: {{completed}}/{{total}}`) match answers per topic.
- `profile-language` — a language selector is present and shows the current selection (only English is shipped in `locales/`).

## How to get to it (user POV)

- Choose the `Profile` tab in the bottom tab bar.

## Driving it with agent-browser

Preconditions:

- Session with onboarding completed.
- A known answer state — either fresh (0/4) or exactly one answered question (see [quiz-answering.md](./quiz-answering.md)) so expected numbers are computable.

- **Open Profile.** Run `agent-browser find role tab click --name "Profile"`, then `agent-browser wait 4000`. `agent-browser eval "document.body.innerText"` shows `Quizzes Completed: 0/4` (fresh) or `Quizzes Completed: 1/4` (one answered).
- **Cross-check.** The number must equal what the Quizzes tab counter and Home's `Overall Completion` imply for the same session. Any disagreement is a bug, not a display quirk — capture it.
- **Per-topic.** With `Capital Cities` (Geography) answered, `agent-browser eval "document.body.innerText"` contains `by Geography: 1/1` (and `0/1` for the other topics).
- **Language selector.** The snapshot shows a `Language Preference` section with a `Select Language` control. Open it if it is a native select (`agent-browser snapshot -i`, then `agent-browser select "@eN" "en"`); otherwise pick the visible option labeled English. The UI must not error (check `agent-browser console` for exceptions).
- **Proof.** Screenshot of the Profile tab with stats visible into `.verify/evidence/`, plus the eval output showing the aggregate. Feature ID: `profile`.

## Gotchas

- Stats load asynchronously after the tab renders; a snapshot taken immediately can show zeros for an answered session. Wait and re-read.
- The completed count on Profile and the percentage on Home both count answered questions, so they agree for the same session. A wrong answer still increments the answered count, so Home's percentage and Profile's count move together.
- Only `en` translations exist under `locales/`; switching the selector to a language that is not shipped may fall back to English or show raw keys — record what you observe rather than assuming either.
