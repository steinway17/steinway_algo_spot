/**
 * Curriculum Knowledge Graph: DAG definition & Unlock Logic
 */

window.CurriculumGraph = {
  nodes: [
    {
      id: "01_two_pointers",
      title: "01. 두 수의 합",
      shortName: "투 포인터",
      category: "배열/포인터",
      difficulty: 1,
      prerequisites: [],
      dataRef: "PROBLEM_01",
      icon: "arrow-left-right"
    },
    {
      id: "02_binary_search",
      title: "02. 이분 탐색",
      shortName: "이분 탐색",
      category: "탐색",
      difficulty: 1,
      prerequisites: ["01_two_pointers"],
      dataRef: "PROBLEM_02",
      icon: "search"
    },
    {
      id: "03_valid_parentheses",
      title: "03. 올바른 괄호",
      shortName: "스택 괄호",
      category: "스택",
      difficulty: 1,
      prerequisites: [],
      dataRef: "PROBLEM_03",
      icon: "layers"
    },
    {
      id: "04_bfs_maze",
      title: "04. 미로 최단거리",
      shortName: "BFS 큐",
      category: "그래프/BFS",
      difficulty: 2,
      prerequisites: ["01_two_pointers", "03_valid_parentheses"],
      dataRef: "PROBLEM_04",
      icon: "compass"
    },
    {
      id: "05_dfs_backtracking",
      title: "05. 수열 생성",
      shortName: "DFS 백트래킹",
      category: "재귀/DFS",
      difficulty: 2,
      prerequisites: ["03_valid_parentheses"],
      dataRef: "PROBLEM_05",
      icon: "git-branch"
    },
    {
      id: "06_bipartite_matching",
      title: "06. 이분 매칭 & 증가 경로",
      shortName: "이분 매칭 (심화)",
      category: "심화 네트워크/매칭",
      difficulty: 3,
      prerequisites: ["04_bfs_maze", "05_dfs_backtracking"],
      dataRef: "PROBLEM_06",
      icon: "git-merge"
    }
  ],

  getProblem(id) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node) return null;
    return window[node.dataRef] || null;
  },

  getAllProblems() {
    return this.nodes
      .map((n) => window[n.dataRef])
      .filter(Boolean);
  },

  isUnlocked(id, masteryStore) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node) return false;
    if (node.prerequisites.length === 0) return true;

    // Check if all prerequisites have at least passed blank or scratch mode
    return node.prerequisites.every((prereqId) => {
      const state = masteryStore.getProblemState(prereqId);
      return state.blankPassed || state.level === "speed" || state.level === "mastered";
    });
  }
};
