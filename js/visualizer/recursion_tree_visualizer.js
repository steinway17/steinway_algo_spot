/**
 * RecursionTreeVisualizer: Visualizes DFS Backtracking & State Space Tree
 */

class RecursionTreeVisualizer {
  constructor(container) {
    this.container = container;
  }

  render(frame, meta = {}) {
    const locals = frame.locals || {};

    const current = locals.current || [];
    const visited = locals.visited || [];
    const result = locals.result || [];
    const currI = locals.i;
    const n = locals.n || (visited.length > 0 ? visited.length - 1 : 4);
    const m = locals.m || 2;

    // 1. Number Slots (1 to n)
    let slotsHtml = "";
    for (let num = 1; num <= n; num++) {
      const isVisited = visited[num] === true;
      const isCurrentLoop = currI === num;
      const isSelectedInCurrent = current.includes(num);

      let slotClass = "border-slate-700 bg-slate-800 text-slate-300";
      let statusLabel = "선택가능";

      if (isSelectedInCurrent) {
        slotClass = "border-emerald-400 bg-emerald-950/60 text-emerald-300 ring-2 ring-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.4)]";
        statusLabel = "수열 포함";
      } else if (isCurrentLoop) {
        slotClass = "border-amber-400 bg-amber-950/40 text-amber-200 ring-2 ring-amber-400 animate-pulse";
        statusLabel = "검사 중";
      } else if (isVisited) {
        slotClass = "border-slate-800 bg-slate-900/50 text-slate-600 line-through opacity-50";
        statusLabel = "방문완료";
      }

      slotsHtml += `
        <div class="flex flex-col items-center gap-1">
          <div class="w-11 h-11 rounded-xl border flex items-center justify-center font-mono font-bold text-base transition-all duration-200 ${slotClass}">
            ${num}
          </div>
          <span class="text-[9px] font-mono text-slate-500">${statusLabel}</span>
        </div>
      `;
    }

    // 2. Current Path Tree Chain (Root -> ... -> Current)
    const chainItems = [
      { depth: 0, label: "ROOT []", isRoot: true },
      ...current.map((val, idx) => ({ depth: idx + 1, label: `Depth ${idx + 1}: [${current.slice(0, idx + 1).join(", ")}]`, val }))
    ];

    const isGoalReached = current.length === m;

    const chainHtml = chainItems
      .map((item, idx) => {
        const isLeaf = idx === chainItems.length - 1;
        let nodeClass = "bg-slate-800 border-slate-700 text-slate-300";
        if (isLeaf) {
          nodeClass = isGoalReached
            ? "bg-amber-500 text-slate-950 font-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            : "bg-sky-500 text-white font-bold border-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.5)]";
        }

        return `
          <div class="flex items-center gap-2">
            <div class="px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200 ${nodeClass}">
              ${item.isRoot ? `루트 <span class="opacity-70">[]</span>` : `깊이 ${item.depth}: <strong>[${current.slice(0, item.depth).join(", ")}]</strong>`}
              ${isLeaf && isGoalReached ? `<span class="ml-1.5 px-1 py-0.2 rounded bg-slate-950 text-amber-300 text-[10px]">GOAL!</span>` : ""}
            </div>
            ${!isLeaf ? `<i data-lucide="arrow-right" class="w-4 h-4 text-slate-600 shrink-0"></i>` : ""}
          </div>
        `;
      })
      .join("");

    // 3. Collected Result Gallery
    const resultItemsHtml = result
      .map(
        (arr) => `
        <span class="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-amber-300 font-semibold shadow-sm">
          [${arr.join(", ")}]
        </span>
      `
      )
      .join("");

    this.container.innerHTML = `
      <div class="flex flex-col items-center gap-3.5 w-full py-1">
        
        <!-- Status Bar -->
        <div class="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <div class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">현재 탐색 깊이:</span>
            <strong class="text-sky-400 font-bold">${current.length} / ${m}</strong>
          </div>
          <div class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">완성된 수열 수:</span>
            <strong class="text-amber-400 font-bold">${result.length}개</strong>
          </div>
        </div>

        <!-- 1. Number Candidate Slots -->
        <div class="w-full flex flex-col items-center gap-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">사용 가능한 자연수 슬롯 (1 ~ ${n})</span>
          <div class="flex items-center justify-center gap-3 overflow-x-auto w-full p-1">
            ${slotsHtml}
          </div>
        </div>

        <!-- 2. Active Recursion Branch (Tree Chain) -->
        <div class="w-full flex flex-col items-center gap-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 shadow-inner">
          <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="git-branch" class="w-3 h-3 text-sky-400"></i>
            <span>현재 재귀 탐색 브랜치 (Call Path)</span>
          </span>
          <div class="flex items-center justify-center flex-wrap gap-2 py-1">
            ${chainHtml}
          </div>
        </div>

        <!-- 3. Collected Results Gallery -->
        <div class="w-full flex flex-col gap-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
          <div class="flex items-center justify-between text-[11px] text-slate-400">
            <span class="font-semibold text-slate-300">누적 수집된 정답 수열 (Result)</span>
            <span class="font-mono text-slate-500">총 ${result.length}개</span>
          </div>
          <div class="flex items-center gap-2 overflow-x-auto p-1 min-h-[36px]">
            ${result.length === 0 ? `<span class="text-slate-600 text-xs italic">아직 완성된 수열이 없습니다. 탐색이 진행되면 여기에 누적됩니다.</span>` : resultItemsHtml}
          </div>
        </div>

      </div>
    `;

    if (window.lucide) {
      lucide.createIcons({ root: this.container });
    }
  }
}

window.RecursionTreeVisualizer = RecursionTreeVisualizer;
