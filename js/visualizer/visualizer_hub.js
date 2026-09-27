/**
 * VisualizerHub: Coordinates timeline controls, code line sync, and canvas renderers
 */

class VisualizerHub {
  constructor({ containerId, onFrameChange }) {
    this.container = document.getElementById(containerId);
    this.onFrameChange = onFrameChange || (() => {});
    this.frames = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.playTimer = null;
    this.speedMs = 500; // default speed: 500ms per step

    this.arrayVisualizer = null;
    this.graphVisualizer = null;
    this.gridMazeVisualizer = null;
    this.recursionTreeVisualizer = null;

    this.initUI();
  }

  initUI() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
        <!-- Top Toolbar -->
        <div class="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded bg-sky-500/20 text-sky-400 text-xs font-bold">
              <i data-lucide="play-circle" class="w-4 h-4"></i>
            </span>
            <span class="text-xs font-semibold tracking-wider text-slate-200 uppercase">알고리즘 흐름 시각화 (Trace)</span>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-2">
            <span id="visStepBadge" class="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
              0 / 0
            </span>
            <div class="h-4 w-px bg-slate-800 mx-1"></div>
            <button id="visPrevBtn" class="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed" title="이전 단계 (←)">
              <i data-lucide="skip-back" class="w-4 h-4"></i>
            </button>
            <button id="visPlayBtn" class="p-1 rounded bg-sky-600 hover:bg-sky-500 text-white transition shadow-sm shadow-sky-600/30" title="재생/일시정지 (Space)">
              <i data-lucide="play" class="w-4 h-4" id="visPlayIcon"></i>
            </button>
            <button id="visNextBtn" class="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed" title="다음 단계 (→)">
              <i data-lucide="skip-forward" class="w-4 h-4"></i>
            </button>
            <div class="h-4 w-px bg-slate-800 mx-1"></div>
            <select id="visSpeedSelect" class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer">
              <option value="1000">0.5x</option>
              <option value="500" selected>1.0x</option>
              <option value="250">2.0x</option>
              <option value="100">4.0x</option>
            </select>
          </div>
        </div>

        <!-- Slider Bar -->
        <div class="px-4 py-1.5 bg-slate-950/40 border-b border-slate-800/50 flex items-center gap-3">
          <input type="range" id="visSlider" min="0" max="0" value="0" class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-30" disabled />
        </div>

        <!-- Main Visualizer Canvas Area -->
        <div class="relative flex-1 p-4 overflow-auto min-h-[220px] flex flex-col justify-center items-center" id="visCanvasContainer">
          <div id="visEmptyState" class="text-center text-slate-500 py-10">
            <i data-lucide="activity" class="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-1"></i>
            <p class="text-xs">코드를 실행하면 알고리즘의 동작 과정과<br/>자료구조 변화가 이곳에 시각화됩니다.</p>
          </div>
          <div id="visCanvasRenderArea" class="w-full h-full hidden flex flex-col items-center justify-center"></div>
        </div>

