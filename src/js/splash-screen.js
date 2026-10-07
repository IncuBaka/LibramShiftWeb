window.SplashScreen = class SplashScreen {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.alpha = 1;
    this.phase = "black-hold";
    this.elapsed = 0;
    this.fadeStartAlpha = 0;
    this.fadeDuration = 0;
    this.onFadeComplete = null;
    this.showLogo = true;
    this.logoAlpha = 0;
    this.splashProgress = 0;
    this.blackHoldDuration = 0.75;
    this.fadeInDuration = 1.2;
    this.holdDuration = 1.5;
    this.fadeOutDuration = 2.5;

    this.handleKeyDown = event => {
      if (this.skip()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("keydown", this.handleKeyDown);
  }

  update(deltaTime) {
    if (this.phase === "black-hold") {
      this.elapsed += deltaTime;
      if (this.elapsed >= this.blackHoldDuration) {
        this.phase = "intro-in";
        this.elapsed = 0;
      }
      return;
    }

    if (this.phase === "intro-in") {
      this.elapsed += deltaTime;
      const progress = this.fadeInDuration <= 0 ? 1 : Math.min(this.elapsed / this.fadeInDuration, 1);
      this.splashProgress = window.Utils.easeInOutCubic(progress);
      this.logoAlpha = this.splashProgress;
      if (progress === 1) {
        this.phase = "intro-hold";
        this.elapsed = 0;
      }
      return;
    }

    if (this.phase === "transition-out") {
      this.updateFade(deltaTime, 1, this.fadeDuration, "transition-in");
      if (this.phase === "transition-in") {
        this.fadeStartAlpha = this.alpha;
      }
      return;
    }

    if (this.phase === "transition-in") {
      this.updateFade(deltaTime, 0, this.fadeDuration, "hidden");
      if (this.phase === "hidden") {
        this.showLogo = true;
      }
      return;
    }

    if (this.phase === "intro-hold") {
      this.elapsed += deltaTime;
      if (this.elapsed >= this.holdDuration) {
        this.fadeOut(this.fadeOutDuration);
      }
      return;
    }

    if (this.phase === "fade-in") {
      this.updateFade(deltaTime, 1, this.fadeDuration, "visible");
    } else if (this.phase === "fade-out") {
      this.updateFade(deltaTime, 0, this.fadeDuration, "hidden");
    }
  }

  updateFade(deltaTime, targetAlpha, duration, nextPhase) {
    this.elapsed += deltaTime;
    const progress = duration <= 0 ? 1 : Math.min(this.elapsed / duration, 1);
    const easedProgress = window.Utils.easeInOutCubic(progress);

    this.alpha =
      this.fadeStartAlpha +
      (targetAlpha - this.fadeStartAlpha) * easedProgress;

    if (progress === 1) {
      this.phase = nextPhase;
      this.elapsed = 0;
      if (this.onFadeComplete) {
        const onFadeComplete = this.onFadeComplete;
        this.onFadeComplete = null;
        onFadeComplete();
      }
    }
  }

  fadeIn(duration = 0.8, onComplete = null) {
    this.startFade(1, duration, onComplete);
  }

  fadeOut(duration = 0.8, onComplete = null) {
    this.startFade(0, duration, onComplete);
  }

  skip() {
    if (
      !["black-hold", "intro-in", "intro-hold", "fade-out"].includes(
        this.phase
      )
    ) {
      return false;
    }

    this.phase = "hidden";
    this.alpha = 0;
    this.elapsed = 0;
    this.onFadeComplete = null;
    this.showLogo = true;
    return true;
  }

  transitionTo(onMidpoint, duration = 0.25) {
    this.phase = "transition-out";
    this.elapsed = 0;
    this.fadeStartAlpha = this.alpha;
    this.fadeDuration = duration;
    this.onFadeComplete = onMidpoint;
    this.showLogo = false;
  }

  startFade(targetAlpha, duration, onComplete) {
    this.phase = targetAlpha ? "fade-in" : "fade-out";
    this.fadeStartAlpha = this.alpha;
    this.fadeDuration = duration;
    this.elapsed = 0;
    this.onFadeComplete = onComplete;
  }

  render(context) {
    if (this.phase === "black-hold") {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, this.width, this.height);
      return;
    }

    if (this.phase === "intro-in") {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, this.width, this.height);

      context.save();
      context.globalAlpha = this.splashProgress;
      context.fillStyle = "#000000";
      context.fillRect(0, 0, this.width, this.height);
      context.globalAlpha = this.logoAlpha;
      this.drawShrimpLogo(context, this.width / 2, this.height / 2);
      context.restore();
      return;
    }

    if (this.alpha <= 0) {
      return;
    }

    context.save();
    context.globalAlpha = this.alpha;
    context.fillStyle = "#000000";
    context.fillRect(0, 0, this.width, this.height);
    if (this.showLogo) {
      this.drawShrimpLogo(context, this.width / 2, this.height / 2);
    }
    context.restore();
  }

  drawShrimpLogo(context, centerX, centerY) {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";

    context.fillStyle = GameTheme.colors.shrimpTail;
    context.beginPath();
    context.moveTo(centerX - 90, centerY + 8);
    context.quadraticCurveTo(
      centerX - 142,
      centerY + 18,
      centerX - 126,
      centerY + 55
    );
    context.quadraticCurveTo(
      centerX - 105,
      centerY + 43,
      centerX - 80,
      centerY + 42
    );
    context.closePath();
    context.fill();

    context.strokeStyle = GameTheme.colors.accent;
    context.lineWidth = 48;
    context.beginPath();
    context.moveTo(centerX - 91, centerY + 4);
    context.bezierCurveTo(
      centerX - 70,
      centerY - 57,
      centerX + 14,
      centerY - 76,
      centerX + 67,
      centerY - 20
    );
    context.stroke();

    context.strokeStyle = GameTheme.colors.accentLight;
    context.lineWidth = 4;
    for (const segment of [-55, -20, 15, 48]) {
      context.beginPath();
      context.moveTo(centerX + segment - 8, centerY - 42);
      context.quadraticCurveTo(
        centerX + segment - 19,
        centerY - 4,
        centerX + segment - 3,
        centerY + 19
      );
      context.stroke();
    }

    context.strokeStyle = GameTheme.colors.accentDark;
    context.lineWidth = 6;
    for (const leg of [-42, -4, 34]) {
      context.beginPath();
      context.moveTo(centerX + leg, centerY + 12);
      context.lineTo(centerX + leg - 19, centerY + 47);
      context.stroke();
    }

    context.fillStyle = GameTheme.colors.accent;
    context.beginPath();
    context.ellipse(
      centerX + 78,
      centerY - 18,
      39,
      31,
      -0.2,
      0,
      Math.PI * 2
    );
    context.fill();

    context.strokeStyle = GameTheme.colors.accentLight;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(centerX + 97, centerY - 38);
    context.quadraticCurveTo(
      centerX + 130,
      centerY - 72,
      centerX + 154,
      centerY - 68
    );
    context.moveTo(centerX + 102, centerY - 34);
    context.quadraticCurveTo(
      centerX + 145,
      centerY - 47,
      centerX + 164,
      centerY - 41
    );
    context.stroke();

    context.fillStyle = GameTheme.colors.hat;
    context.beginPath();
    context.arc(centerX + 88, centerY - 25, 4, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = GameTheme.colors.menuBackgroundStart;
    context.beginPath();
    context.moveTo(centerX + 5, centerY - 53);
    context.lineTo(centerX + 101, centerY - 53);
    context.lineTo(centerX + 86, centerY - 44);
    context.lineTo(centerX + 19, centerY - 44);
    context.closePath();
    context.fill();

    context.fillStyle = GameTheme.colors.hat;
    context.beginPath();
    context.moveTo(centerX + 28, centerY - 121);
    context.lineTo(centerX + 78, centerY - 121);
    context.lineTo(centerX + 88, centerY - 53);
    context.lineTo(centerX + 18, centerY - 53);
    context.closePath();
    context.fill();

    context.fillStyle = GameTheme.colors.hatBand;
    context.fillRect(centerX + 21, centerY - 73, 64, 11);

    context.restore();
  }
};
