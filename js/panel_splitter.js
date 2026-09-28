/**
 * PanelSplitter: Manages draggable horizontal splitters between 3 workspace panels
 * (Problem, Editor, Visualizer) with localStorage persistence, min-width constraints,
 * and double-click reset.
 */

class PanelSplitter {
  constructor({
    containerId = "workspaceContainer",
    panelIds = ["panelProblem", "panelEditor", "panelVisualizer"],
    gutterIds = ["gutterProblemEditor", "gutterEditorVisualizer"],
    minWidths = [260, 280, 280],
    defaultPercentages = [30, 35, 35],
    storageKey = "algo_harness_panel_widths",
    onResize = () => {}
  } = {}) {
    this.container = document.getElementById(containerId);
    this.panels = panelIds.map((id) => document.getElementById(id));
    this.gutters = gutterIds.map((id) => document.getElementById(id));
    this.minWidths = minWidths;
    this.defaultPercentages = defaultPercentages;
    this.storageKey = storageKey;
    this.onResize = onResize;

    this.currentPercentages = this.loadSavedPercentages();
    this.activeDragIndex = null;
    this.startX = 0;
    this.startPercentages = [];
    this.isDragging = false;

    this.init();
  }

  loadSavedPercentages() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
          const sum = parsed.reduce((a, b) => a + b, 0);
          if (sum > 95 && sum < 105) {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return [...this.defaultPercentages];
  }

  savePercentages(percentages) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(percentages));
    } catch (e) {}
  }

  init() {
    if (!this.container || this.panels.some((p) => !p) || this.gutters.some((g) => !g)) {
      console.warn("PanelSplitter: Required DOM elements not found.");
      return;
    }

    this.applyPercentages(this.currentPercentages);

    // Bind pointer events on gutters
    this.gutters.forEach((gutter, index) => {
      gutter.addEventListener("pointerdown", (e) => this.onPointerDown(e, index));
      gutter.addEventListener("pointermove", (e) => this.onPointerMove(e));
      gutter.addEventListener("pointerup", (e) => this.onPointerUp(e));
      gutter.addEventListener("pointercancel", (e) => this.onPointerUp(e));

      // Double-click to reset to default layout
      gutter.addEventListener("dblclick", () => this.resetToDefault());
    });

    // Handle window resize event
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        this.applyPercentages(this.currentPercentages);
      } else {
        this.panels.forEach((p) => (p.style.flex = ""));
      }
    });
  }

  applyPercentages(percentages) {
    if (window.innerWidth < 1024) {
      // Mobile / Tablet: let vertical column layout take over
      this.panels.forEach((panel) => {
        panel.style.flex = "";
      });
      return;
    }

    this.panels.forEach((panel, i) => {
      const pct = Math.max(12, Math.min(76, percentages[i]));
      panel.style.flex = `${pct} ${pct} 0px`;
    });

    this.onResize();
  }

  onPointerDown(e, gutterIndex) {
    if (window.innerWidth < 1024) return;
    if (e.button !== 0) return; // Only primary mouse button or touch

    const gutter = this.gutters[gutterIndex];
    try {
      gutter.setPointerCapture(e.pointerId);
    } catch (err) {}

    this.isDragging = true;
    this.activeDragIndex = gutterIndex;
    this.startX = e.clientX;
    this.startPercentages = [...this.currentPercentages];

    this.container.classList.add("is-resizing");
    gutter.classList.add("is-dragging");
    document.body.classList.add("select-none-resizing");
  }

  onPointerMove(e) {
    if (!this.isDragging || this.activeDragIndex === null) return;
    if (window.innerWidth < 1024) return;

    const gutterIdx = this.activeDragIndex;
    const containerRect = this.container.getBoundingClientRect();
    const gutterTotalWidth = this.gutters.reduce((acc, g) => acc + (g.offsetWidth || 14), 0);
    const availableWidth = containerRect.width - gutterTotalWidth;

    if (availableWidth <= 150) return;

    const deltaX = e.clientX - this.startX;
    const deltaPct = (deltaX / availableWidth) * 100;

    let p0 = this.startPercentages[0];
    let p1 = this.startPercentages[1];
    let p2 = this.startPercentages[2];

    const minPct0 = (this.minWidths[0] / availableWidth) * 100;
    const minPct1 = (this.minWidths[1] / availableWidth) * 100;
    const minPct2 = (this.minWidths[2] / availableWidth) * 100;

    if (gutterIdx === 0) {
      // Gutter between Panel 0 (Problem) and Panel 1 (Editor)
      const pairTotal = p0 + p1;
      let newP0 = p0 + deltaPct;
      newP0 = Math.max(minPct0, Math.min(pairTotal - minPct1, newP0));
      let newP1 = pairTotal - newP0;
      this.currentPercentages = [newP0, newP1, p2];
    } else if (gutterIdx === 1) {
      // Gutter between Panel 1 (Editor) and Panel 2 (Visualizer)
      const pairTotal = p1 + p2;
      let newP1 = p1 + deltaPct;
      newP1 = Math.max(minPct1, Math.min(pairTotal - minPct2, newP1));
      let newP2 = pairTotal - newP1;
      this.currentPercentages = [p0, newP1, newP2];
    }

    this.applyPercentages(this.currentPercentages);
  }

  onPointerUp(e) {
    if (!this.isDragging) return;

    if (this.activeDragIndex !== null) {
      const gutter = this.gutters[this.activeDragIndex];
      try {
        gutter.releasePointerCapture(e.pointerId);
      } catch (err) {}
      gutter.classList.remove("is-dragging");
    }

    this.isDragging = false;
    this.activeDragIndex = null;
    this.container.classList.remove("is-resizing");
    document.body.classList.remove("select-none-resizing");

    this.savePercentages(this.currentPercentages);
    this.onResize();
  }

  resetToDefault() {
    this.currentPercentages = [...this.defaultPercentages];
    this.applyPercentages(this.currentPercentages);
    this.savePercentages(this.currentPercentages);
    this.onResize();
  }
}

window.PanelSplitter = PanelSplitter;
