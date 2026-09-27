/**
 * GridMazeVisualizer: 2D Grid Maze Visualizer for BFS Pathfinding
 */

class GridMazeVisualizer {
  constructor(container) {
    this.container = container;
  }

  render(frame, meta = {}) {
    const locals = frame.locals || {};

    // 1. Locate grid data
    let grid = locals.grid || locals.maze || locals.board;
    if (!grid && meta.defaultGrid) {
      grid = meta.defaultGrid;
    }
    if (!grid && window.app?.currentProblem?.testCases?.[0]?.input?.[0]) {
      grid = window.app.currentProblem.testCases[0].input[0];
    }

    if (!grid || !Array.isArray(grid) || grid.length === 0) {
      this.container.innerHTML = `
        <div class="text-slate-500 text-xs italic">
          미로 격자(grid) 데이터를 찾는 중입니다...
        </div>
      `;
      return;
    }

    const n = grid.length;
    const m = grid[0].length;

    // 2. Locate visited 2D array
    const visited = locals.visited || [];

    // 3. Locate active positions
    const currR = locals.r;
    const currC = locals.c;
    const currDist = locals.dist;
    const nextR = locals.nr;
    const nextC = locals.nc;

    // 4. Locate queue items
    const queue = locals.queue || locals.q || [];
    const queueCoords = new Set();
    if (Array.isArray(queue)) {
      queue.forEach((item) => {
        if (Array.isArray(item) && item.length >= 2) {
          queueCoords.add(`${item[0]},${item[1]}`);
        }
      });
    }

    // 5. Render Grid Cells
    let rowsHtml = "";
    for (let r = 0; r < n; r++) {
      let cellsHtml = "";
      for (let c = 0; c < m; c++) {
        const isWall = grid[r][c] === 1;
        const isStart = r === 0 && c === 0;
        const isEnd = r === n - 1 && c === m - 1;
        const isVisited = visited[r]?.[c] === true;
        const isCurrent = r === currR && c === currC;
        const isNextCandidate = r === nextR && c === nextC;
        const isInQueue = queueCoords.has(`${r},${c}`);

        let cellClass = "bg-slate-900 border-slate-800 text-slate-400";
        let innerContent = "";

        if (isWall) {
          cellClass = "bg-slate-800/90 border-slate-700 text-slate-600 pattern-wall";
          innerContent = `<i data-lucide="shield" class="w-3.5 h-3.5 opacity-40"></i>`;
        } else if (isCurrent) {
          cellClass = "bg-sky-500 text-white font-extrabold ring-4 ring-sky-400/60 shadow-[0_0_20px_rgba(14,165,233,0.9)] scale-110 z-10";
          innerContent = `<i data-lucide="map-pin" class="w-4 h-4 animate-bounce"></i>`;
        } else if (isNextCandidate) {
          cellClass = "bg-amber-500/40 border-amber-400 text-amber-200 ring-2 ring-amber-400 animate-pulse";
          innerContent = `<i data-lucide="crosshair" class="w-3.5 h-3.5"></i>`;
        } else if (isInQueue) {
          cellClass = "bg-indigo-950/60 border-indigo-400/80 text-indigo-300 ring-1 ring-indigo-400/50";
          innerContent = `<span class="text-[9px] font-mono font-bold">WAIT</span>`;
        } else if (isVisited) {
          cellClass = "bg-sky-950/60 border-sky-700/60 text-sky-300";
          innerContent = `<i data-lucide="check" class="w-3 h-3 text-sky-400"></i>`;
        }

        // Badges for Start & End
        let badgeHtml = "";
        if (isStart) {
          badgeHtml = `<span class="absolute -top-1.5 -left-1.5 px-1 py-0.2 rounded bg-emerald-500 text-[8px] font-black text-slate-950">S</span>`;
        } else if (isEnd) {
          badgeHtml = `<span class="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded bg-rose-500 text-[8px] font-black text-white">E</span>`;
        }

        const cellSizeClass = m > 10 ? "w-6 h-6 text-[8px]" : m > 5 ? "w-8 h-8 sm:w-9 sm:h-9" : "w-10 h-10 sm:w-11 sm:h-11";

        cellsHtml += `
          <div class="relative ${cellSizeClass} rounded-lg border flex items-center justify-center transition-all duration-200 ${cellClass}">
            ${badgeHtml}
            ${innerContent}
          </div>
        `;
      }
      rowsHtml += `<div class="flex items-center gap-1">${cellsHtml}</div>`;
    }

    this.container.innerHTML = `
      <div class="flex flex-col items-center gap-3 w-full py-1">
        <!-- Status Bar -->
        <div class="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <div class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">현재 좌표:</span>
            <strong class="text-sky-400 font-bold">${currR !== undefined && currC !== undefined ? `(${currR}, ${currC})` : "-"}</strong>
          </div>
          <div class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">누적 거리:</span>
            <strong class="text-amber-400 font-bold">${currDist !== undefined ? currDist : 1}</strong>
          </div>
          <div class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">큐 대기열:</span>
            <strong class="text-indigo-400 font-bold">${queue.length}개</strong>
          </div>
        </div>

        <!-- 2D Grid Maze -->
        <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-xl shadow-inner flex flex-col items-center gap-1.5 overflow-auto max-w-full">
          ${rowsHtml}
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-sky-500"></span>현재 위치</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-amber-500/50 border border-amber-400"></span>탐색 후보</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-indigo-950 border border-indigo-400"></span>큐 대기</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-sky-950 border border-sky-700"></span>방문 완료</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>벽</span>
        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons({ root: this.container });
    }
  }
}

window.GridMazeVisualizer = GridMazeVisualizer;
