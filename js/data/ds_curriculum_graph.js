/**
 * DSCurriculumGraph: Data Science Level 3 Knowledge Graph (DAG) & Unlock Logic
 * Based on Obsidian StudyVault / MOC - DataScience Lv3.md
 */

window.DSCurriculumGraph = {
  nodes: [
    // Part 1: 데이터의 이해
    {
      id: "ds_01_missing_values",
      title: "01. 그룹별 결측치 대체",
      shortName: "결측치 Groupby",
      category: "Part 1. 데이터의 이해",
      difficulty: 1,
      prerequisites: [],
      dataRef: "DS_PROBLEM_01",
      icon: "help-circle",
      status: "active"
    },
    {
      id: "ds_02_iqr_outliers",
      title: "02. IQR 이상치 클리핑",
      shortName: "IQR 이상치",
      category: "Part 1. 데이터의 이해",
      difficulty: 1,
      prerequisites: ["ds_01_missing_values"],
      dataRef: "DS_PROBLEM_02",
      icon: "scissors",
      status: "active"
    },
    {
      id: "ds_03_column_transformer",
      title: "03. 통합 파이프라인",
      shortName: "ColumnTransformer",
      category: "Part 1. 데이터의 이해",
      difficulty: 2,
      prerequisites: ["ds_01_missing_values", "ds_02_iqr_outliers"],
      dataRef: "DS_PROBLEM_03",
      icon: "layers",
      status: "active"
    },

    // Part 2: 확률과 통계
    {
      id: "ds_04_hypothesis_testing",
      title: "04. 가설 검정 & 모평균 비교",
      shortName: "t-검정 & 분산분석",
      category: "Part 2. 확률과 통계",
      difficulty: 2,
      prerequisites: ["ds_03_column_transformer"],
      icon: "activity",
      status: "upcoming",
      summary: "Levene 등분산 검정, 단일표본/독립표본 t-검정 및 일원분산분석(ANOVA)"
    },

    // Part 3: 머신러닝 일반
    {
      id: "ds_05_class_imbalance",
      title: "05. 클래스 불균형 해소",
      shortName: "SMOTE & 리샘플링",
      category: "Part 3. 머신러닝 일반",
      difficulty: 2,
      prerequisites: ["ds_03_column_transformer"],
      icon: "scale",
      status: "upcoming",
      summary: "SMOTE 오버샘플링, Tomek Links 언더샘플링, F1-macro 및 PR-AUC 평가"
    },

    // Part 4: 지도 학습
    {
      id: "ds_06_tree_ensemble",
      title: "06. 트리 & 앙상블 분류기",
      shortName: "RF & XGBoost",
      category: "Part 4. 지도 학습",
      difficulty: 3,
      prerequisites: ["ds_05_class_imbalance"],
      icon: "git-fork",
      status: "upcoming",
      summary: "RandomForest & Gradient Boosting 최적화, Feature Importance 산출"
    },

    // Part 5: 비지도 학습
    {
      id: "ds_07_unsupervised",
      title: "07. 군집 및 비지도 이상치 탐지",
      shortName: "K-Means & Isolation Forest",
      category: "Part 5. 비지도 학습",
      difficulty: 2,
      prerequisites: ["ds_03_column_transformer"],
      icon: "disc",
      status: "upcoming",
      summary: "K-Means 엘보우 기법 실루엣 점수 계산 및 Isolation Forest 이상치 스코어링"
    },

    // Part 6: 딥러닝
    {
      id: "ds_08_deep_learning",
      title: "08. 다층 퍼셉트론 & Early Stopping",
      shortName: "ANN 분류기",
      category: "Part 6. 딥러닝",
      difficulty: 3,
      prerequisites: ["ds_06_tree_ensemble"],
      icon: "cpu",
      status: "upcoming",
      summary: "MLPClassifier 구축, 드롭아웃 및 조기 종료(Early Stopping) 과적합 방지"
    }
  ],

  getProblem(id) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node || node.status === "upcoming") return null;
    return window[node.dataRef] || null;
  },

  getAllProblems() {
    return this.nodes
      .filter((n) => n.status === "active")
      .map((n) => window[n.dataRef])
      .filter(Boolean);
  },

  isUnlocked(id, masteryStore) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node) return false;
    if (node.prerequisites.length === 0) return true;

    return node.prerequisites.every((prereqId) => {
      const state = masteryStore.getProblemState(prereqId);
      return state.blankPassed || state.level === "speed" || state.level === "mastered";
    });
  }
};
