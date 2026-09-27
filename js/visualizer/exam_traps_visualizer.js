/**
 * ExamTrapsVisualizer: Interactive Trap Quiz & Gotchas Explorer from Obsidian Vault
 */

class ExamTrapsVisualizer {
  constructor(container) {
    this.container = typeof container === "string" ? document.getElementById(container) : container;
    this.currentTraps = [];
    this.problemId = "";
    this.userAnswers = {}; // { trapIdx: { selected, isCorrect } }
  }

  render(traps = [], problemId = "") {
    this.currentTraps = traps || [];
    this.problemId = problemId;
    this.loadSavedAnswers();

    if (!this.container) return;

    if (!this.currentTraps || this.currentTraps.length === 0) {
      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500">
          <div class="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <i data-lucide="shield-alert" class="w-6 h-6"></i>
          </div>
          <h4 class="text-sm font-semibold text-slate-300 mb-1">실전 시험 함정 (Exam Traps)</h4>
          <p class="text-xs text-slate-400 max-w-sm leading-relaxed">
            현재 문제에 연결된 실전 함정 퀴즈가 없습니다.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    this.updateUI();
  }

  loadSavedAnswers() {
    try {
      const saved = localStorage.getItem(`exam_traps_${this.problemId}`);
      this.userAnswers = saved ? JSON.parse(saved) : {};
    } catch (e) {
      this.userAnswers = {};
    }
  }

  saveAnswers() {
    try {
      localStorage.setItem(`exam_traps_${this.problemId}`, JSON.stringify(this.userAnswers));
    } catch (e) {}
  }

  updateUI() {
    if (!this.container) return;

    const total = this.currentTraps.length;
    const correctCount = Object.values(this.userAnswers).filter((a) => a.isCorrect).length;

    const trapCardsHtml = this.currentTraps.map((trap, idx) => this.renderTrapCard(trap, idx)).join("");

    this.container.innerHTML = `
      <div class="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
        <!-- Top Toolbar -->
        <div class="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500/20 text-amber-400 text-xs font-bold">
              <i data-lucide="alert-triangle" class="w-4 h-4"></i>
            </span>
            <span class="text-xs font-semibold text-slate-200">실전 시험 함정 뽀개기 (Exam Traps)</span>
          </div>

          <!-- Progress Badge -->
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-mono px-2 py-0.5 rounded-full ${
              correctCount === total
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }">
              정답: ${correctCount} / ${total}
            </span>
          </div>
        </div>

        <!-- Traps Scrollable List -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3.5" id="trapsListArea">
          ${trapCardsHtml}
        </div>
      </div>
    `;

    // Bind event handlers
    this.currentTraps.forEach((trap, idx) => {
      const cardEl = this.container.querySelector(`[data-trap-card="${idx}"]`);
      if (!cardEl) return;

      const buttons = cardEl.querySelectorAll(".trap-opt-btn");
      buttons.forEach((btn) => {
        btn.onclick = () => {
          const selected = btn.getAttribute("data-val");
          const isCorrect = selected === String(trap.answer);
          this.userAnswers[idx] = { selected, isCorrect };
          this.saveAnswers();
          this.updateUI();
        };
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  renderTrapCard(trap, idx) {
    const record = this.userAnswers[idx];
    const isAnswered = Boolean(record);
    const isCorrect = record ? record.isCorrect : false;

    let borderClass = "border-slate-800";
    if (isAnswered) {
      borderClass = isCorrect ? "border-emerald-500/50 bg-emerald-950/10" : "border-rose-500/50 bg-rose-950/10";
    }

    const typeBadgeClass =
      trap.type === "ox"
        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
        : "bg-sky-500/20 text-sky-300 border border-sky-500/30";

    const badgeText = trap.type === "ox" ? "O/X 퀴즈" : "객관식 함정";

    let statusHeaderHtml = "";
    if (isAnswered) {
      const icon = isCorrect ? "check-circle-2" : "x-circle";
      const textColor = isCorrect ? "text-emerald-400" : "text-rose-400";
      const statusText = isCorrect ? "함정 회피 성공!" : "함정에 걸림!";
      statusHeaderHtml = `
        <span class="flex items-center gap-1 text-[11px] font-semibold ${textColor}">
          <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
          <span>${statusText}</span>
        </span>
      `;
    }

    const optionsHtml = this.renderOptionsHtml(trap, record, isCorrect);
    const explanationHtml = isAnswered ? this.renderExplanationHtml(trap) : "";

    return `
      <div data-trap-card="${idx}" class="p-3.5 rounded-xl border ${borderClass} bg-slate-900/80 flex flex-col gap-2.5 transition">
        <!-- Question Header -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${typeBadgeClass}">
              ${badgeText}
            </span>
            <span class="text-xs font-bold text-slate-200">Trap #${idx + 1}</span>
          </div>
          ${statusHeaderHtml}
        </div>

        <!-- Question Body -->
        <p class="text-xs text-slate-300 leading-relaxed font-medium">
          ${trap.question}
        </p>

        <!-- Options Buttons -->
        <div class="flex items-center gap-2 pt-1">
          ${optionsHtml}
        </div>

        <!-- Explanation & Trap Point -->
        ${explanationHtml}
      </div>
    `;
  }

  renderOptionsHtml(trap, record, isCorrect) {
    if (trap.type === "ox") {
      const getBtnClass = (val) => {
        if (!record || record.selected !== val) {
          return "bg-slate-800 hover:bg-slate-700 text-slate-300";
        }
        return isCorrect ? "bg-emerald-600 text-white shadow-sm" : "bg-rose-600 text-white";
      };

      return `
        <button data-val="O" class="trap-opt-btn flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${getBtnClass('O')}">
          <span>O (그렇다)</span>
        </button>
        <button data-val="X" class="trap-opt-btn flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${getBtnClass('X')}">
          <span>X (아니다)</span>
        </button>
      `;
    }

    const options = trap.options || [];
    return options
      .map((opt, optIdx) => {
        const val = String(opt.value !== undefined ? opt.value : optIdx);
        let btnClass = "bg-slate-800 hover:bg-slate-700 text-slate-300";
        if (record && String(record.selected) === val) {
          btnClass = isCorrect ? "bg-emerald-600 text-white font-bold" : "bg-rose-600 text-white font-bold";
        }
        return `
          <button data-val="${val}" class="trap-opt-btn flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition text-left ${btnClass}">
            ${opt.text}
          </button>
        `;
      })
      .join("");
  }

  renderExplanationHtml(trap) {
    const codeSnippetHtml = trap.codeSnippet
      ? `
        <div class="mt-1">
          <span class="text-[10px] text-slate-500 font-mono">모범 패턴 코드:</span>
          <pre class="mt-0.5 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto"><code>${trap.codeSnippet}</code></pre>
        </div>
      `
      : "";

    return `
      <div class="mt-2 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
        <div class="flex items-start gap-1.5">
          <span class="text-amber-400 font-bold shrink-0">⚠️ 시험 감점 포인트:</span>
          <span class="text-slate-300 leading-relaxed">${trap.trapPoint || ""}</span>
        </div>
        <div class="flex items-start gap-1.5">
          <span class="text-sky-400 font-bold shrink-0">💡 핵심 해설:</span>
          <span class="text-slate-300 leading-relaxed">${trap.explanation || ""}</span>
        </div>
        ${codeSnippetHtml}
      </div>
    `;
  }
}

window.ExamTrapsVisualizer = ExamTrapsVisualizer;
