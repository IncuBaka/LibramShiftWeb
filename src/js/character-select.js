window.CharacterSelect = class CharacterSelect {
  constructor(width, height, playerData, dataManager) {
    this.width = width;
    this.height = height;
    this.playerData = playerData;
    this.selectedIndex = -1;
    this.rotation = 0;
    this.targetRotation = 0;
    this.rotationStart = 0;
    this.rotationElapsed = 0;
    this.rotationDuration = 0;
    this.activeSelection = "libram";
    this.enemyNames = dataManager.enemies.map(enemy => enemy.name);
    this.selectedEnemyIndex = 0;
    this.enemyCarouselPosition = 0;
    this.enemyCarouselStart = 0;
    this.enemyCarouselTarget = 0;
    this.enemyCarouselElapsed = 0;
    this.enemyCarouselDuration = 0;
    this.classes = [
      { id: "daring-duelist", x: 84.38, y: 7.64 },
      { id: "larcenist", x: 157.26, y: 49.64 },
      { id: "mental-mage", x: 157.39, y: 132.46 },
      { id: "caster", x: 84.38, y: 175.65 },
      { id: "sinister-shaman", x: 11.39, y: 132.46 },
      { id: "brawler", x: 11.51, y: 49.64 }
    ].map(layout => ({ ...dataManager.get(layout.id), ...layout }));
    this.selectedIndex = this.classes.findIndex(
      libram => libram.id === playerData.player.libram?.id
    );
    if (this.selectedIndex < 0) {
      this.select(0);
    }

    const script = document.querySelector('script[src$="character-select.js"]');
    this.circleImage = new Image();
    this.circleImage.src = new URL("../assets/libramCircle.svg", script.src).href;
  }

  update(deltaTime) {
    if (this.rotation !== this.targetRotation) {
      this.rotationElapsed = Math.min(
        this.rotationElapsed + deltaTime,
        this.rotationDuration
      );
      const progress = this.rotationDuration === 0
        ? 1
        : this.rotationElapsed / this.rotationDuration;
      const easedProgress = window.Utils.easeInOutCubic(progress);
      this.rotation =
        this.rotationStart +
        (this.targetRotation - this.rotationStart) * easedProgress;

      if (progress === 1) {
        this.rotation = this.targetRotation;
      }
    }

    if (this.enemyCarouselPosition !== this.enemyCarouselTarget) {
      this.enemyCarouselElapsed = Math.min(
        this.enemyCarouselElapsed + deltaTime,
        this.enemyCarouselDuration
      );
      const progress = this.enemyCarouselDuration === 0
        ? 1
        : this.enemyCarouselElapsed / this.enemyCarouselDuration;
      const easedProgress = window.Utils.easeInOutCubic(progress);
      this.enemyCarouselPosition =
        this.enemyCarouselStart +
        (this.enemyCarouselTarget - this.enemyCarouselStart) * easedProgress;

      if (progress === 1) {
        this.enemyCarouselPosition = this.enemyCarouselTarget;
      }
    }
  }

  select(index) {
    const libramClass = this.classes[index];
    if (!libramClass) {
      return;
    }

    this.activeSelection = "libram";
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

  selectEnemy(index, direction = null) {
    if (!Number.isInteger(index) || index < 0 || index >= this.enemyNames.length) {
      return;
    }

    const count = this.enemyNames.length;
    let steps = (index - this.selectedEnemyIndex + count) % count;
    if (direction === -1 && steps > 0) {
      steps -= count;
    } else if (direction !== 1 && steps > count / 2) {
      steps -= count;
    }

    this.activeSelection = "enemy";
    if (steps === 0) {
      return;
    }

    this.selectedEnemyIndex = index;
    this.enemyCarouselStart = this.enemyCarouselPosition;
    this.enemyCarouselTarget += steps;
    this.enemyCarouselElapsed = 0;
    this.enemyCarouselDuration = Math.max(
      0.2,
      Math.abs(this.enemyCarouselTarget - this.enemyCarouselStart) * 0.16
    );
  }

  selectAdjacentEnemy(direction) {
    const nextIndex =
      (this.selectedEnemyIndex + direction + this.enemyNames.length) %
      this.enemyNames.length;
    this.activeSelection = "enemy";
    this.selectedEnemyIndex = nextIndex;
    this.enemyCarouselStart = this.enemyCarouselPosition;
    this.enemyCarouselTarget += direction;
    this.enemyCarouselElapsed = 0;
    this.enemyCarouselDuration = Math.max(
      0.2,
      Math.abs(this.enemyCarouselTarget - this.enemyCarouselStart) * 0.16
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

  drawPortraitPlaceholder(context, x, y, width, height) {
    context.fillStyle = GameTheme.colors.menuBackgroundStart;
    context.strokeStyle = GameTheme.colors.buttonBorder;
    context.lineWidth = 3;
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);

    const inset = Math.min(12, width * 0.08, height * 0.08);
    context.strokeStyle = GameTheme.colors.buttonBackgroundSecondary;
    context.lineWidth = 1;
    context.strokeRect(
      x + inset,
      y + inset,
      width - inset * 2,
      height - inset * 2
    );

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    context.strokeStyle = GameTheme.colors.buttonBorder;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(centerX, centerY - height * 0.1, Math.min(width, height) * 0.09, 0, Math.PI * 2);
    context.moveTo(centerX - width * 0.22, centerY + height * 0.16);
    context.lineTo(centerX - width * 0.08, centerY - height * 0.01);
    context.lineTo(centerX + width * 0.02, centerY + height * 0.09);
    context.lineTo(centerX + width * 0.11, centerY - height * 0.03);
    context.lineTo(centerX + width * 0.23, centerY + height * 0.16);
    context.stroke();
  }

  render(context, pointer, focusedIndex) {
    const scale = Math.min(1.65, (this.width * 0.75) / 169, (this.height * 0.62) / 184);
    const imageWidth = 169 * scale;
    const imageHeight = 184 * scale;
    const originX = (this.width - imageWidth) / 2;
    const visiblePortraitCount = this.enemyNames.length;
    const centerPortraitIndex = Math.floor(visiblePortraitCount / 2);
    const slotWidth = Math.min(110, this.width * 0.12);
    const slotHeight = 82;
    const slotGap = Math.min(14, this.width * 0.012);
    const rowWidth =
      visiblePortraitCount * slotWidth + (visiblePortraitCount - 1) * slotGap;
    const slotStartX = (this.width - rowWidth) / 2;
    const slotY = this.height - slotHeight - 18;
    const selectionCenterY = (36 + slotY) / 2;
    const originY = selectionCenterY - imageHeight / 2;
    const fontSize = 11 * scale;
    const hitAreas = [];

    const portraitWidth = Math.min(320, this.width * 0.25);
    const portraitHeight = Math.min(330, this.height * 0.46);
    const portraitY = selectionCenterY - portraitHeight / 2;
    const portraitMargin = Math.min(18, this.width * 0.02);
    this.drawPortraitPlaceholder(
      context,
      portraitMargin,
      portraitY,
      portraitWidth,
      portraitHeight
    );
    context.strokeStyle =
      this.activeSelection === "libram"
        ? GameTheme.colors.accentLight
        : GameTheme.colors.buttonBorder;
    context.lineWidth = this.activeSelection === "libram" ? 3 : 1;
    context.strokeRect(portraitMargin, portraitY, portraitWidth, portraitHeight);
    const libramPortrait = {
      type: "button",
      x: portraitMargin,
      y: portraitY,
      width: portraitWidth,
      height: portraitHeight,
      onActivate: () => {
        this.activeSelection = "libram";
      }
    };
    hitAreas.push(libramPortrait);

    const selectedLibramName =
      this.classes[this.selectedIndex]?.name ?? "Select a Libram";
    context.fillStyle = GameTheme.colors.textPrimary;
    context.font = "600 20px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      selectedLibramName,
      portraitMargin + portraitWidth / 2,
      portraitY + portraitHeight + 35
    );

    const enemyPortraitX = this.width - portraitMargin - portraitWidth;
    this.drawPortraitPlaceholder(
      context,
      enemyPortraitX,
      portraitY,
      portraitWidth,
      portraitHeight
    );
    context.strokeStyle =
      this.activeSelection === "enemy"
        ? GameTheme.colors.accentLight
        : GameTheme.colors.buttonBorder;
    context.lineWidth = this.activeSelection === "enemy" ? 3 : 1;
    context.strokeRect(enemyPortraitX, portraitY, portraitWidth, portraitHeight);
    const selectedEnemyName = this.enemyNames[this.selectedEnemyIndex];
    context.fillStyle = GameTheme.colors.textPrimary;
    context.font = "600 20px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      selectedEnemyName,
      enemyPortraitX + portraitWidth / 2,
      portraitY + portraitHeight + 35
    );
    hitAreas.push({
      type: "button",
      x: enemyPortraitX,
      y: portraitY,
      width: portraitWidth,
      height: portraitHeight,
      onActivate: () => {
        this.activeSelection = "enemy";
      }
    });

    const centerX = originX + 84.5 * scale;
    const centerY = selectionCenterY;
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
      const isFocused =
        this.activeSelection === "libram" && index === focusedIndex;
      const isSelected =
        this.activeSelection === "libram" && index === this.selectedIndex;
      context.font = `600 ${fontSize}px sans-serif`;
      const textWidth = context.measureText(libramClass.name).width + 28;
      const hitArea = {
        type: "button",
        selectionIndex: index,
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

    for (let index = 0; index < this.enemyNames.length; index += 1) {
      let position =
        index -
        this.enemyCarouselPosition +
        centerPortraitIndex;
      while (position < -0.5) {
        position += this.enemyNames.length;
      }
      while (position > visiblePortraitCount - 0.5) {
        position -= this.enemyNames.length;
      }
      if (position < -0.5 || position > visiblePortraitCount - 0.5) {
        continue;
      }

      const x = slotStartX + position * (slotWidth + slotGap);
      const isSelected = index === this.selectedEnemyIndex;
      const portraitOpacity = Math.pow(
        0.5,
        Math.abs(position - centerPortraitIndex)
      );
      context.save();
      context.globalAlpha = portraitOpacity;
      this.drawPortraitPlaceholder(
        context,
        x,
        slotY,
        slotWidth,
        slotHeight
      );
      context.strokeStyle =
        isSelected && this.activeSelection === "enemy"
          ? GameTheme.colors.accentLight
          : GameTheme.colors.buttonBorder;
      context.lineWidth =
        isSelected && this.activeSelection === "enemy" ? 3 : 1;
      context.strokeRect(x, slotY, slotWidth, slotHeight);
      context.fillStyle =
        isSelected && this.activeSelection === "enemy"
          ? GameTheme.colors.textPrimary
          : GameTheme.colors.textSecondary;
      context.font = `${
        isSelected && this.activeSelection === "enemy" ? "600 " : ""
      }13px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.beginPath();
      context.rect(x, slotY, slotWidth, slotHeight);
      context.clip();
      context.fillText(this.enemyNames[index], x + slotWidth / 2, slotY + slotHeight / 2);
      context.restore();

      hitAreas.push({
        type: "button",
        x,
        y: slotY,
        width: slotWidth,
        height: slotHeight,
        onActivate: () => this.selectEnemy(index)
      });
    }

    return hitAreas;
  }
};
