# Project coding guidelines

Use these guidelines when making changes in this repository.

## Keep changes clear and focused

- Make the smallest complete change that solves the requested problem. Avoid unrelated refactors and speculative abstractions.
- Prefer straightforward, readable code over clever or compressed code. Use descriptive names, small functions with one clear responsibility, and early exits for invalid states.
- Keep related behavior together, but separate distinct responsibilities. For example, keep rendering, input handling, game-state transitions, data loading, persistence, and shared utilities in their appropriate existing modules.
- Reuse existing helpers and patterns before introducing new ones. Avoid duplicated logic, unnecessary global state, and unexplained magic numbers; name values that represent meaningful settings or game rules.
- Add comments only when they explain non-obvious intent or constraints.

## Follow the existing architecture

- This project uses browser-native HTML Canvas and vanilla JavaScript; do not introduce a framework, module system, or dependency without a clear need and an explicit request or strong justification.
- JavaScript files are classic scripts loaded by `src/game.html`. Preserve script load order and the existing `window`-based interfaces when changing how files communicate. Avoid adding globals unless they are an intentional part of a module's public interface.
- Keep page structure in HTML, presentation in SCSS, game behavior in JavaScript, and game records and story content in JSON. Prefer updating the source that owns the behavior rather than adding parallel implementations.
- Keep source and generated files distinct. Edit `src/scss/` rather than generated `src/css/game.css`, and edit `src/json/` rather than generated `src/js/game-data.js`. Regenerate outputs with the documented build commands.
- Preserve support for opening `src/game.html` directly from the local filesystem. Do not add runtime behavior that requires a local server unless the requirement explicitly changes.

## Make behavior reliable

- Preserve existing user-facing behavior unless the requested change calls for a deliberate change.
- Validate data at the boundary where it enters the game, and report failures clearly. Do not silently swallow exceptions, substitute success-shaped fallback values, or leave partially initialized state without an explicit error.
- Keep asynchronous operations and browser-storage access explicit about failure. Follow nearby error-handling patterns and surface actionable errors rather than hiding them.
- For event listeners, timers, and animation frames, make ownership and cleanup clear so transitions or repeated setup do not leave duplicate work running.
- Keep DOM and canvas interactions safe: reuse existing elements where possible, use text APIs for user-provided text, and account for missing elements or invalid dimensions where they can occur.
- When changing behavior, check the affected call sites and state transitions for regressions, edge cases, and failure paths rather than reviewing only the edited lines.
- Consider security implications relevant to the change, especially untrusted text or data, DOM insertion, browser storage, and assumptions about bundled JSON. Fix concrete vulnerabilities; do not add speculative defenses that complicate normal flows.

## Validate changes

- Add or update focused tests for non-trivial logic and bug fixes when the behavior can be tested reliably. Include the regression case and meaningful boundary or failure cases; avoid tests that merely restate implementation details.
- Use existing test tooling if present. This repository currently has no test script or test framework; do not add one for a trivial change. If a change needs automated tests, choose the lightest suitable approach and explain any new tooling.
- Run `npm run build` after changes that affect JavaScript data generation or SCSS; it runs both build steps.
- For SCSS-only iteration, `npm run build:css` is the focused validation command. For JSON data changes, run `npm run build:game-data`.
- Inspect the final diff for unintended changes and generated output; do not overwrite generated files by hand.
- If a change affects browser behavior, verify the affected flow in the browser when practical. State clearly which checks ran and when behavior could not be exercised or automated.
