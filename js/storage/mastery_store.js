/**
 * MasteryStore: LocalStorage-based Progress, Drill Levels & Spaced Repetition Tracker
 */

const STORAGE_KEY = "algo_harness_mastery_v1";

class MasteryStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { problems: {}, userPrefs: { darkMode: true } };
    } catch (e) {
      console.warn("Failed to load from localStorage", e);
      return { problems: {}, userPrefs: { darkMode: true } };
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  }

  getProblemState(problemId) {
    if (!this.data.problems[problemId]) {
      this.data.problems[problemId] = {
        level: "observe", // "observe" | "fill" | "blank" | "speed" | "mastered"
        blankPassed: false,
        speedPassed: false,
        bestSpeedSec: null,
        passCount: 0,
        lastPassedAt: null,
        codeDrafts: {}
      };
      this.save();
    }
    const state = this.data.problems[problemId];
    if (!state.codeDrafts) {
      state.codeDrafts = {};
      if (state.blankCode) state.codeDrafts.fill = state.blankCode;
      if (state.userCode) state.codeDrafts.blank = state.userCode;
    }
    return state;
  }

  saveCode(problemId, mode, code) {
    const state = this.getProblemState(problemId);
    if (!state.codeDrafts) state.codeDrafts = {};
    state.codeDrafts[mode] = code;
    this.save();
  }

  getSavedCode(problemId, mode) {
    const state = this.getProblemState(problemId);
    return state.codeDrafts ? (state.codeDrafts[mode] ?? null) : null;
  }

  clearSavedCode(problemId, mode) {
    const state = this.getProblemState(problemId);
    if (state.codeDrafts && state.codeDrafts[mode] !== undefined) {
      delete state.codeDrafts[mode];
      this.save();
    }
  }

  getLastSession() {
    return this.data.lastSession || null;
  }

  saveLastSession({ domain, problemId, mode }) {
    this.data.lastSession = {
      domain,
      problemId,
      mode,
      updatedAt: Date.now()
    };
    this.save();
  }

  recordPass(problemId, mode, elapsedSec = null) {
    const state = this.getProblemState(problemId);
    state.passCount = (state.passCount || 0) + 1;
    state.lastPassedAt = Date.now();

    if (mode === "fill") {
      state.blankPassed = true;
      if (state.level === "observe" || state.level === "fill") {
        state.level = "blank"; // unlock blank slate
      }
    } else if (mode === "blank") {
      if (state.level === "blank") {
        state.level = "speed"; // unlock speedrun
      }
    } else if (mode === "speed") {
      state.speedPassed = true;
      state.level = "mastered";
      if (!state.bestSpeedSec || (elapsedSec && elapsedSec < state.bestSpeedSec)) {
        state.bestSpeedSec = elapsedSec;
      }
    }

    this.save();
    return state;
  }

  isReviewNeeded(problemId) {
    const state = this.getProblemState(problemId);
    if (!state.lastPassedAt) return false;
    const daysSince = (Date.now() - state.lastPassedAt) / (1000 * 60 * 60 * 24);
    // Suggest review after 2 days
    return daysSince >= 2;
  }

  getAllStats(allProblems = []) {
    let masteredCount = 0;
    let inProgressCount = 0;

    allProblems.forEach((p) => {
      const state = this.getProblemState(p.id);
      if (state.level === "mastered") {
        masteredCount++;
      } else if (state.level !== "observe" || state.blankPassed) {
        inProgressCount++;
      }
    });

    return {
      total: allProblems.length,
      masteredCount,
      inProgressCount
    };
  }
}

window.MasteryStore = MasteryStore;
