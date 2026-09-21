/**
 * Высокопроизводительный полноэкранный ASCII-холст на HTML5 Canvas (2D Context).
 * Заполняет 100% ширины и 100% высоты экрана пиксель-в-пиксель без пустых полей и обрывов справа.
 */
class AsciiLandscapeEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.tick = 0;
    this.manualHour = null;
    this.fontSize = 12;
    this.charWidth = 7.2;
    this.charHeight = 12;

    this.cols = 120;
    this.rows = 40;

    this.birds = [
      { rx: 0.15, ry: 0.22, speed: 0.04 },
      { rx: 0.40, ry: 0.16, speed: 0.05 },
      { rx: 0.75, ry: 0.28, speed: 0.035 }
    ];

    this.resize = this.resize.bind(this);
    this.resize();
    window.addEventListener("resize", this.resize);
  }

resize() {
    if (!this.canvas || !this.ctx) return;
    // Ограничиваем DPR максимум двойкой, чтобы мобильные Retina-экраны не тормозили Canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth || document.documentElement.clientWidth;
    this.height = window.innerHeight || document.documentElement.clientHeight;

    this.canvas.width = Math.ceil(this.width * dpr);
    this.canvas.height = Math.ceil(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    // На экранах до 768px уменьшаем кегль глифов до 10px для сохранения плотности арта
    this.fontSize = this.width < 768 ? 10 : 12;
    this.ctx.font = `${this.fontSize}px "SF Mono", Consolas, "Courier New", monospace`;
    const measured = this.ctx.measureText("W").width;
    this.charWidth = (measured && measured > 3) ? measured : 6.4;
    this.charHeight = this.fontSize;

    this.cols = Math.ceil(this.width / this.charWidth) + 8;
    this.rows = Math.ceil(this.height / this.charHeight) + 2;
  }

  getCurrentHour() {
    if (this.manualHour !== null) {
      return this.manualHour;
    }
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }

  getCycleState(hour) {
    if (hour >= 6 && hour < 18) {
      return { phase: "day", theme: "day", label: "DAY (СВЕТЛАЯ)" };
    } else if (hour >= 18 && hour < 21) {
      return { phase: "sunset", theme: "day", label: "SUNSET (ЗАКАТ)" };
    } else {
      return { phase: "night", theme: "night", label: "NIGHT (ТЕМНАЯ)" };
    }
  }

  render() {
    if (!this.ctx) return;
    this.tick += 0.035;

    const hour = this.getCurrentHour();
    const cycle = this.getCycleState(hour);

    // Очистка холста
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Настройка шрифта
    this.ctx.font = `${this.fontSize}px "SF Mono", Consolas, "Courier New", monospace`;
    this.ctx.textBaseline = "top";

    // Цвет символов
    const isNight = document.body.getAttribute("data-theme") === "night";
    this.ctx.fillStyle = isNight ? "rgba(255, 106, 26, 0.30)" : "rgba(255, 85, 0, 0.24)";

    const horizon = Math.floor(this.rows * 0.62);
    const sunNormalizedX = (hour % 24) / 24;
    const celestialX = Math.floor(this.cols * (0.1 + sunNormalizedX * 0.8));
    const celestialY = Math.floor(horizon * 0.35 + Math.sin(sunNormalizedX * Math.PI) * (-horizon * 0.25));

    for (let y = 0; y < this.rows; y++) {
      let line = "";

      for (let x = 0; x < this.cols; x++) {
        const dx = (x - celestialX);
        const dy = (y - celestialY) * (this.charHeight / this.charWidth);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3.0) {
          line += cycle.phase === "night" ? "C" : "@";
          continue;
        } else if (dist < 4.8 && cycle.phase === "sunset") {
          line += "=";
          continue;
        }

        if (y < horizon) {
          let isBird = false;
          for (let b of this.birds) {
            const birdPixelX = Math.floor(((b.rx * this.cols) + this.tick * b.speed * this.cols) % (this.cols + 6)) - 3;
            const birdPixelY = Math.floor(b.ry * horizon);

            if (x === birdPixelX && y === birdPixelY) {
              line += Math.sin(this.tick * 5 + birdPixelX) > 0 ? "v" : "^";
              isBird = true;
              break;
            } else if (x === birdPixelX + 1 && y === birdPixelY) {
              line += ">";
              isBird = true;
              break;
            }
          }
          if (isBird) continue;

          if (cycle.phase === "night") {
            const starHash = (x * 43 + y * 89 + Math.floor(this.tick * 0.3)) % 113;
            if (starHash === 1) {
              line += "+";
              continue;
            } else if (starHash === 19) {
              line += ".";
              continue;
            } else if (starHash === 47) {
              line += "*";
              continue;
            }
          }

          line += " ";
        } else if (y === horizon) {
          line += "=";
        } else {
          const depthFactor = (y - horizon) / (this.rows - horizon);
          const waveFreq = 0.22;
          const waveSpeed = this.tick * 1.8;
          const wave = Math.sin(x * waveFreq + waveSpeed + y * 0.8);

          if (wave > 0.55) {
            line += depthFactor > 0.5 ? "~" : "-";
          } else if (wave > 0.15) {
            line += depthFactor > 0.7 ? "≈" : "~";
          } else if (wave < -0.65) {
            line += "≈";
          } else {
            line += " ";
          }
        }
      }

      this.ctx.fillText(line, 0, y * this.charHeight);
    }
  }

  start() {
    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
