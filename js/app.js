/**
 * App: Main Orchestrator for Algorithm Harness
 */

class AlgorithmHarnessApp {
  constructor() {
    this.masteryStore = new MasteryStore();
    this.currentProblem = null;
    this.currentMode = "observe"; // observe, fill, blank, speed
    this.currentScale = "small"; // small, medium, large
    this.speedTimer = null;
    this.speedRemainingSec = 180;

    this.initComponents();
    this.bindEvents();
    this.loadInitialProblem();
  }

  initComponents() {
    // 1. Judge Manager
    this.judgeManager = new JudgeManager("js/judge/judge_worker.js");
    this.statusBadge = document.getElementById("pyodideStatusBadge");

    this.judgeManager.onStatusChange((status, detail) => {
      if (!this.statusBadge) return;
      if (status === "ready") {
        this.statusBadge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        this.statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Pyodide Ready`;
      } else if (status === "loading") {
        this.statusBadge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20";
        this.statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-spin"></span> Wasm 엔진 로딩 중...`;
      } else {
        this.statusBadge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20";
        this.statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span> ${detail || "엔진 에러"}`;
      }
    });

    // 2. Code Editor
    this.editor = new CodeEditor({
      textareaId: "pythonCodeEditor",
      onRunShortcut: () => this.handleRunJudge()
    });

    // 3. Visualizer Hub
    this.visualizerHub = new VisualizerHub({
      containerId: "visualizerContainer",
      onFrameChange: (frame) => {
        if (frame && frame.line) {
          this.editor.highlightLine(frame.line);
        } else {
          this.editor.clearHighlight();
        }
      }
    });
  }

  bindEvents() {
    // Run & Submit Buttons
    document.getElementById("btnRun")?.addEventListener("click", () => this.handleRunJudge(false));
    document.getElementById("btnSubmit")?.addEventListener("click", () => this.handleRunJudge(true));
    document.getElementById("btnResetCode")?.addEventListener("click", () => this.resetCodeToTemplate());

    // Drill Mode Tabs
    const modeTabs = document.querySelectorAll(".drill-mode-tab");
    modeTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const targetMode = e.currentTarget.dataset.mode;
        this.switchMode(targetMode);
      });
    });

    // Input Scale Tabs
    document.querySelectorAll(".scale-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const scale = e.currentTarget.dataset.scale;
        this.switchScale(scale);
      });
    });

    // Curriculum Graph Drawer / Modal
    const graphModalToggle = document.getElementById("btnCurriculumGraph");
    const graphModal = document.getElementById("curriculumModal");
    const closeGraphModal = document.getElementById("btnCloseCurriculumModal");

    graphModalToggle?.addEventListener("click", () => {
      this.renderCurriculumGraph();
      graphModal?.classList.remove("hidden");
    });

    closeGraphModal?.addEventListener("click", () => {
      graphModal?.classList.add("hidden");
    });

    // Problem Select Dropdown
    document.getElementById("problemSelector")?.addEventListener("change", (e) => {
      const pId = e.target.value;
      if (pId === "06_bipartite_matching") {
        window.location.href = "bipartite_matching.html";
        return;
      }
      this.loadProblem(pId);
    });

    // Hint toggle in fill mode
    document.getElementById("btnToggleHint")?.addEventListener("click", () => {
      const hintBox = document.getElementById("fillHintsBox");
      hintBox?.classList.toggle("hidden");
    });
  }

  loadInitialProblem() {
    const defaultId = "01_two_pointers";
    this.loadProblem(defaultId);
  }

  loadProblem(problemId) {
    const problem = CurriculumGraph.getProblem(problemId);
    if (!problem) return;

    this.currentProblem = problem;
    this.stopSpeedTimer();

    // Populate problem details UI
    document.getElementById("problemTitle").textContent = problem.title;
    document.getElementById("problemCategory").textContent = problem.category;
    document.getElementById("problemDifficulty").textContent = problem.difficulty;
    document.getElementById("problemComplexity").textContent = problem.timeComplexity;
    document.getElementById("problemDescription").innerHTML = problem.description;

    // Selector sync
    const selector = document.getElementById("problemSelector");
    if (selector) selector.value = problemId;

    // Determine current mastery level of this problem
    const state = this.masteryStore.getProblemState(problemId);

    // Update Mode tabs lock state
    this.updateModeTabsLock(state);

    // Load problem in current mode
    this.switchMode(state.level === "observe" ? "observe" : state.level);
  }

  updateModeTabsLock(state) {
    const blankTab = document.querySelector(`.drill-mode-tab[data-mode="blank"]`);
    const speedTab = document.querySelector(`.drill-mode-tab[data-mode="speed"]`);

    if (blankTab) {
      if (state.blankPassed || state.level === "blank" || state.level === "speed" || state.level === "mastered") {
        blankTab.classList.remove("opacity-50", "pointer-events-none");
        blankTab.querySelector(".lock-icon")?.classList.add("hidden");
      } else {
        blankTab.classList.add("opacity-50", "pointer-events-none");
        blankTab.querySelector(".lock-icon")?.classList.remove("hidden");
      }
    }

    if (speedTab) {
      if (state.level === "speed" || state.level === "mastered") {
        speedTab.classList.remove("opacity-50", "pointer-events-none");
        speedTab.querySelector(".lock-icon")?.classList.add("hidden");
      } else {
        speedTab.classList.add("opacity-50", "pointer-events-none");
        speedTab.querySelector(".lock-icon")?.classList.remove("hidden");
      }
    }
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.stopSpeedTimer();

    // Update Tab UI active styles
    document.querySelectorAll(".drill-mode-tab").forEach((tab) => {
      if (tab.dataset.mode === mode) {
        tab.className = "drill-mode-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 text-white shadow-sm shadow-sky-500/20";
      } else {
        tab.className = "drill-mode-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition";
      }
    });

    const speedrunBar = document.getElementById("speedrunBar");
    const fillHintsSection = document.getElementById("fillHintsSection");

    // Mode-specific UI adjustments
    if (mode === "observe") {
      speedrunBar?.classList.add("hidden");
      fillHintsSection?.classList.add("hidden");
      this.editor.setValue(this.currentProblem.solutionTemplate);
      this.editor.setReadOnly(false);
      // Auto run first test case to show trace visualizer immediately
      this.handleRunJudge(false);
    } else if (mode === "fill") {
      speedrunBar?.classList.add("hidden");
      fillHintsSection?.classList.remove("hidden");
      this.renderFillHints();
      this.editor.setValue(this.currentProblem.blankTemplate);
      this.editor.setReadOnly(false);
    } else if (mode === "blank") {
      speedrunBar?.classList.add("hidden");
      fillHintsSection?.classList.add("hidden");
      // Clean slate with signature
      const signatureOnly = `def solution(${this.getFunctionArgs(this.currentProblem.solutionTemplate)}):\n    # 백지 상태에서 알고리즘을 처음부터 자력으로 구현해보세요!\n    pass\n`;
      this.editor.setValue(signatureOnly);
      this.editor.setReadOnly(false);
    } else if (mode === "speed") {
      speedrunBar?.classList.remove("hidden");
      fillHintsSection?.classList.add("hidden");
      const signatureOnly = `def solution(${this.getFunctionArgs(this.currentProblem.solutionTemplate)}):\n    # 3분 스피드런! 망설임 없이 즉각 작성하세요.\n    pass\n`;
      this.editor.setValue(signatureOnly);
      this.editor.setReadOnly(false);
      this.startSpeedTimer();
    }

    this.editor.refresh();
  }

  getFunctionArgs(code) {
    const match = code.match(/def\s+solution\s*\((.*?)\):/);
    return match ? match[1] : "nums, target";
  }

  renderFillHints() {
    const container = document.getElementById("fillHintsList");
    if (!container || !this.currentProblem.blankHints) return;

    container.innerHTML = this.currentProblem.blankHints
      .map(
        (hint) => `
        <li class="p-2 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono text-xs">
          ${hint}
        </li>
      `
      )
      .join("");
  }

  resetCodeToTemplate() {
    this.switchMode(this.currentMode);
  }

  startSpeedTimer() {
    this.speedRemainingSec = 180;
    this.updateSpeedTimerDisplay();

    this.speedTimer = setInterval(() => {
      this.speedRemainingSec--;
      this.updateSpeedTimerDisplay();

      if (this.speedRemainingSec <= 0) {
        this.stopSpeedTimer();
        alert("⏱️ 3분이 경과했습니다! 스피드런 실패. 다시 도전해보세요.");
      }
    }, 1000);
  }

  stopSpeedTimer() {
    if (this.speedTimer) {
      clearInterval(this.speedTimer);
      this.speedTimer = null;
    }
  }

  updateSpeedTimerDisplay() {
    const timerElem = document.getElementById("speedTimerText");
    if (!timerElem) return;
    const mins = Math.floor(this.speedRemainingSec / 60);
    const secs = this.speedRemainingSec % 60;
    timerElem.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (this.speedRemainingSec <= 30) {
      timerElem.className = "font-mono font-bold text-rose-400 animate-pulse";
    } else {
      timerElem.className = "font-mono font-bold text-amber-300";
    }
  }

  switchScale(scale) {
    this.currentScale = scale;
    document.querySelectorAll(".scale-btn").forEach((btn) => {
      if (btn.dataset.scale === scale) {
        btn.className = "scale-btn px-2 py-0.5 rounded font-bold bg-sky-500 text-white shadow-sm";
      } else {
        btn.className = "scale-btn px-2 py-0.5 rounded text-slate-400 hover:text-white transition";
      }
    });
    this.handleRunJudge(false);
  }

  async handleRunJudge(isSubmit = false) {
    const runBtn = document.getElementById("btnRun");
    const submitBtn = document.getElementById("btnSubmit");
    const outputContainer = document.getElementById("judgeOutputArea");

    if (!runBtn || !submitBtn || !outputContainer) return;

    const userCode = this.editor.getValue();
    
    let testCases = [];
    let recordTrace = false;

    if (isSubmit) {
      testCases = this.currentProblem.testCases;
      recordTrace = false; // Fast execution for entire submission including large TC
    } else {
      if (this.currentScale === "small") {
        testCases = [this.currentProblem.benchmarkScales?.small || this.currentProblem.testCases[0]];
        recordTrace = true; // Full visual trace on small scale
      } else if (this.currentScale === "medium") {
        testCases = [this.currentProblem.benchmarkScales?.medium || this.currentProblem.testCases[0]];
        recordTrace = false;
      } else if (this.currentScale === "large") {
        testCases = [this.currentProblem.benchmarkScales?.large || this.currentProblem.testCases[0]];
        recordTrace = false;
      }
    }

    // UI Loading state
    runBtn.disabled = true;
    submitBtn.disabled = true;
    outputContainer.innerHTML = `
      <div class="flex items-center justify-center gap-2 py-8 text-slate-400 text-xs">
        <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-sky-400"></i>
        <span>${isSubmit ? "전체 테스트 케이스 채점 중 (대규모 효율성 포함)..." : `파이썬 실행 중 (${this.currentScale.toUpperCase()} 스케일)...`}</span>
      </div>
    `;
    if (window.lucide) lucide.createIcons({ root: outputContainer });

    const startTime = performance.now();

    const response = await this.judgeManager.runJudge({
      userCode,
      entryPoint: "solution",
      testCases,
      recordTrace,
      timeoutMs: 3500
    });

    const elapsedTotalMs = Math.round(performance.now() - startTime);

    runBtn.disabled = false;
    submitBtn.disabled = false;

    if (!response.ok) {
      // Execution Error / TLE
      outputContainer.innerHTML = `
        <div class="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          <div class="flex items-center gap-2 font-bold mb-1">
            <i data-lucide="alert-circle" class="w-4 h-4 text-rose-400"></i>
            <span>${response.errorType === "TLE" ? "시간 초과 (Time Limit Exceeded)" : "런타임 에러 (Runtime Error)"}</span>
          </div>
          <pre class="font-mono text-[11px] whitespace-pre-wrap text-rose-200 mt-2 bg-black/30 p-2 rounded">${response.error}</pre>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ root: outputContainer });
      return;
    }

    const { payload } = { payload: response.data };

    if (!payload.success) {
      // Syntax / Compile error
      outputContainer.innerHTML = `
        <div class="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          <div class="flex items-center gap-2 font-bold mb-1">
            <i data-lucide="x-circle" class="w-4 h-4 text-rose-400"></i>
            <span>코드 오류 (${payload.error_type})</span>
          </div>
          <pre class="font-mono text-[11px] whitespace-pre-wrap text-rose-200 mt-2 bg-black/30 p-2 rounded">${payload.error}</pre>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ root: outputContainer });
      return;
    }

    // Load Trace into Visualizer
    if (payload.trace && payload.trace.length > 0) {
      this.visualizerHub.loadTrace(payload.trace, {
        visualizerType: this.currentProblem.visualizerType,
        defaultTarget: this.currentProblem.testCases[0]?.input[1]
      });
    }

    // Render Test Case Results
    const allPassed = payload.all_passed;
    const results = payload.results || [];

    // Special Benchmark Card for Medium/Large Scale Run
    if (!isSubmit && this.currentScale !== "small") {
      const scaleInfo = this.currentProblem.benchmarkScales?.[this.currentScale];
      const scaleName = scaleInfo?.name || this.currentScale.toUpperCase();
      const firstRes = results[0] || {};
      const isPass = firstRes.passed;

      outputContainer.innerHTML = `
        <div class="flex flex-col gap-2.5">
          <div class="p-3 rounded-xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 shadow-md">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <i data-lucide="zap" class="w-4 h-4 text-amber-400"></i>
                <span>대규모 성능 벤치마크 (${scaleName})</span>
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isPass ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}">
                ${isPass ? '성능 통과 (PASS)' : '오답 (FAIL)'}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-xs font-mono">
              <div class="p-2 rounded bg-black/40 border border-slate-800">
                <span class="text-slate-400 text-[10px] block">소요 시간:</span>
                <span class="text-base font-bold text-amber-300">${firstRes.elapsed_ms || elapsedTotalMs} ms</span>
              </div>
              <div class="p-2 rounded bg-black/40 border border-slate-800">
                <span class="text-slate-400 text-[10px] block">이론 복잡도:</span>
                <span class="text-base font-bold text-sky-300">${this.currentProblem.timeComplexity}</span>
              </div>
            </div>
            
            <p class="text-[11px] text-slate-300 mt-2 leading-relaxed">
              ${isPass ? `✨ 대규모 입력에서도 지연 없이 <strong>${this.currentProblem.timeComplexity}</strong> 시간복잡도로 초고속 처리되었습니다.` : '⚠️ 대규모 입력 처리 중 오답이 발생했습니다.'}
            </p>
          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ root: outputContainer });
      return;
    }

    const tcCardsHtml = results
      .map((r) => {
        const isPass = r.passed;
        const statusBadge = isPass
          ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PASS</span>`
          : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">FAIL</span>`;

        return `
          <div class="p-2.5 rounded-lg border ${isPass ? "border-slate-800 bg-slate-900/60" : "border-rose-900/50 bg-rose-950/20"} text-xs flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-300">테스트 #${r.index}</span>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono text-slate-500">${r.elapsed_ms}ms</span>
                ${statusBadge}
              </div>
            </div>
            ${
              !isPass
                ? `
              <div class="font-mono text-[11px] bg-black/40 p-2 rounded text-slate-300 flex flex-col gap-1 mt-1">
                ${r.error ? `<div class="text-rose-400">${r.error}</div>` : ""}
                <div><span class="text-slate-500">기댓값:</span> <span class="text-emerald-400 font-bold">${JSON.stringify(r.expected)}</span></div>
                <div><span class="text-slate-500">실제값:</span> <span class="text-rose-400 font-bold">${JSON.stringify(r.actual)}</span></div>
              </div>
            `
                : ""
            }
          </div>
        `;
      })
      .join("");

