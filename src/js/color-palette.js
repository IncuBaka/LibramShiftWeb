const themeProperties = {
  pageBackground: "--game-color-page-background",
  canvasBackground: "--game-color-canvas-background",
  menuBackgroundStart: "--game-color-menu-background-start",
  buttonBackground: "--game-color-button-background",
  buttonBackgroundSecondary: "--game-color-button-background-secondary",
  buttonBorder: "--game-color-button-border",
  textPrimary: "--game-color-text-primary",
  textSecondary: "--game-color-text-secondary",
  textOnAccent: "--game-color-text-on-accent",
  accent: "--game-color-accent",
  accentLight: "--game-color-accent-light",
  accentDark: "--game-color-accent-dark",
  shrimpTail: "--game-color-shrimp-tail",
  hat: "--game-color-hat",
  hatBand: "--game-color-hat-band"
};

const rootStyles = getComputedStyle(document.documentElement);

window.GameTheme = Object.freeze({
  colors: Object.freeze(
    Object.fromEntries(
      Object.entries(themeProperties).map(([name, property]) => [
        name,
        rootStyles.getPropertyValue(property).trim()
      ])
    )
  )
});
