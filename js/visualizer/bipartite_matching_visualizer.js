/**
 * BipartiteMatchingVisualizer: Renders U/V Bipartite Network & DFS Augmenting Paths
 */

class BipartiteMatchingVisualizer {
  constructor(container) {
    this.container = typeof container === "string" ? document.getElementById(container) : container;
  }

  render(frame, meta = {}) {
    if (!this.container) return;

    const locals = frame.locals || {};
    const matched = locals.matched || [];
    const visited = locals.visited || [];
    const currentU = locals.u !== undefined ? locals.u : null;
    const currentV = locals.v !== undefined ? locals.v : null;
    const matchCount = locals.match_count !== undefined ? locals.match_count : 0;
    const n = locals.n || (Array.isArray(locals.edges) ? locals.edges.length : (matched.length || 4));
    const m = locals.m || matched.length || 4;
    const edges = locals.edges || [];

    // Count currently matched
    const currentMatchedCount = matched.filter(u => u !== -1 && u !== null).length;

    // Build SVG canvas or flex layout
    const uNodes = Array.from({ length: Math.min(n, 8) }, (_, i) => i);
    const vNodes = Array.from({ length: Math.min(m, 8) }, (_, j) => j);

    this.container.innerHTML = `
      <div class="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl p-3">
        <!-- Top Status Bar -->
        <div class="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800 mb-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-5 h-5 rounded bg-purple-500/20 text-purple-400 text-xs font-bold">
              <i data-lucide="git-merge" class="w-3.5 h-3.5"></i>
            </span>
            <span class="text-xs font-bold text-slate-200">이분 매칭 상태</span>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <span class="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
              현재 탐색: <strong class="text-sky-300">${currentU !== null ? `U${currentU}` : '-'}</strong> ➜ <strong class="text-amber-300">${currentV !== null ? `V${currentV}` : '-'}</strong>
            </span>
            <span class="px-2 py-0.5 rounded font-mono text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              매칭 성공: ${currentMatchedCount}개
            </span>
          </div>
        </div>

        <!-- Bipartite Network Layout -->
        <div class="flex-1 flex items-center justify-between px-4 py-2 relative">
          <!-- Left Column: U Set (Workers) -->
          <div class="flex flex-col gap-2 z-10">
            <div class="text-[10px] font-bold text-sky-400 mb-1 text-center uppercase tracking-wider">작업자 (U)</div>
            ${uNodes.map(u => {
              const isCurrent = (currentU === u);
              const isMatchedToAny = matched.includes(u);
              let nodeStyle = "bg-slate-800 border-slate-700 text-slate-300";
              if (isCurrent) {
                nodeStyle = "bg-sky-500 text-white font-bold ring-2 ring-sky-300 shadow-lg shadow-sky-500/50 scale-105";
              } else if (isMatchedToAny) {
                nodeStyle = "bg-purple-900/60 border-purple-500 text-purple-200 font-bold";
              }

              return `
                <div class="w-12 h-10 rounded-xl border flex items-center justify-center text-xs transition duration-200 ${nodeStyle}">
                  U${u}
                </div>
              `;
            }).join("")}
          </div>

          <!-- Middle: Matching Links Summary -->
          <div class="flex-1 flex flex-col items-center justify-center px-4 space-y-1.5 z-10">
            <div class="text-[10px] font-mono text-slate-500 mb-1">현재 배정 목록 (matched)</div>
            <div class="flex flex-col gap-1 w-full max-w-[180px]">
              ${vNodes.map(v => {
                const assignedU = matched[v];
                const isAssigned = (assignedU !== undefined && assignedU !== -1 && assignedU !== null);
                const isVisiting = (currentV === v);

                let badgeClass = "bg-slate-950/80 border-slate-800 text-slate-500";
                if (isVisiting) {
                  badgeClass = "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold animate-pulse";
                } else if (isAssigned) {
                  badgeClass = "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold";
                }

                return `
                  <div class="flex items-center justify-between px-2.5 py-1 rounded-lg border text-[11px] font-mono transition ${badgeClass}">
                    <span>V${v}</span>
                    <i data-lucide="arrow-left" class="w-3 h-3 text-slate-500"></i>
                    <span>${isAssigned ? `U${assignedU}` : '미배정'}</span>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Right Column: V Set (Tasks) -->
          <div class="flex flex-col gap-2 z-10">
            <div class="text-[10px] font-bold text-purple-400 mb-1 text-center uppercase tracking-wider">일감 (V)</div>
            ${vNodes.map(v => {
              const assignedU = matched[v];
              const isAssigned = (assignedU !== undefined && assignedU !== -1 && assignedU !== null);
              const isCurrent = (currentV === v);
              const isVisited = visited[v];

              let nodeStyle = "bg-slate-800 border-slate-700 text-slate-300";
              if (isCurrent) {
                nodeStyle = "bg-amber-500 text-white font-bold ring-2 ring-amber-300 shadow-lg shadow-amber-500/50 scale-105";
              } else if (isAssigned) {
                nodeStyle = "bg-emerald-900/60 border-emerald-500 text-emerald-200 font-bold";
              }

              return `
                <div class="w-12 h-10 rounded-xl border flex flex-col items-center justify-center text-xs relative transition duration-200 ${nodeStyle}">
                  <span>V${v}</span>
                  ${isVisited ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-900" title="visited=True"></span>` : ''}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
}

window.BipartiteMatchingVisualizer = BipartiteMatchingVisualizer;
