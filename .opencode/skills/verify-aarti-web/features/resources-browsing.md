# Resources browsing

The Resources tab lists static support resources from `mockData/resourcesMockData.ts` and navigates to a detail view showing numbered sections. The list is currently seeded mock data (`Resource 1`, `Resource 2`, `Resource 3`); content itself comes from the mock file, so verification focuses on navigation and rendering, not data freshness.

## Sub-features

- `resources-list` — the tab renders the resource list from mock data.
- `resources-detail` — choosing a resource opens its detail view with the title and numbered sections.
- `resources-back` — the user can return from a detail view to the list.

## How to get to it (user POV)

- Choose the `Resources` tab in the bottom tab bar.
- From Home, choose the `Resources` card in the Explore section.

## Driving it with agent-browser

Preconditions:

- Session with onboarding completed.
- Metro healthy per Doctor checks.

- **Open list.** Run `agent-browser find role tab click --name "Resources"`, then `agent-browser wait 4000`. `agent-browser snapshot -i` shows clickable rows `Resource 1`, `Resource 2`, `Resource 3`, each with a `→` arrow.
- **Open detail.** Run `agent-browser find text "Resource 2" click --exact`, then `agent-browser wait 3000`. The page shows the `Resource 2` title and numbered section headers (`1. …`, `2. …`) per `agent-browser eval "document.body.innerText.slice(0, 300)"`.
- **Return.** Re-snapshot and use the visible back affordance if one renders; on web the stack may expose no header — if there is none, re-open the tab (`agent-browser find role tab click --name "Resources"`) and confirm the list renders again.
- **Home entry point.** Choose the Home tab, then the `Resources` card in the Explore section (`agent-browser find text "Resources" click` from Home) — the same list must appear.
- **Proof.** Screenshots of list and detail views into `.verify/evidence/`, plus snapshot/eval text showing the three titles and a detail's sections. Feature ID: `resources`.

## Gotchas

- Rows are plain text presses without ARIA roles; `find text --exact` on the title is the stable handle.
- `find text "Resources"` from Home can match the tab label instead of the card — scope by clicking from the Home snapshot ref of the Explore card.
- Detail content is commented out in the mock screen except for section headers/content; expecting a body paragraph under the title is wrong.
- This feature reads mock data only — nothing here writes to the database, so no persistence step is required.
