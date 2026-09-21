/**
 * Менеджер тем (СВЕТЛАЯ / ТЕМНАЯ / АВТО), живых часов и пасхалки на BigBoss (5 кликов)
 */
class PortfolioThemeManager {
  constructor(asciiEngine) {
    this.asciiEngine = asciiEngine;
    this.currentMode = localStorage.getItem("portfolio_theme_mode") || "auto"; // auto | light | dark

    this.clockEl = document.getElementById("userLiveClock");
    this.devPanel = document.getElementById("devPanel");
    this.mascotEl = document.getElementById("mascotContainer");
    this.closeDevBtn = document.getElementById("closeDevPanelBtn");

    this.slider = document.getElementById("timeSlider");
    this.timeDisplay = document.getElementById("timeDisplay");
    this.themeLabel = document.getElementById("themeLabel");

    this.mascotClicks = 0;
    this.mascotTimer = null;

    this.initClock();
    this.initButtons();
    this.initEasterEgg();
    this.applyMode(this.currentMode);
  }

  initClock() {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      if (this.clockEl) {
        this.clockEl.textContent = `${h}:${m}:${s}`;
      }

      if (this.currentMode === "auto" && this.asciiEngine.manualHour === null) {
        const hour = now.getHours() + now.getMinutes() / 60;
        const cycle = this.asciiEngine.getCycleState(hour);
        document.body.setAttribute("data-theme", cycle.theme);
      }
    };
    update();
    setInterval(update, 1000);
  }

  initButtons() {
    const buttons = document.querySelectorAll(".btn-theme-toggle");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.themeMode;
        this.applyMode(mode);
      });
    });

    if (this.closeDevBtn && this.devPanel) {
      this.closeDevBtn.addEventListener("click", () => {
        this.devPanel.classList.add("easter-egg-hidden");
      });
    }

    if (this.slider) {
      this.slider.addEventListener("input", (e) => {
        this.asciiEngine.manualHour = parseFloat(e.target.value);
        this.updateDevLabels();
      });
    }
  }

  applyMode(mode) {
    this.currentMode = mode;
    localStorage.setItem("portfolio_theme_mode", mode);

    document.querySelectorAll(".btn-theme-toggle").forEach(b => {
      b.classList.toggle("active", b.dataset.themeMode === mode);
    });

    if (mode === "light") {
      this.asciiEngine.manualHour = 12; // Солнечный полдень
      document.body.setAttribute("data-theme", "day");
    } else if (mode === "dark") {
      this.asciiEngine.manualHour = 23; // Звездная ночь
      document.body.setAttribute("data-theme", "night");
    } else {
      // АВТО
      this.asciiEngine.manualHour = null;
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;
      const cycle = this.asciiEngine.getCycleState(h);
      document.body.setAttribute("data-theme", cycle.theme);
    }

    this.updateDevLabels();
  }

  updateDevLabels() {
    if (!this.timeDisplay || !this.slider) return;
    const h = this.asciiEngine.getCurrentHour();
    const hours = Math.floor(h);
    const mins = Math.floor((h - hours) * 60);
    this.timeDisplay.textContent = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    this.slider.value = h;
    const cycle = this.asciiEngine.getCycleState(h);
    if (this.themeLabel) {
      this.themeLabel.textContent = cycle.label;
    }
  }

  initEasterEgg() {
    if (!this.mascotEl || !this.devPanel) return;

    this.mascotEl.addEventListener("click", () => {
      this.mascotClicks += 1;
      clearTimeout(this.mascotTimer);

      this.mascotTimer = setTimeout(() => {
        this.mascotClicks = 0;
      }, 1500);

      if (this.mascotClicks >= 5) {
        this.mascotClicks = 0;
        this.devPanel.classList.toggle("easter-egg-hidden");
        this.updateDevLabels();
      }
    });
  }
}