    outputContainer.innerHTML = `
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800">
          <div class="flex items-center gap-2">
            ${
              allPassed
                ? `<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
                   <span class="text-xs font-bold text-emerald-300">${isSubmit ? "정답입니다! (All Passed)" : "예제 테스트 통과"}</span>`
                : `<i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>
                   <span class="text-xs font-bold text-rose-300">오답이 발생했습니다</span>`
            }
          </div>
          <span class="text-xs font-mono text-slate-400">전체 소요: ${elapsedTotalMs}ms</span>
        </div>
        <div class="grid grid-cols-1 gap-2">
          ${tcCardsHtml}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons({ root: outputContainer });

    // Handle Mode Completion
    if (isSubmit && allPassed) {
      this.handlePassProgression();
    }
  }

  handlePassProgression() {
    const pId = this.currentProblem.id;
    let elapsedSec = null;
    if (this.currentMode === "speed") {
      elapsedSec = 180 - this.speedRemainingSec;
      this.stopSpeedTimer();
    }

    const updatedState = this.masteryStore.recordPass(pId, this.currentMode, elapsedSec);
    this.updateModeTabsLock(updatedState);

    // Fire Confetti!
    if (window.confetti) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Modal or Notification
    if (this.currentMode === "fill") {
      alert("🎉 축하합니다! 2단계 빈칸 훈련을 통과했습니다.\n다음 단계인 [3단계: 백지 자력 구현]이 해금되었습니다!");
      this.switchMode("blank");
    } else if (this.currentMode === "blank") {
      alert("🔥 대단합니다! 100% 백지 자력 구현에 성공했습니다.\n궁극의 [4단계: 3분 스피드런]에 도전해보세요!");
      this.switchMode("speed");
    } else if (this.currentMode === "speed") {
      alert(`👑 마스터 달성! 3분 스피드런을 ${elapsedSec}초 만에 돌파하셨습니다!\n해당 알고리즘을 완벽히 손에 익히셨습니다.`);
    }
  }

  renderCurriculumGraph() {
    const container = document.getElementById("curriculumNodesList");
    if (!container) return;

    const stats = this.masteryStore.getAllStats(CurriculumGraph.getAllProblems());
    document.getElementById("graphStatsText").textContent = `숙련 완료: ${stats.masteredCount} / ${stats.total}`;

    container.innerHTML = CurriculumGraph.nodes
      .map((node) => {
        if (node.isExternalLink) {
          return `
            <a href="${node.externalUrl}" class="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/40 hover:border-purple-400 transition group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                  <i data-lucide="${node.icon || "git-merge"}" class="w-4 h-4"></i>
                </div>
                <div>
                  <div class="text-xs font-bold text-purple-200 group-hover:text-purple-100">${node.title}</div>
                  <div class="text-[11px] text-slate-400">${node.category} · 심화 인터랙티브 시각화</div>
                </div>
              </div>
              <span class="text-xs text-purple-400 font-semibold flex items-center gap-1">
                열기 <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </span>
            </a>
          `;
        }

        const isUnlocked = CurriculumGraph.isUnlocked(node.id, this.masteryStore);
        const state = this.masteryStore.getProblemState(node.id);
        const isCurrent = this.currentProblem?.id === node.id;

        let badge = `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">대기</span>`;
        if (state.level === "mastered") {
          badge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">👑 마스터</span>`;
        } else if (state.level === "speed") {
          badge = `<span class="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/40">백지 통과</span>`;
        } else if (state.blankPassed) {
          badge = `<span class="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40">빈칸 완료</span>`;
        }