        <!-- Bottom Local Variables Watcher -->
        <div class="px-4 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-mono" id="visVarsBar">
          <span class="text-slate-500 text-[11px] uppercase tracking-wider font-semibold shrink-0">Variables:</span>
          <div id="visVarsContent" class="flex items-center gap-2 text-slate-300">
            <span class="text-slate-600">-</span>
          </div>
        </div>
      </div>
    `;

    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons({ root: this.container });
    }

    this.bindEvents();
  }

  bindEvents() {
    this.prevBtn = this.container.querySelector("#visPrevBtn");
    this.nextBtn = this.container.querySelector("#visNextBtn");
    this.playBtn = this.container.querySelector("#visPlayBtn");
    this.playIcon = this.container.querySelector("#visPlayIcon");
    this.slider = this.container.querySelector("#visSlider");
    this.speedSelect = this.container.querySelector("#visSpeedSelect");
    this.stepBadge = this.container.querySelector("#visStepBadge");
    this.emptyState = this.container.querySelector("#visEmptyState");
    this.renderArea = this.container.querySelector("#visCanvasRenderArea");
    this.varsContent = this.container.querySelector("#visVarsContent");

    this.prevBtn?.addEventListener("click", () => this.stepPrev());
    this.nextBtn?.addEventListener("click", () => this.stepNext());
    this.playBtn?.addEventListener("click", () => this.togglePlay());
    this.slider?.addEventListener("input", (e) => this.seekTo(parseInt(e.target.value, 10)));
    this.speedSelect?.addEventListener("change", (e) => {
      this.speedMs = parseInt(e.target.value, 10);
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });
  }

  loadTrace(traceFrames, problemMeta = {}) {
    this.pause();
    this.frames = traceFrames || [];
    this.problemMeta = problemMeta;

    if (!this.frames || this.frames.length === 0) {
      this.currentIndex = -1;
      this.slider.disabled = true;
      this.slider.max = 0;
      this.slider.value = 0;
      this.prevBtn.disabled = true;
      this.nextBtn.disabled = true;
      this.stepBadge.textContent = "0 / 0";
      this.emptyState.classList.remove("hidden");
      this.renderArea.classList.add("hidden");
      this.varsContent.innerHTML = `<span class="text-slate-600">-</span>`;
      return;
    }

    this.emptyState.classList.add("hidden");
    this.renderArea.classList.remove("hidden");
    this.slider.disabled = false;
    this.slider.min = 0;
    this.slider.max = this.frames.length - 1;
    this.prevBtn.disabled = false;
    this.nextBtn.disabled = false;

    // Go to first frame
    this.seekTo(0);
  }

  seekTo(index) {
    if (index < 0 || index >= this.frames.length) return;
    this.currentIndex = index;
    this.slider.value = index;
    this.stepBadge.textContent = `${index + 1} / ${this.frames.length}`;

    const frame = this.frames[index];
    this.updateVariablesView(frame.locals);
    this.renderVisualCanvas(frame);
    this.onFrameChange(frame);
  }

  stepNext() {
    if (this.currentIndex < this.frames.length - 1) {
      this.seekTo(this.currentIndex + 1);
    } else {
      this.pause();
    }
  }

  stepPrev() {
    if (this.currentIndex > 0) {
      this.seekTo(this.currentIndex - 1);
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentIndex >= this.frames.length - 1) {
        this.seekTo(0);
      }
      this.play();
    }
  }

  play() {
    if (this.frames.length <= 1) return;
    this.isPlaying = true;
    this.updatePlayBtnIcon();

    this.playTimer = setInterval(() => {
      if (this.currentIndex < this.frames.length - 1) {
        this.stepNext();
      } else {
        this.pause();
      }
    }, this.speedMs);
  }

  pause() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    this.updatePlayBtnIcon();
  }

  updatePlayBtnIcon() {
    if (!this.playBtn) return;
    if (this.isPlaying) {
      this.playBtn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i>`;
    } else {
      this.playBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i>`;
    }
    if (window.lucide) lucide.createIcons({ root: this.playBtn });
  }

  updateVariablesView(locals = {}) {
    if (!this.varsContent) return;
    const entries = Object.entries(locals);
    if (entries.length === 0) {
      this.varsContent.innerHTML = `<span class="text-slate-600">no local variables</span>`;
      return;
    }

    const html = entries
      .map(([k, v]) => {
        let valStr = typeof v === "object" ? JSON.stringify(v) : String(v);
        if (valStr.length > 25) valStr = valStr.substring(0, 22) + "...";
        return `
          <span class="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80">
            <span class="text-sky-400 font-semibold mr-1">${k}:</span>
            <span class="text-amber-300 font-bold">${valStr}</span>
          </span>
        `;
      })
      .join("");

    this.varsContent.innerHTML = html;
  }

  renderVisualCanvas(frame) {
    if (!this.renderArea) return;
    const type = this.problemMeta?.visualizerType || "array";

    if (type === "array") {
      if (!this.arrayVisualizer) {
        this.arrayVisualizer = new ArrayVisualizer(this.renderArea);
      }
      this.arrayVisualizer.render(frame, this.problemMeta);
    } else if (type === "grid_maze") {
      if (!this.gridMazeVisualizer) {
        this.gridMazeVisualizer = new GridMazeVisualizer(this.renderArea);
      }
      this.gridMazeVisualizer.render(frame, this.problemMeta);
    } else if (type === "recursion_tree") {
      if (!this.recursionTreeVisualizer) {
        this.recursionTreeVisualizer = new RecursionTreeVisualizer(this.renderArea);
      }
      this.recursionTreeVisualizer.render(frame, this.problemMeta);
    } else if (type === "stack" || type === "queue") {
      if (!this.graphVisualizer) {
        this.graphVisualizer = new GraphVisualizer(this.renderArea);
      }
      this.graphVisualizer.render(frame, this.problemMeta);
    } else if (type === "bipartite_matching") {
      if (!this.bipartiteVisualizer) {
        this.bipartiteVisualizer = new BipartiteMatchingVisualizer(this.renderArea);
      }
      this.bipartiteVisualizer.render(frame, this.problemMeta);
    } else {
      // Default fallback to array
      if (!this.arrayVisualizer) {
        this.arrayVisualizer = new ArrayVisualizer(this.renderArea);
      }
      this.arrayVisualizer.render(frame, this.problemMeta);
    }
  }
}

window.VisualizerHub = VisualizerHub;
