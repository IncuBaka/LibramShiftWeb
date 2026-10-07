window.CombatManager = class CombatManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.isActive = false;
  }

  start() {
    this.isActive = true;
    console.log("Combat placeholder started.");
  }

  update(deltaTime) {
    if (!this.isActive) {
      return;
    }
  }

  render(context) {
    if (!this.isActive) {
      return;
    }

    context.fillStyle = GameTheme.colors.pageBackground;
    context.fillRect(0, 0, this.width, this.height);
    context.fillStyle = GameTheme.colors.textPrimary;
    context.font = "32px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Combat placeholder", this.width / 2, this.height / 2);
  }
};
