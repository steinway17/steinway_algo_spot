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

        <!-- Top Variables Watcher (Multi-line Inspector above canvas) -->
        <div class="px-4 py-2 bg-slate-950/75 border-b border-slate-800 flex flex-col gap-1.5 transition-all duration-200" id="visVarsBar">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-4 h-4 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                <i data-lucide="variable" class="w-3 h-3"></i>
              </span>
              <span class="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Variables (실시간 변수 상태)</span>
              <span id="visVarsCountBadge" class="hidden px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">0</span>
            </div>
            
            <button id="btnToggleVarsCollapse" class="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition" title="변수 영역 펼치기/접기">
              <span id="varsCollapseLabel">접기</span>
              <i data-lucide="chevron-up" class="w-3 h-3" id="varsCollapseIcon"></i>
            </button>
          </div>

          <!-- Multi-line wrap container for variables -->
          <div id="visVarsContent" class="flex flex-wrap items-center gap-1.5 text-xs font-mono max-h-36 overflow-y-auto pr-1">
            <span class="text-slate-600 text-xs italic">코드를 실행하면 변수 상태가 표시됩니다.</span>
          </div>
        </div>

        <!-- Main Visualizer Canvas Area -->
        <div class="relative flex-1 p-4 overflow-auto min-h-[200px] flex flex-col justify-center items-center" id="visCanvasContainer">
          <div id="visEmptyState" class="text-center text-slate-500 py-10">
            <i data-lucide="activity" class="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-1"></i>
            <p class="text-xs">코드를 실행하면 알고리즘의 동작 과정과<br/>자료구조 변화가 이곳에 시각화됩니다.</p>
          </div>
          <div id="visCanvasRenderArea" class="w-full h-full hidden flex flex-col items-center justify-center"></div>
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
    this.btnToggleVars = this.container.querySelector("#btnToggleVarsCollapse");
    this.varsCollapseLabel = this.container.querySelector("#varsCollapseLabel");
    this.varsCollapseIcon = this.container.querySelector("#varsCollapseIcon");
    this.isVarsCollapsed = false;

    this.btnToggleVars?.addEventListener("click", () => {
      this.isVarsCollapsed = !this.isVarsCollapsed;
      if (this.isVarsCollapsed) {
        this.varsContent.classList.add("hidden");
        this.varsCollapseLabel.textContent = "펼치기";
        this.varsCollapseIcon?.setAttribute("data-lucide", "chevron-down");
      } else {
        this.varsContent.classList.remove("hidden");
        this.varsCollapseLabel.textContent = "접기";
        this.varsCollapseIcon?.setAttribute("data-lucide", "chevron-up");
      }
      if (window.lucide) lucide.createIcons({ root: this.btnToggleVars });
    });

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
      this.varsContent.innerHTML = `<span class="text-slate-600 text-xs italic">코드를 실행하면 변수 상태가 표시됩니다.</span>`;
      const countBadge = this.container.querySelector("#visVarsCountBadge");
      if (countBadge) countBadge.classList.add("hidden");
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
    const prevFrame = this.currentIndex >= 0 && this.currentIndex !== index ? this.frames[this.currentIndex] : null;
    this.currentIndex = index;
    this.slider.value = index;
    this.stepBadge.textContent = `${index + 1} / ${this.frames.length}`;

    const frame = this.frames[index];
    this.updateVariablesView(frame.locals, prevFrame ? prevFrame.locals : null);
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

  updateVariablesView(locals = {}, prevLocals = null) {
    if (!this.varsContent) return;
    const countBadge = this.container.querySelector("#visVarsCountBadge");

    if (!locals || typeof locals !== "object") {
      this.varsContent.innerHTML = `<span class="text-slate-600 text-xs italic">로컬 변수 없음</span>`;
      if (countBadge) countBadge.classList.add("hidden");
      return;
    }

    const entries = Object.entries(locals);
    if (entries.length === 0) {
      this.varsContent.innerHTML = `<span class="text-slate-600 text-xs italic">로컬 변수 없음</span>`;
      if (countBadge) countBadge.classList.add("hidden");
      return;
    }

    if (countBadge) {
      countBadge.textContent = `${entries.length}개`;
      countBadge.classList.remove("hidden");
    }

    const html = entries
      .map(([k, v]) => {
        let rawStr = typeof v === "object" ? JSON.stringify(v) : String(v);
        let displayStr = rawStr;
        if (displayStr.length > 36) {
          displayStr = displayStr.substring(0, 33) + "...";
        }

        // Detect if value changed compared to previous frame
        let hasChanged = false;
        if (prevLocals && prevLocals[k] !== undefined) {
          const prevStr = typeof prevLocals[k] === "object" ? JSON.stringify(prevLocals[k]) : String(prevLocals[k]);
          if (prevStr !== rawStr) {
            hasChanged = true;
          }
        }

        const cardClass = hasChanged
          ? "bg-emerald-950/60 border-emerald-500/60 shadow-sm shadow-emerald-500/10 text-emerald-200"
          : "bg-slate-900/90 border-slate-700/70 hover:border-slate-600 text-slate-200";

        const valClass = hasChanged ? "text-emerald-300 font-bold" : "text-amber-300 font-bold";
        const titleAttr = rawStr.replace(/"/g, "&quot;");

        return `
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono shadow-sm transition-all duration-150 ${cardClass}" title="${k} = ${titleAttr}">
            <span class="text-sky-300 font-semibold">${k}</span>
            <span class="text-slate-500 font-mono text-[11px]">=</span>
            <span class="${valClass} break-all">${displayStr}</span>
            ${hasChanged ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>` : ""}
          </div>
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
