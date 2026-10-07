# Libram Shift Web

A browser-based game project built with HTML Canvas and vanilla JavaScript.

## Run

Install the development dependencies and build the stylesheet:

```sh
npm install
npm run build:css
```

Then open `src/game.html` in a modern browser. While editing styles, run
`npm run watch:css` to recompile the CSS whenever an SCSS file changes.

## Project files

- `src/game.html` provides the page and game canvas.
- `src/js/canvas-manger.js` contains canvas sizing and the game update/render loop.
- `src/js/main-menu.js` contains the main menu, audio options, and video settings.
- `src/js/story-intro.js` loads story paragraphs and displays them one at a time after Start.
- `src/js/character-select.js` displays the SVG-based Libram class selector after the introduction.
- `src/js/data-manager.js` loads Libram and enemy records from `src/data/`.
- `src/data/player.json` provides the default player record.
- `src/js/player-data.js` loads player data and persists Libram selection in browser storage.
- `src/js/splash-screen.js` manages the animated intro and reusable fade transitions.
- `src/js/color-palette.js` exposes the shared SCSS color palette to JavaScript.
- `src/scss/game.scss` contains the Sass source for the page styles.
- `src/css/game.css` is generated from the SCSS source by the build script.

Use `splashScreen.fadeOut(duration, callback)` to fade before changing menus,
then call `splashScreen.fadeIn(duration)` after the new menu is ready.
The game opens on a brief black screen before the splash animation. Click or
press a key to skip the splash. During the story introduction, each paragraph
has a minimum reading time; click or press a key once it is ready to continue to
the next paragraph. After the final paragraph, the game proceeds to character
selection.
Character selection uses Up/Down to switch between Libram and enemy selection,
and Left/Right to cycle the active selection. The enemy portraits form a
wrapping carousel with the selected portrait in the center. The selected
Libram class and enemy names appear beneath their respective portraits.

The default player record starts with the name `Player` and no Libram selected.
Selecting a Libram updates the in-game player data and saves the selection in
browser local storage; the JSON file remains the default record served by the game.
