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
      const progress = Math.min(this.elapsed / this.fadeInDuration, 1);
      this.splashProgress = progress * progress * (3 - 2 * progress);
      this.logoAlpha = this.splashProgress;
      if (progress === 1) {
        this.phase = "intro-hold";
        this.elapsed = 0;
      }
      return;
    }

    if (this.phase === "transition-out") {
      this.updateFade(deltaTime, 1, this.fadeDuration, "transition-in");
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
    const easedProgress = progress * progress * (3 - 2 * progress);

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
      context.fillStyle = GameTheme.colors.pageBackground;
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
    context.fillStyle = GameTheme.colors.pageBackground;
    context.fillRect(0, 0, this.width, this.height);
    if (this.showLogo) {
      this.drawShrimpLogo(context, this.width / 2, this.height / 2);
    }
    context.restore();
  }

  drawShrimpLogo(context, centerX, centerY) {
    context.save();
    const scale = Math.min(1, this.width / 900, this.height / 560);
    context.translate(centerX, centerY);
    context.scale(scale, scale);
    context.lineCap = "round";
    context.lineJoin = "round";

    const outline = GameTheme.colors.hat;
    const shell = GameTheme.colors.shrimpTail;
    const highlight = GameTheme.colors.accentLight;

    context.strokeStyle = GameTheme.colors.accentDark;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(0, 0, 214, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = shell;
    context.strokeStyle = outline;
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(-76, 28);
    context.bezierCurveTo(-139, -39, -196, -77, -234, -26);
    context.bezierCurveTo(-273, 27, -247, 113, -205, 130);
    context.bezierCurveTo(-167, 146, -146, 110, -163, 77);
    context.bezierCurveTo(-177, 51, -199, 70, -187, 91);
    context.bezierCurveTo(-178, 107, -163, 103, -157, 92);
    context.bezierCurveTo(-146, 143, -189, 166, -224, 146);
    context.bezierCurveTo(-279, 115, -293, 30, -262, -33);
    context.bezierCurveTo(-225, -108, -146, -107, -83, -43);
    context.closePath();
    context.fill();
    context.stroke();

    context.strokeStyle = highlight;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(-257, -34);
    context.bezierCurveTo(-224, -91, -166, -93, -111, -49);
    context.stroke();

    context.strokeStyle = outline;
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(77, -92);
    context.bezierCurveTo(105, -146, 133, -130, 150, -82);
    context.bezierCurveTo(162, -49, 183, -44, 187, -67);
    context.stroke();

    context.fillStyle = GameTheme.colors.menuBackgroundStart;
    context.strokeStyle = outline;
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(-33, 30);
    context.quadraticCurveTo(30, 15, 99, 35);
    context.lineTo(140, 114);
    context.quadraticCurveTo(102, 153, 38, 137);
    context.lineTo(-70, 101);
    context.closePath();
    context.fill();
    context.stroke();

    context.fillStyle = GameTheme.colors.accent;
    context.beginPath();
    context.moveTo(22, 25);
    context.lineTo(47, 47);
    context.lineTo(73, 25);
    context.lineTo(62, 83);
    context.lineTo(39, 101);
    context.lineTo(17, 81);
    context.closePath();
    context.fill();
    context.stroke();

    context.fillStyle = GameTheme.colors.accentLight;
    context.beginPath();
    context.moveTo(20, 24);
    context.lineTo(47, 46);
    context.lineTo(73, 24);
    context.lineTo(61, 15);
    context.lineTo(47, 31);
    context.lineTo(31, 15);
    context.closePath();
    context.fill();

    context.strokeStyle = outline;
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(-83, 42);
    context.quadraticCurveTo(-122, 50, -116, 92);
    context.quadraticCurveTo(-110, 119, -73, 124);
    context.moveTo(-67, 82);
    context.quadraticCurveTo(-30, 95, -5, 123);
    context.moveTo(100, 84);
    context.quadraticCurveTo(147, 80, 164, 102);
    context.stroke();

    context.fillStyle = shell;
    context.strokeStyle = outline;
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(-91, -40);
    context.bezierCurveTo(-112, -89, -75, -143, -14, -151);
    context.bezierCurveTo(50, -160, 119, -121, 145, -69);
    context.bezierCurveTo(164, -31, 143, 9, 106, 27);
    context.bezierCurveTo(61, 49, -6, 35, -51, 17);
    context.bezierCurveTo(-81, 5, -98, -13, -91, -40);
    context.closePath();
    context.fill();
    context.stroke();

    context.strokeStyle = highlight;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(-75, -55);
    context.bezierCurveTo(-55, -111, 19, -137, 72, -112);
    context.stroke();

    context.fillStyle = GameTheme.colors.canvasBackground;
    context.strokeStyle = outline;
    context.lineWidth = 6;
    context.beginPath();
    context.ellipse(-6, -67, 22, 25, -0.2, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = highlight;
    context.beginPath();
    context.ellipse(-11, -75, 9, 11, -0.2, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = GameTheme.colors.canvasBackground;
    context.beginPath();
    context.ellipse(112, -57, 14, 18, -0.2, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.strokeStyle = outline;
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(35, -6);
    context.lineTo(56, 12);
    context.lineTo(77, -8);
    context.stroke();

    context.fillStyle = GameTheme.colors.hat;
    context.strokeStyle = outline;
    context.lineWidth = 7;
    context.beginPath();
    context.ellipse(-12, -146, 55, 15, -0.16, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.beginPath();
    context.moveTo(-39, -153);
    context.lineTo(-28, -206);
    context.quadraticCurveTo(-24, -219, -11, -218);
    context.lineTo(22, -211);
    context.quadraticCurveTo(34, -208, 35, -195);
    context.lineTo(41, -151);
    context.closePath();
    context.fill();
    context.stroke();

    context.fillStyle = GameTheme.colors.hatBand;
    context.beginPath();
    context.moveTo(-34, -178);
    context.lineTo(31, -166);
    context.lineTo(34, -151);
    context.lineTo(-37, -153);
    context.closePath();
    context.fill();

    context.strokeStyle = highlight;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(-22, -204);
    context.lineTo(-28, -181);
    context.moveTo(-3, -202);
    context.lineTo(-7, -177);
    context.stroke();

    context.fillStyle = GameTheme.colors.accentLight;
    context.strokeStyle = outline;
    context.lineWidth = 6;
    context.beginPath();
    context.ellipse(-13, -213, 28, 11, 0.2, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.restore();
  }
};
