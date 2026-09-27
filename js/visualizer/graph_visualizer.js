/**
 * GraphVisualizer: Renders Stack, Queue, and 2D Grids
 */

class GraphVisualizer {
  constructor(container) {
    this.container = container;
  }

  render(frame, meta = {}) {
    const locals = frame.locals || {};

    // 1. Check for stack
    let stack = null;
    let stackName = "";
    for (const key of ["stack", "stk", "s_stack"]) {
      if (Array.isArray(locals[key])) {
        stack = locals[key];
        stackName = key;
        break;
      }
    }

    // 2. Check for queue
    let queue = null;
    let queueName = "";
    for (const key of ["queue", "q", "dq", "deque"]) {
      if (Array.isArray(locals[key])) {
        queue = locals[key];
        queueName = key;
        break;
      }
    }

    // 3. Check for current character / element
    const currChar = locals.c ?? locals.ch ?? locals.char ?? locals.elem ?? locals.bracket;

    if (stack) {
      this.renderStack(stack, stackName, currChar);
      return;
    }

    if (queue) {
      this.renderQueue(queue, queueName);
      return;
    }

    // Fallback
    this.container.innerHTML = `
      <div class="text-slate-500 text-xs italic">
        스택이나 큐 변수를 추적 중입니다...
      </div>
    `;
  }

  renderStack(stack, name, currChar) {
    const items = [...stack].reverse(); // top at the top

    const stackItemsHtml = items
      .map((item, idx) => {
        const isTop = idx === 0;
        const borderClass = isTop ? "border-amber-400 bg-amber-950/40 text-amber-200" : "border-slate-700 bg-slate-800 text-slate-100";
        return `
          <div class="w-28 py-2 px-3 rounded-lg border ${borderClass} flex items-center justify-between font-mono font-bold text-sm shadow transition-all duration-200">
            <span>${item}</span>
            ${isTop ? `<span class="text-[10px] uppercase tracking-wider bg-amber-500 text-slate-950 px-1 rounded font-extrabold">TOP</span>` : ""}
          </div>
        `;
      })
      .join("");

    this.container.innerHTML = `
      <div class="flex flex-col sm:flex-row items-center justify-center gap-8 py-2 w-full">
        <!-- Current Token Processed -->
        ${
          currChar !== undefined
            ? `
          <div class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span class="text-[11px] text-slate-400 font-semibold uppercase">현재 검사 문자</span>
            <div class="w-12 h-12 rounded-lg bg-sky-950/80 border-2 border-sky-400 flex items-center justify-center text-xl font-mono font-bold text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              ${currChar}
            </div>
          </div>
        `
            : ""
        }

        <!-- Stack Container Tube -->
        <div class="flex flex-col items-center">
          <div class="text-xs font-mono text-slate-400 mb-2 flex items-center gap-2">
            <span>스택: <strong class="text-sky-400">${name}</strong></span>
            <span class="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400">크기: ${stack.length}</span>
          </div>

          <div class="min-w-[130px] min-h-[160px] max-h-[220px] p-2 bg-slate-950/50 border-x-2 border-b-2 border-slate-700 rounded-b-xl flex flex-col justify-end gap-1.5 overflow-y-auto">
            ${
              stack.length === 0
                ? `<div class="text-slate-600 text-xs italic py-10 text-center">비어 있음 (Empty)</div>`
                : stackItemsHtml
            }
          </div>
          <span class="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">STACK BOTTOM</span>
        </div>
      </div>
    `;
  }

  renderQueue(queue, name) {
    const queueItemsHtml = queue
      .map((item, idx) => {
        const isFront = idx === 0;
        const isRear = idx === queue.length - 1;
        return `
          <div class="relative flex flex-col items-center">
            <div class="w-12 h-12 rounded-lg border ${
              isFront ? "border-emerald-400 bg-emerald-950/60 text-emerald-200" : "border-slate-700 bg-slate-800 text-slate-200"
            } flex items-center justify-center font-mono font-bold text-sm shadow">
              ${typeof item === "object" ? JSON.stringify(item) : item}
            </div>
            <div class="text-[9px] font-mono mt-1 ${isFront ? "text-emerald-400 font-bold" : isRear ? "text-sky-400 font-bold" : "text-slate-500"}">
              ${isFront ? "FRONT" : isRear ? "REAR" : `#${idx}`}
            </div>
          </div>
        `;
      })
      .join("");

    this.container.innerHTML = `
      <div class="flex flex-col items-center w-full py-2">
        <div class="text-xs font-mono text-slate-400 mb-2 flex items-center gap-2">
          <span>큐: <strong class="text-sky-400">${name}</strong></span>
          <span class="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400">원소 수: ${queue.length}</span>
        </div>
        <div class="flex items-center gap-2 p-3 bg-slate-950/50 border-y-2 border-slate-700 rounded-xl overflow-x-auto max-w-full">
          <span class="text-[10px] text-emerald-400 font-mono font-bold mr-1">OUT ←</span>
          ${queue.length === 0 ? `<div class="text-slate-600 text-xs italic px-6">큐가 비어 있습니다</div>` : queueItemsHtml}
          <span class="text-[10px] text-sky-400 font-mono font-bold ml-1">← IN</span>
        </div>
      </div>
    `;
  }
}

window.GraphVisualizer = GraphVisualizer;
