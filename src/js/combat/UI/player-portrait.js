const PLAYER_PORTRAIT_LAYOUT = Object.freeze({
  left: 16,
  top: 16,
  iconSize: 80,
  detailsGap: 16,
  nameFontSize: 24,
  healthFontSize: 18,
  statusGap: 4,
  statusBoxWidth: 18,
  statusBoxHeight: 18,
  statusBoxRadius: 3,
  statusBoxGap: 10,
  statusCount: 5,
  statusTimerFontSize: 16
});

const PLAYER_PORTRAIT_COLORS = Object.freeze({
  iconBorder: GameTheme.colors.textPrimary,
  name: GameTheme.colors.playerName,
  health: GameTheme.colors.textPrimary,
  statusBox: GameTheme.colors.buttonBackgroundSecondary
});

window.PlayerPortrait = class PlayerPortrait {
  render(context, combatant) {
    if (!combatant || !combatant.data) {
      throw new Error("A player combatant is required to render the portrait.");
    }

    const layout = PLAYER_PORTRAIT_LAYOUT;
    const detailsX = layout.left + layout.iconSize + layout.detailsGap;
    const name = combatant.data.name;

    if (typeof name !== "string" || !name.trim()) {
      throw new Error("The player combatant must include a name.");
    }

    context.save();
    context.textAlign = "left";
    context.textBaseline = "top";
    context.font = `700 ${layout.nameFontSize}px Roboto, sans-serif`;
    context.fillStyle = PLAYER_PORTRAIT_COLORS.name;
    context.fillText(name, detailsX, layout.top);

    const nameHeight = layout.nameFontSize * 1.2;
    const healthY = layout.top + nameHeight + layout.statusGap;
    const baseHealth = combatant.stats.base.health ?? 100;
    const currentHealth = combatant.stats.current.health ?? baseHealth;
    context.font = `${layout.healthFontSize}px Roboto, sans-serif`;
    context.fillStyle = PLAYER_PORTRAIT_COLORS.health;
    context.fillText(
      `Health ${currentHealth} / ${baseHealth}`,
      detailsX,
      healthY
    );

    const statusY = healthY + layout.healthFontSize * 1.2 + layout.statusGap;
    for (let index = 0; index < layout.statusCount; index += 1) {
      const boxX =
        detailsX + index * (layout.statusBoxWidth + layout.statusBoxGap);
      context.fillStyle = PLAYER_PORTRAIT_COLORS.statusBox;
      context.beginPath();
      context.roundRect(
        boxX,
        statusY,
        layout.statusBoxWidth,
        layout.statusBoxHeight,
        layout.statusBoxRadius
      );
      context.fill();
      context.font = `${layout.statusTimerFontSize}px Roboto, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = PLAYER_PORTRAIT_COLORS.name;
      context.fillText("0", boxX, statusY);
      context.textAlign = "left";
      context.textBaseline = "top";
    }

    context.strokeStyle = PLAYER_PORTRAIT_COLORS.iconBorder;
    context.lineWidth = 1;
    context.strokeRect(
      layout.left,
      layout.top,
      layout.iconSize,
      layout.iconSize
    );
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${layout.healthFontSize}px Roboto, sans-serif`;
    context.fillStyle = PLAYER_PORTRAIT_COLORS.health;
    context.fillText(
      "Icon",
      layout.left + layout.iconSize / 2,
      layout.top + layout.iconSize / 2
    );
    context.restore();
  }
};