window.Utils = (() => {
  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function easeInOutCubic(value) {
    const progress = clamp(value, 0, 1);

    if (progress < 0.5) {
      return 4 * progress * progress * progress;
    }

    return 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }

  function getCanvasPoint(event, canvas, width, height) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (width / bounds.width),
      y: (event.clientY - bounds.top) * (height / bounds.height)
    };
  }

  function wrapText(context, text, maxWidth) {
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

  return {
    clamp,
    easeInOutCubic,
    getCanvasPoint,
    wrapText
  };
})();
