window.StoryIntro = class StoryIntro {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.paragraphsBySection = null;
    this.paragraphs = [];
    this.paragraphIndex = 0;
    this.phase = "idle";
    this.elapsed = 0;
    this.alpha = 0;
    this.fadeStartAlpha = 0;
    this.onComplete = null;
    this.fadeDuration = 0.8;
    this.minimumReadDuration = 3;
  }

  async load() {
    const response = await fetch("data/story/intro.json");
    if (!response.ok) {
      throw new Error(`Unable to load story text: ${response.status}`);
    }

    const paragraphsBySection = await response.json();
    if (
      !paragraphsBySection ||
      typeof paragraphsBySection !== "object" ||
      Array.isArray(paragraphsBySection)
    ) {
      throw new Error("Story text must be an object of paragraph arrays.");
    }

    for (const [section, paragraphs] of Object.entries(paragraphsBySection)) {
      if (
        !Array.isArray(paragraphs) ||
        paragraphs.length === 0 ||
        paragraphs.some(paragraph => typeof paragraph !== "string" || !paragraph.trim())
      ) {
        throw new Error(`Story section "${section}" must contain paragraphs.`);
      }
    }

    this.paragraphsBySection = paragraphsBySection;
  }

  start(section, onComplete) {
    if (!this.paragraphsBySection) {
      throw new Error("Story text must be loaded before starting the intro.");
    }

    const paragraphs = this.paragraphsBySection[section];
    if (!paragraphs) {
      throw new Error(`Story section "${section}" was not found.`);
    }

    this.paragraphs = paragraphs;
    this.paragraphIndex = 0;
    this.phase = "fade-in";
    this.elapsed = 0;
    this.alpha = 0;
    this.onComplete = onComplete;
  }

  advance() {
    if (
      this.phase !== "fade-in" &&
      this.phase !== "reading" &&
      this.phase !== "ready"
    ) {
      return false;
    }

    this.phase = "fade-out";
    this.elapsed = 0;
    this.fadeStartAlpha = this.alpha;
    return true;
  }

  update(deltaTime) {
    if (this.phase === "fade-in") {
      this.elapsed += deltaTime;
      this.alpha = this.getFadeProgress();
      if (this.elapsed >= this.fadeDuration) {
        this.phase = "reading";
        this.elapsed = 0;
        this.alpha = 1;
      }
      return;
    }

    if (this.phase === "reading") {
      this.elapsed += deltaTime;
      if (this.elapsed >= this.getMinimumReadDuration()) {
        this.phase = "ready";
      }
      return;
    }

    if (this.phase === "fade-out") {
      this.elapsed += deltaTime;
      this.alpha = this.fadeStartAlpha * (1 - this.getFadeProgress());
      if (this.elapsed >= this.fadeDuration) {
        this.paragraphIndex += 1;
        if (this.paragraphIndex >= this.paragraphs.length) {
          this.complete();
        } else {
          this.phase = "fade-in";
          this.elapsed = 0;
          this.alpha = 0;
        }
      }
    }
  }

  complete() {
    this.phase = "complete";
    this.elapsed = 0;
    this.alpha = 0;
    const onComplete = this.onComplete;
    this.onComplete = null;
    if (onComplete) {
      onComplete();
    }
  }

  getMinimumReadDuration() {
    const wordCount = this.paragraphs[this.paragraphIndex].trim().split(/\s+/).length;
    return Math.max(this.minimumReadDuration, wordCount * 0.3);
  }

  getFadeProgress() {
    const progress = Math.min(this.elapsed / this.fadeDuration, 1);
    return progress * progress * (3 - 2 * progress);
  }

  render(context) {
    if (this.alpha <= 0 || !this.paragraphs[this.paragraphIndex]) {
      return;
    }

    context.save();
    context.globalAlpha = this.alpha;
    context.fillStyle = GameTheme.colors.textPrimary;
    context.font = "32px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const maxWidth = Math.min(920, this.width - 120);
    const lines = this.wrapText(context, this.paragraphs[this.paragraphIndex], maxWidth);
    const lineHeight = 46;
    const firstLineY = this.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      context.fillText(line, this.width / 2, firstLineY + index * lineHeight);
    });

    context.fillStyle = GameTheme.colors.textSecondary;
    context.font = "18px sans-serif";
    context.fillText("Click or press any key to continue", this.width / 2, this.height - 24);

    context.restore();
  }

  wrapText(context, text, maxWidth) {
    const lines = [];
    let line = "";

    for (const word of text.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }

    if (line) {
      lines.push(line);
    }
    return lines;
  }
};
