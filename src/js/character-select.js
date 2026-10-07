window.CharacterSelect = class CharacterSelect {
  constructor(width, height, playerData, libramData) {
    this.width = width;
    this.height = height;
    this.playerData = playerData;
    this.selectedIndex = -1;
    this.rotation = 0;
    this.targetRotation = 0;
    this.rotationStart = 0;
    this.rotationElapsed = 0;
    this.rotationDuration = 0;
    this.classes = [
      { id: "daring-duelist", x: 84.38, y: 7.64 },
      { id: "larcenist", x: 157.26, y: 49.64 },
      { id: "mental-mage", x: 157.39, y: 132.46 },
      { id: "caster", x: 84.38, y: 175.65 },
      { id: "sinister-shaman", x: 11.39, y: 132.46 },
      { id: "brawler", x: 11.51, y: 49.64 }
    ].map(layout => ({ ...libramData.get(layout.id), ...layout }));
    this.selectedIndex = this.classes.findIndex(
      libram => libram.id === playerData.player.libram?.id
    );

    const script = document.querySelector('script[src$="character-select.js"]');
    this.circleImage = new Image();
    this.circleImage.src = new URL("../assets/libramCircle.svg", script.src).href;
  }

  update(deltaTime) {
    if (this.rotation === this.targetRotation) {
      return;
    }

    this.rotationElapsed = Math.min(
      this.rotationElapsed + deltaTime,
      this.rotationDuration
    );
    const progress = this.rotationDuration === 0
      ? 1
      : this.rotationElapsed / this.rotationDuration;
    const easedProgress = progress * progress * (3 - 2 * progress);
    this.rotation =
      this.rotationStart +
      (this.targetRotation - this.rotationStart) * easedProgress;

    if (progress === 1) {
      this.rotation = this.targetRotation;
    }
  }

  select(index) {
    const libramClass = this.classes[index];
    if (!libramClass) {
      return;
    }

    this.selectedIndex = index;
    this.playerData.selectLibram(libramClass);
    const fullTurn = Math.PI * 2;
    const markerAngle = Math.atan2(
      libramClass.y - 92,
      libramClass.x - 84.5
    );
    const selectedRotation = -Math.PI / 2 - markerAngle;
    this.targetRotation =
      selectedRotation +
      Math.round((this.rotation - selectedRotation) / fullTurn) * fullTurn;
    this.rotationStart = this.rotation;
    this.rotationElapsed = 0;
    this.rotationDuration = Math.max(
      1.2,
      (Math.abs(this.targetRotation - this.rotationStart) / Math.PI) * 1.8
    );
  }

  rotatePoint(x, y, scale, originX, originY) {
    const offsetX = x - 84.5;
    const offsetY = y - 92;
    const cosine = Math.cos(this.rotation);
    const sine = Math.sin(this.rotation);
    return {
      x: originX + (84.5 + offsetX * cosine - offsetY * sine) * scale,
      y: originY + (92 + offsetX * sine + offsetY * cosine) * scale
    };
  }

  render(context, pointer, focusedIndex) {
    const scale = Math.min(1.9, (this.width * 0.75) / 169, (this.height * 0.62) / 184);
    const imageWidth = 169 * scale;
    const imageHeight = 184 * scale;
    const originX = (this.width - imageWidth) / 2;
    const originY = (this.height - imageHeight) / 2;
    const fontSize = 11 * scale;
    const hitAreas = [];

    context.fillStyle = GameTheme.colors.textPrimary;
    context.font = "36px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Choose Your Libram Class", this.width / 2, 36);

    const centerX = originX + 84.5 * scale;
    const centerY = originY + 92 * scale;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(this.rotation);
    context.translate(-centerX, -centerY);
    if (this.circleImage.complete && this.circleImage.naturalWidth > 0) {
      context.drawImage(this.circleImage, originX, originY, imageWidth, imageHeight);
    }
    context.restore();

    this.classes.forEach((libramClass, index) => {
      const radialX = libramClass.x - 84.5;
      const radialY = libramClass.y - 92;
      const radialLength = Math.hypot(radialX, radialY);
      const labelRadius = radialLength + 36;
      const squareCenter = this.rotatePoint(
        libramClass.x,
        libramClass.y,
        scale,
        originX,
        originY
      );
      const labelDistance = Math.hypot(
        libramClass.x - 84.5,
        libramClass.y - 92
      ) + 36;
      const label = this.rotatePoint(
        84.5 + (radialX / radialLength) * labelRadius,
        92 + (radialY / radialLength) * labelRadius,
        scale,
        originX,
        originY
      );
      const markerX = squareCenter.x;
      const markerY = squareCenter.y;
      const labelX = label.x;
      const labelY = label.y;
      const squareSize = 15.35 * scale;
      const isFocused = index === focusedIndex;
      const isSelected = index === this.selectedIndex;
      context.font = `600 ${fontSize}px sans-serif`;
      const textWidth = context.measureText(libramClass.name).width + 28;
      const hitArea = {
        type: "button",
        x: Math.min(markerX - squareSize, labelX - textWidth / 2),
        y: Math.min(markerY - squareSize, labelY - fontSize),
        width: Math.max(markerX + squareSize, labelX + textWidth / 2) -
          Math.min(markerX - squareSize, labelX - textWidth / 2),
        height: Math.max(markerY + squareSize, labelY + fontSize) -
          Math.min(markerY - squareSize, labelY - fontSize),
        onActivate: () => {
          this.select(index);
        }
      };
      const hovered =
        pointer.x >= hitArea.x &&
        pointer.x <= hitArea.x + hitArea.width &&
        pointer.y >= hitArea.y &&
        pointer.y <= hitArea.y + hitArea.height;

      context.fillStyle = libramClass.color;
      context.fillRect(
        markerX - squareSize / 2,
        markerY - squareSize / 2,
        squareSize,
        squareSize
      );

      if (isFocused || isSelected || hovered) {
        context.strokeStyle = isSelected
          ? GameTheme.colors.accentLight
          : GameTheme.colors.textPrimary;
        context.lineWidth = isSelected ? 2.5 : 1.5;
        context.strokeRect(
          markerX - squareSize / 2 - 3,
          markerY - squareSize / 2 - 3,
          squareSize + 6,
          squareSize + 6
        );
      }

      context.fillStyle = isFocused || isSelected || hovered
        ? GameTheme.colors.accentLight
        : GameTheme.colors.textPrimary;
      context.font = `600 ${fontSize}px sans-serif`;
      context.textAlign = "center";
      context.fillText(libramClass.name, labelX, labelY);

      hitAreas.push(hitArea);
    });

    context.fillStyle = GameTheme.colors.textSecondary;
    context.font = "18px sans-serif";
    context.textAlign = "center";
    context.fillText("Use left or right or click to select a class.", this.width / 2, this.height - 24);

    return hitAreas;
  }
};
