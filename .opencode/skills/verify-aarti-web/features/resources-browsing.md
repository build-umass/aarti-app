# Resources browsing

The Resources tab lists support resources read from the `resources` SQLite table through `ResourceService`. The table is seeded on first launch from `apps/mobile_client/assets/resourcesData.json`, so the titles are real content titles, not placeholders. Choosing a resource opens a detail view that shows its title and numbered sections.

## Sub-features

- `resources-list` — the tab renders the resource list from `ResourceService.getAllResources()`.
- `resources-detail` — choosing a resource opens its detail view with the title and numbered section content.
- `resources-back` — the user can return from a detail view to the list.
- `resources-persist` — resources come from SQLite (IndexedDB on web) and survive a full page reload.

## How to get to it (user POV)

- Choose the `Resources` tab in the bottom tab bar.
- From Home, choose the `Resources` card in the Explore section.

## Driving it with agent-browser

Preconditions:

- Session with onboarding completed.
- Metro healthy per Doctor checks.

- **Open list.** Run `agent-browser find role tab click --name "Resources"`, then `agent-browser wait 4000`. `agent-browser snapshot -i` shows clickable rows with the real titles (for example `A Beginner's Guide to Web Development`, `Mastering Time Management`, `World War II: A Comprehensive Overview`), each with a `→` arrow.
- **Open detail.** Run `agent-browser find text "Mastering Time Management" click --exact`, then `agent-browser wait 3000`. The page shows the chosen title and numbered section headers (`1. …`, `2. …`) with their content per `agent-browser eval "document.body.innerText.slice(0, 300)"`.
- **Return.** Re-snapshot and use the visible back affordance if one renders; on web the stack may expose no header. If there is none, re-open the tab (`agent-browser find role tab click --name "Resources"`) and confirm the list renders again.
- **Persistence.** Run `agent-browser open http://localhost:8081/`, `agent-browser wait 10000`, then reopen the Resources tab. The same titles must render.
- **Home entry point.** Choose the Home tab, then the `Resources` card in the Explore section (`agent-browser find text "Resources" click` from Home) — the same list must appear.
- **Proof.** Screenshots of list and detail views into `.verify/evidence/`, plus snapshot/eval text showing the titles and a detail's sections. Feature ID: `resources`.

## Gotchas

- Rows are plain text presses without ARIA roles; `find text --exact` on the title is the stable handle.
- `find text "Resources"` from Home can match the tab label instead of the card — scope by clicking from the Home snapshot ref of the Explore card.
- Resource titles come from the seeded data; if `assets/resourcesData.json` changes, update the expected titles here.
- Resources are read from SQLite on each visit, so the reload step (`resources-persist`) is what proves the seed reached the database.
