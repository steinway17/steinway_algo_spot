/**
 * JudgeManager: Web Worker Lifecycle & Infinite-Loop Timeout Killer
 */

class JudgeManager {
  constructor(workerPath = "js/judge/judge_worker.js") {
    this.workerPath = workerPath;
    this.worker = null;
    this.isReady = false;
    this.isDSLoaded = false;
    this.dsLoadingPromise = null;
    this.statusListeners = [];
    this.currentExecution = null;
    this.initWorker();
  }

  onStatusChange(fn) {
    this.statusListeners.push(fn);
  }

  notifyStatus(status, detail = "") {
    this.statusListeners.forEach((fn) => fn(status, detail));
  }

  initWorker() {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch (e) {
        console.warn("Failed to terminate existing worker", e);
      }
    }

    this.isReady = false;
    this.isDSLoaded = false;
    this.dsLoadingPromise = null;
    this.notifyStatus("loading", "Pyodide WebAssembly 런타임 초기화 중...");

    this.worker = new Worker(this.workerPath);

    this.worker.onmessage = (e) => {
      const { id, type, payload, error } = e.data;

      if (type === "INIT_SUCCESS") {
        this.isReady = true;
        this.notifyStatus("ready", "Pyodide 런타임 준비 완료");
        return;
      }

      if (type === "INIT_ERROR") {
        this.isReady = false;
        this.notifyStatus("error", `초기화 실패: ${error}`);
        return;
      }

      if (this.currentExecution && this.currentExecution.id === id) {
        clearTimeout(this.currentExecution.timer);
        const { resolve } = this.currentExecution;
        this.currentExecution = null;

        if (type === "EXECUTE_SUCCESS" || type === "EXECUTE_DS_SUCCESS" || type === "LOAD_DS_PACKAGES_SUCCESS") {
          resolve({
            ok: true,
            data: payload
          });
        } else {
          resolve({
            ok: false,
            error: error || "실행 중 에러가 발생했습니다."
          });
        }
      }
    };

    this.worker.onerror = (err) => {
      console.error("Worker error:", err);
      if (this.currentExecution) {
        clearTimeout(this.currentExecution.timer);
        this.currentExecution.resolve({
          ok: false,
          error: `Worker 에러: ${err.message || String(err)}`
        });
        this.currentExecution = null;
      }
      this.notifyStatus("error", "워커 에러 발생");
    };
  }

  async runJudge({
    userCode,
    entryPoint = "solution",
    testCases = [],
    recordTrace = true,
    timeoutMs = 4000
  }) {
    if (!this.isReady) {
      return {
        ok: false,
        error: "Pyodide 런타임이 아직 로드 중입니다. 잠시만 기다려주세요."
      };
    }

    if (this.currentExecution) {
      return {
        ok: false,
        error: "이미 다른 코드가 실행 중입니다."
      };
    }

    const execId = "exec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

    return new Promise((resolve) => {
      // 3~4s Timeout Killer
      const timer = setTimeout(() => {
        if (this.currentExecution && this.currentExecution.id === execId) {
          console.warn(`Execution timed out (${timeoutMs}ms). Terminating worker...`);
          this.initWorker(); // Kill and restart worker
          this.currentExecution = null;
          resolve({
            ok: false,
            errorType: "TLE",
            error: `시간 초과 (Time Limit Exceeded - ${(timeoutMs / 1000).toFixed(1)}초): 무한 루프 또는 비효율적인 시간복잡도가 감지되었습니다.`
          });
        }
      }, timeoutMs);

      this.currentExecution = {
        id: execId,
        timer,
        resolve
      };

      this.worker.postMessage({
        id: execId,
        type: "EXECUTE",
        userCode,
        entryPoint,
        testCases,
        recordTrace
      });
    });
  }

  async loadDSPackages() {
    if (!this.isReady) {
      await new Promise((resolve) => {
        const check = () => {
          if (this.isReady) resolve();
          else setTimeout(check, 100);
        };
        check();
      });
    }

    if (this.isDSLoaded) return { ok: true };
    if (this.dsLoadingPromise) return this.dsLoadingPromise;

    this.notifyStatus("loading_ds", "데이터 사이언스 라이브러리(numpy, pandas, scikit-learn) 로딩 중...");

    const execId = "load_ds_" + Date.now();
    this.dsLoadingPromise = new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (this.currentExecution && this.currentExecution.id === execId) {
          this.currentExecution = null;
          this.dsLoadingPromise = null;
          resolve({
            ok: false,
            error: "데이터 사이언스 패키지 로딩 시간이 초과되었습니다 (네트워크 상태를 확인하세요)."
          });
        }
      }, 60000); // 60s for pyodide cdn downloads

      this.currentExecution = {
        id: execId,
        timer,
        resolve: (res) => {
          if (res.ok) {
            this.isDSLoaded = true;
            this.notifyStatus("ready_ds", "데이터 사이언스 패키지 로드 완료");
          } else {
            this.notifyStatus("error", `데이터 사이언스 패키지 로드 실패: ${res.error}`);
          }
          this.dsLoadingPromise = null;
          resolve(res);
        }
      };

      this.worker.postMessage({
        id: execId,
        type: "LOAD_DS_PACKAGES"
      });
    });

    return this.dsLoadingPromise;
  }

  async runDSJudge({
    userCode,
    problemId,
    validationCode,
    timeoutMs = 12000
  }) {
    if (!this.isReady) {
      return {
        ok: false,
        error: "Pyodide 런타임이 아직 로드 중입니다. 잠시만 기다려주세요."
      };
    }

    if (!this.isDSLoaded) {
      const loadRes = await this.loadDSPackages();
      if (!loadRes.ok) {
        return loadRes;
      }
    }

    if (this.currentExecution) {
      return {
        ok: false,
        error: "이미 다른 코드가 실행 중입니다."
      };
    }

    const execId = "exec_ds_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (this.currentExecution && this.currentExecution.id === execId) {
          console.warn(`DS Execution timed out (${timeoutMs}ms). Terminating worker...`);
          this.initWorker();
          this.currentExecution = null;
          resolve({
            ok: false,
            errorType: "TLE",
            error: `시간 초과 (Time Limit Exceeded - ${(timeoutMs / 1000).toFixed(1)}초): 무한 루프 또는 비효율적인 연산이 감지되었습니다.`
          });
        }
      }, timeoutMs);

      this.currentExecution = {
        id: execId,
        timer,
        resolve
      };

      this.worker.postMessage({
        id: execId,
        type: "EXECUTE_DS",
        userCode,
        problemId,
        validationCode
      });
    });
  }
}

// Export singleton or factory
window.JudgeManager = JudgeManager;