        return `
          <button 
            data-problem-id="${node.id}"
            class="graph-node-item w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
              isCurrent
                ? "bg-sky-950/40 border-sky-500/70"
                : isUnlocked
                ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                : "bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed"
            }"
            ${!isUnlocked ? "disabled" : ""}
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg ${isUnlocked ? "bg-sky-500/20 text-sky-400" : "bg-slate-800 text-slate-600"} flex items-center justify-center font-bold">
                <i data-lucide="${node.icon || "code"}" class="w-4 h-4"></i>
              </div>
              <div>
                <div class="text-xs font-bold ${isUnlocked ? "text-slate-200" : "text-slate-500"}">${node.title}</div>
                <div class="text-[11px] text-slate-400">${node.category} · 난이도 Lv.${node.difficulty}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              ${badge}
              ${!isUnlocked ? `<i data-lucide="lock" class="w-3.5 h-3.5 text-slate-600"></i>` : ""}
            </div>
          </button>
        `;
      })
      .join("");

    if (window.lucide) lucide.createIcons({ root: container });

    container.querySelectorAll(".graph-node-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const pId = e.currentTarget.dataset.problemId;
        this.loadProblem(pId);
        document.getElementById("curriculumModal")?.classList.add("hidden");
      });
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new AlgorithmHarnessApp();
});
