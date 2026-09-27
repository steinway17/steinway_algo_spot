/**
 * ArrayVisualizer: Renders array bars/cards and pointer markers (left, right, mid, i, j)
 */

class ArrayVisualizer {
  constructor(container) {
    this.container = container;
  }

  render(frame, meta = {}) {
    const locals = frame.locals || {};

    // 1. Find array in locals or metadata
    let arr = null;
    let arrName = "";
    const candidateKeys = ["nums", "arr", "array", "data", "cards", "lst"];

    for (const key of candidateKeys) {
      if (Array.isArray(locals[key])) {
        arr = locals[key];
        arrName = key;
        break;
      }
    }

    if (!arr) {
      // Look for any list in locals
      for (const [k, v] of Object.entries(locals)) {
        if (Array.isArray(v)) {
          arr = v;
          arrName = k;
          break;
        }
      }
    }

    if (!arr || arr.length === 0) {
      this.container.innerHTML = `
        <div class="text-slate-500 text-xs italic">
          배열 변수가 로컬 스코프에 없거나 비어 있습니다.
        </div>
      `;
      return;
    }

    // 2. Identify pointers
    const pointers = {};
    const pointerKeys = ["left", "right", "mid", "start", "end", "i", "j", "low", "high", "k", "p"];

    for (const pKey of pointerKeys) {
      if (typeof locals[pKey] === "number") {
        pointers[pKey] = locals[pKey];
      }
    }

    const targetVal = locals.target ?? meta.defaultTarget;
    const hasSearchRange = ("left" in pointers || "low" in pointers) && ("right" in pointers || "high" in pointers);
    const rangeLeft = pointers.left ?? pointers.low ?? 0;
    const rangeRight = pointers.right ?? pointers.high ?? (arr.length - 1);

    // 3. Render Array Cards with Pointers
    const itemsHtml = arr
      .map((val, idx) => {
        // Collect pointers pointing to this idx
        const pointingHere = Object.entries(pointers).filter(([_, pIdx]) => pIdx === idx);

        const isInRange = !hasSearchRange || (idx >= rangeLeft && idx <= rangeRight);
        const isTargetMatch = targetVal !== undefined && val === targetVal;
        const isMid = pointers.mid === idx;

        let borderClass = isInRange ? "border-slate-700 bg-slate-800" : "border-slate-800 bg-slate-900/40 opacity-40";
        let textClass = isInRange ? "text-slate-100" : "text-slate-500";
        let glowClass = "";

        if (isMid) {
          borderClass = "border-amber-400 bg-amber-950/40 ring-2 ring-amber-400/50";
          textClass = "text-amber-200 font-extrabold";
        }

        if (isTargetMatch && (isMid || pointingHere.length > 0)) {
          borderClass = "border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-400";
          textClass = "text-emerald-300 font-extrabold";
          glowClass = "shadow-[0_0_15px_rgba(52,211,153,0.5)]";
        }

        // Pointer markers badges
        const pointerBadges = pointingHere
          .map(([name]) => {
            let badgeBg = "bg-sky-500/80 text-white";
            if (name === "mid") badgeBg = "bg-amber-500 text-slate-950 font-black";
            if (name === "left" || name === "low") badgeBg = "bg-blue-600 text-white";
            if (name === "right" || name === "high") badgeBg = "bg-purple-600 text-white";
            if (name === "i") badgeBg = "bg-teal-500 text-white";
            if (name === "j") badgeBg = "bg-indigo-500 text-white";

            return `<span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight shadow ${badgeBg}">${name}</span>`;
          })
          .join(" ");

        const isSlim = arr.length > 14;
        const boxWidth = isSlim ? "w-10 h-12" : "w-12 h-14";
        const valTextSize = isSlim ? "text-xs" : "text-base";
        const minColWidth = isSlim ? "min-w-[40px]" : "min-w-[50px]";

        return `
          <div data-card-idx="${idx}" class="flex flex-col items-center gap-1.5 ${minColWidth} transition-all duration-200">
            <!-- Top Pointer Indicator -->
            <div class="h-6 flex items-end justify-center gap-1">
              ${pointerBadges}
            </div>

            <!-- Pointer Arrow Down -->
            <div class="h-2 flex items-center justify-center">
              ${
                pointingHere.length > 0
                  ? `<div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-sky-400"></div>`
                  : ""
              }
            </div>

            <!-- Value Box -->
            <div class="${boxWidth} rounded-lg flex flex-col items-center justify-center border ${borderClass} ${glowClass} shadow-md transition-all">
              <span class="${valTextSize} font-mono font-bold ${textClass}">${val}</span>
            </div>

            <!-- Index Label -->
            <span class="text-[10px] font-mono text-slate-500">#${idx}</span>
          </div>
        `;
      })
      .join("");

    this.container.innerHTML = `
      <div class="w-full flex flex-col items-center gap-2.5">
        <div class="flex items-center gap-3 text-xs text-slate-400 mb-0.5">
          <span class="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">배열: ${arrName} (${arr.length}개 원소)</span>
          ${targetVal !== undefined ? `<span class="font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded">찾는 값: ${targetVal}</span>` : ""}
        </div>
        <div class="array-scroll-box flex items-center justify-start gap-1.5 overflow-x-auto w-full p-2.5 py-3 bg-slate-950/40 rounded-xl border border-slate-800/40 scroll-smooth">
          ${itemsHtml}
        </div>
      </div>
    `;

    // Auto-scroll to active pointer
    if (pointers.mid !== undefined || pointers.left !== undefined || pointers.i !== undefined) {
      const activeIdx = pointers.mid ?? pointers.left ?? pointers.i;
      const activeCard = this.container.querySelector(`[data-card-idx="${activeIdx}"]`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }
}

window.ArrayVisualizer = ArrayVisualizer;
