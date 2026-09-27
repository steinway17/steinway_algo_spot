/**
 * DataFrameDiffVisualizer: Interactive Before/After table view & statistical diff
 */

class DataFrameDiffVisualizer {
  constructor(container) {
    this.container = typeof container === "string" ? document.getElementById(container) : container;
    this.currentBefore = null;
    this.currentAfter = null;
    this.currentViewMode = "diff"; // "before" | "after" | "diff"
  }

  render(beforeDf, afterDf, meta = {}) {
    this.currentBefore = beforeDf;
    this.currentAfter = afterDf;

    if (!beforeDf && !afterDf) {
      this.renderEmptyState();
      return;
    }

    // Default to "diff" if both exist, else the available one
    if (beforeDf && afterDf) {
      this.currentViewMode = this.currentViewMode || "diff";
    } else if (afterDf) {
      this.currentViewMode = "after";
    } else {
      this.currentViewMode = "before";
    }

    this.updateUI();
  }

  renderEmptyState() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500">
        <div class="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-sky-400 mb-3 shadow-inner">
          <i data-lucide="table" class="w-6 h-6"></i>
        </div>
        <h4 class="text-sm font-semibold text-slate-300 mb-1">데이터프레임 시각화 대기 중</h4>
        <p class="text-xs text-slate-400 max-w-sm leading-relaxed">
          코드를 실행하면 파이프라인 변환 전후의 DataFrame 형태, 결측치 대체, 이상치 클리핑 결과가 하이라이트 테이블로 시각화됩니다.
        </p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  updateUI() {
    if (!this.container) return;

    const before = this.currentBefore;
    const after = this.currentAfter;

    // Calculate diff stats
    let shapeDiffHtml = "";
    if (before && after) {
      const bShape = before.shape ? `(${before.shape.join(", ")})` : "";
      const aShape = after.shape ? `(${after.shape.join(", ")})` : "";
      shapeDiffHtml = `
        <span class="text-slate-400">Shape:</span>
        <span class="font-mono text-slate-300">${bShape}</span>
        <span class="text-sky-400">➜</span>
        <span class="font-mono text-emerald-400 font-bold">${aShape}</span>
      `;
    } else if (before) {
      shapeDiffHtml = `<span class="text-slate-400">Shape:</span> <span class="font-mono text-slate-300">(${before.shape.join(", ")})</span>`;
    } else if (after) {
      shapeDiffHtml = `<span class="text-slate-400">Shape:</span> <span class="font-mono text-emerald-400 font-bold">(${after.shape.join(", ")})</span>`;
    }

    // Missing value reduction summary
    let nullSummaryHtml = "";
    if (before && after && before.null_counts && after.null_counts) {
      const nullDiffs = [];
      const allCols = Array.from(new Set([...Object.keys(before.null_counts), ...Object.keys(after.null_counts)]));
      for (const col of allCols) {
        const bNull = before.null_counts[col] || 0;
        const aNull = after.null_counts[col] || 0;
        if (bNull !== aNull) {
          const delta = aNull - bNull;
          nullDiffs.push({ col, bNull, aNull, delta });
        }
      }

      if (nullDiffs.length > 0) {
        nullSummaryHtml = `
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-slate-400 text-[11px]">결측치 변화:</span>
            ${nullDiffs.map(d => `
              <span class="px-1.5 py-0.5 rounded text-[10px] font-mono ${d.delta < 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
                ${d.col}: ${d.bNull} ➜ ${d.aNull} (${d.delta > 0 ? '+' : ''}${d.delta})
              </span>
            `).join("")}
          </div>
        `;
      }
    }

    this.container.innerHTML = `
      <div class="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
        <!-- Top Toolbar -->
        <div class="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              <i data-lucide="split" class="w-4 h-4"></i>
            </span>
            <span class="text-xs font-semibold text-slate-200">DataFrame 전/후 비교</span>
          </div>

          <!-- Mode Switcher -->
          <div class="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            ${before ? `
              <button id="dfBtnBefore" class="px-2 py-0.5 rounded text-[11px] font-medium transition ${this.currentViewMode === 'before' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}">
                Before (입력)
              </button>
            ` : ''}
            ${after ? `
              <button id="dfBtnAfter" class="px-2 py-0.5 rounded text-[11px] font-medium transition ${this.currentViewMode === 'after' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}">
                After (결과)
              </button>
            ` : ''}
            ${before && after ? `
              <button id="dfBtnDiff" class="px-2 py-0.5 rounded text-[11px] font-medium transition ${this.currentViewMode === 'diff' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}">
                Diff 강조
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Meta Summary Bar -->
        <div class="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            ${shapeDiffHtml}
          </div>
          ${nullSummaryHtml}
        </div>

        <!-- Table Display Area -->
        <div class="flex-1 overflow-auto p-2" id="dfTableScrollArea">
          ${this.renderTableView()}
        </div>
      </div>
    `;

    // Bind events
    const btnBefore = this.container.querySelector("#dfBtnBefore");
    const btnAfter = this.container.querySelector("#dfBtnAfter");
    const btnDiff = this.container.querySelector("#dfBtnDiff");

    if (btnBefore) btnBefore.onclick = () => { this.currentViewMode = "before"; this.updateUI(); };
    if (btnAfter) btnAfter.onclick = () => { this.currentViewMode = "after"; this.updateUI(); };
    if (btnDiff) btnDiff.onclick = () => { this.currentViewMode = "diff"; this.updateUI(); };

    if (window.lucide) window.lucide.createIcons();
  }

  renderTableView() {
    const before = this.currentBefore;
    const after = this.currentAfter;
    const mode = this.currentViewMode;

    if (mode === "before" && before) {
      return this.generateTableHtml(before, "before");
    }
    if (mode === "after" && after) {
      return this.generateTableHtml(after, "after");
    }

    // "diff" mode: show after table with highlighted modifications relative to before
    if (after) {
      return this.generateTableHtml(after, "diff", before);
    }

    return `<div class="text-xs text-slate-500 p-4">표시할 데이터가 없습니다.</div>`;
  }

  generateTableHtml(dfObj, mode, referenceDf = null) {
    if (!dfObj || !dfObj.columns || !dfObj.data) {
      return `<div class="text-xs text-slate-500 p-4">데이터프레임 형식이 올바르지 않습니다.</div>`;
    }

    const { columns, index, data, dtypes, null_counts } = dfObj;
    const refData = referenceDf ? referenceDf.data : null;
    const refCols = referenceDf ? referenceDf.columns : null;

    let html = `
      <table class="w-full text-[11px] text-left border-collapse border border-slate-800 font-mono">
        <thead class="bg-slate-950/90 text-slate-300 sticky top-0 border-b border-slate-700/80 shadow-sm z-10">
          <tr>
            <th class="p-1.5 px-2.5 border-r border-slate-800 text-slate-500 font-normal">#</th>
            ${columns.map(col => {
              const dtype = dtypes && dtypes[col] ? dtypes[col] : "";
              const nullCount = null_counts && null_counts[col] ? null_counts[col] : 0;
              return `
                <th class="p-1.5 px-2.5 border-r border-slate-800 font-semibold whitespace-nowrap">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-slate-200">${col}</span>
                    <span class="text-[9px] font-normal text-slate-500">${dtype}</span>
                  </div>
                  ${nullCount > 0 ? `<div class="text-[9px] text-rose-400 font-normal">null: ${nullCount}</div>` : ''}
                </th>
              `;
            }).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 bg-slate-900/40">
    `;

    data.forEach((row, rowIdx) => {
      const rowId = index && index[rowIdx] !== undefined ? index[rowIdx] : rowIdx;
      html += `<tr class="hover:bg-slate-800/40 transition">`;
      html += `<td class="p-1.5 px-2 text-slate-500 border-r border-slate-800/80 text-[10px] select-none">${rowId}</td>`;

      row.forEach((val, colIdx) => {
        const colName = columns[colIdx];
        const isNull = val === null || val === undefined || val === "NaN" || val === "nan";

        let isModified = false;
        if (mode === "diff" && referenceDf && refData && refCols) {
          const refColIdx = refCols.indexOf(colName);
          if (refColIdx !== -1 && refData[rowIdx]) {
            const refVal = refData[rowIdx][refColIdx];
            const refNull = refVal === null || refVal === undefined || refVal === "NaN" || refVal === "nan";
            // Check if filled from null or value changed
            if (refNull && !isNull) {
              isModified = true;
            } else if (!refNull && !isNull && String(refVal) !== String(val)) {
              isModified = true;
            }
          } else if (refColIdx === -1) {
            // New column created by transformation!
            isModified = true;
          }
        }

        let cellClass = "p-1.5 px-2.5 border-r border-slate-800/60 whitespace-nowrap ";
        if (isModified) {
          cellClass += "bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-l-emerald-500 ";
        } else if (isNull) {
          cellClass += "text-rose-400/80 italic ";
        } else {
          cellClass += "text-slate-300 ";
        }

        let displayVal = val;
        if (isNull) {
          displayVal = `<span class="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">NaN</span>`;
        }

        html += `<td class="${cellClass}">${displayVal}</td>`;
      });

      html += `</tr>`;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }
}

window.DataFrameDiffVisualizer = DataFrameDiffVisualizer;
