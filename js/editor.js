/**
 * CodeEditor: CodeMirror wrapper with Python highlight, indentation, line highlighting & shortcuts
 */

class CodeEditor {
  constructor({ textareaId, onRunShortcut }) {
    this.textarea = document.getElementById(textareaId);
    this.onRunShortcut = onRunShortcut || (() => {});
    this.highlightedLineHandle = null;
    this.initCM();
  }

  initCM() {
    if (!window.CodeMirror) {
      console.error("CodeMirror is not loaded.");
      return;
    }

    this.cm = CodeMirror.fromTextArea(this.textarea, {
      mode: "python",
      theme: "dracula",
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      lineWrapping: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      extraKeys: {
        Tab: (cm) => {
          if (cm.somethingSelected()) {
            cm.indentSelection("add");
          } else {
            cm.replaceSelection("    ", "end");
          }
        },
        "Shift-Tab": (cm) => {
          cm.indentSelection("subtract");
        },
        "Ctrl-Enter": () => {
          this.onRunShortcut();
        },
        "Cmd-Enter": () => {
          this.onRunShortcut();
        }
      }
    });

    this.cm.setSize("100%", "100%");
  }

  getValue() {
    return this.cm ? this.cm.getValue() : this.textarea.value;
  }

  setValue(code) {
    if (this.cm) {
      this.cm.setValue(code || "");
      this.clearHighlight();
    } else {
      this.textarea.value = code || "";
    }
  }

  setReadOnly(isReadOnly) {
    if (this.cm) {
      this.cm.setOption("readOnly", isReadOnly);
    }
  }

  highlightLine(lineNumber) {
    if (!this.cm) return;
    this.clearHighlight();

    if (!lineNumber || lineNumber < 1) return;
    const zeroBasedLine = lineNumber - 1;

    try {
      this.highlightedLineHandle = this.cm.addLineClass(
        zeroBasedLine,
        "background",
        "cm-active-trace-line"
      );
      // Auto scroll if line is out of viewport
      this.cm.scrollIntoView({ line: zeroBasedLine, ch: 0 }, 50);
    } catch (e) {
      console.warn("Failed to highlight line", lineNumber, e);
    }
  }

  clearHighlight() {
    if (!this.cm || !this.highlightedLineHandle) return;
    try {
      this.cm.removeLineClass(this.highlightedLineHandle, "background", "cm-active-trace-line");
    } catch (e) {}
    this.highlightedLineHandle = null;
  }

  refresh() {
    if (this.cm) {
      setTimeout(() => this.cm.refresh(), 50);
    }
  }
}

window.CodeEditor = CodeEditor;
