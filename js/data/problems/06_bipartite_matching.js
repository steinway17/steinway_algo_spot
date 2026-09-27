/**
 * Problem 06: 이분 매칭 & 증가 경로 (Bipartite Matching with DFS Augmenting Paths)
 */

window.PROBLEM_06 = {
  id: "06_bipartite_matching",
  title: "06. 이분 매칭 & 증가 경로 (Bipartite Matching)",
  category: "심화 그래프 / 네트워크 유량",
  difficulty: "심화 (Lv.3)",
  timeComplexity: "O(V * E)",
  visualizerType: "bipartite_matching",
  prerequisites: ["04_bfs_maze", "05_dfs_backtracking"],
  summary: "두 독립 집합 U(작업자)와 V(일감) 사이에서 DFS 증가 경로를 찾아 최대 매칭 수를 구합니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      두 개의 독립 집합인 <strong>작업자 집합 U (크기 n)</strong>와 <strong>일감 집합 V (크기 m)</strong>가 주어집니다.<br/>
      각 작업자 <code class="text-sky-300 font-mono">u</code>가 수행할 수 있는 일감들의 번호 목록이 인접 리스트 <code class="text-amber-300 font-mono">edges[u]</code>로 주어집니다.<br/>
      각 작업자는 최대 하나의 일감만 맡을 수 있고, 각 일감 또한 최대 한 명의 작업자에게만 배정될 수 있습니다.<br/>
      이때 배정할 수 있는 <strong>최대 매칭 수 (Maximum Matching)</strong>를 반환하는 함수를 작성하세요.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">핵심 알고리즘: DFS 증가 경로 (Augmenting Path)</h4>
    <p class="text-xs text-slate-400 mb-3 leading-relaxed">
      새로운 작업자 <code class="text-sky-400 font-mono">u</code>를 매칭할 때, 일감 <code class="text-purple-400 font-mono">v</code>가 이미 다른 작업자 <code class="text-emerald-400 font-mono">u_prev</code>에 배정되어 있다면 
      <code class="text-emerald-400 font-mono">u_prev</code>가 <strong>다른 가능한 일감으로 양보하여 이동할 수 있는지</strong> DFS로 재귀 탐색합니다.<br/>
      이러한 연쇄 양보가 성공하여 미매칭 노드까지 도달하는 경로를 <strong>증가 경로(Augmenting Path)</strong>라고 부릅니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">제약 조건</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li>1 ≤ n, m ≤ 1,000</li>
      <li>0 ≤ len(edges[u]) ≤ m</li>
      <li>시간 복잡도: <strong>O(V · E)</strong> (DFS 기반 베르주 보조정리/헝가리안 알고리즘 변형)</li>
    </ul>
  `,
  solutionTemplate: `def solution(n, m, edges):
    # matched[v]: 일감 v에 매칭된 작업자 u의 번호 (-1이면 미배정)
    matched = [-1] * m
    
    def dfs(u, visited):
        for v in edges[u]:
            if visited[v]:
                continue
            visited[v] = True
            
            # 일감 v가 비어있거나, 기존 담당자가 다른 일감으로 양보할 수 있다면
            if matched[v] == -1 or dfs(matched[v], visited):
                matched[v] = u
                return True
        return False

    match_count = 0
    for u in range(n):
        visited = [False] * m
        if dfs(u, visited):
            match_count += 1
            
    return match_count
`,
  blankTemplate: `def solution(n, m, edges):
    matched = [-1] * m
    
    def dfs(u, visited):
        for v in edges[u]:
            # [빈칸 1] 이번 DFS 시도에서 이미 방문한 일감은 건너뜁니다
            if /* BLANK_1 */:
                continue
            visited[v] = True
            
            # [빈칸 2] v가 비어있거나, 기존 담당자가 다른 일감으로 양보할 수 있다면
            if /* BLANK_2 */:
                # [빈칸 3] 일감 v에 현재 작업자 u를 배정
                /* BLANK_3 */
                return True
        return False

    match_count = 0
    for u in range(n):
        visited = [False] * m
        if dfs(u, visited):
            match_count += 1
            
    return match_count
`,
  blankAnswers: {
    BLANK_1: "visited[v]",
    BLANK_2: "matched[v] == -1 or dfs(matched[v], visited)",
    BLANK_3: "matched[v] = u"
  },
  blankHints: [
    "BLANK_1: 순환 참조를 막기 위해 이번 탐색에서 이미 시도한 일감인지 검사합니다: `visited[v]`",
    "BLANK_2: 일감 v가 아직 비어있거나(-1) 기존 매칭된 작업자(matched[v])가 다른 일감으로 양보할 수 있는지 재귀 확인합니다: `matched[v] == -1 or dfs(matched[v], visited)`",
    "BLANK_3: 양보가 성공했거나 비어있으므로 일감 v의 담당자로 u를 등록합니다: `matched[v] = u`"
  ],
  benchmarkScales: {
    small: {
      name: "Small (N=4, M=4)",
      input: [
        4,
        4,
        [
          [0, 1],
          [0, 2],
          [1, 2],
          [2, 3]
        ]
      ],
      expected: 4
    },
    medium: {
      name: "Medium (N=100, M=100)",
      input: [
        100,
        100,
        Array.from({ length: 100 }, (_, i) => [i, (i + 1) % 100])
      ],
      expected: 100
    },
    large: {
      name: "Large (N=1,000, M=1,000)",
      input: [
        1000,
        1000,
        Array.from({ length: 1000 }, (_, i) => [i, (i + 1) % 1000, (i + 2) % 1000])
      ],
      expected: 1000
    }
  },
  testCases: [
    {
      input: [
        4,
        4,
        [
          [0, 1],
          [0, 2],
          [1, 2],
          [2, 3]
        ]
      ],
      expected: 4
    },
    {
      input: [3, 3, [[0], [1], [2]]],
      expected: 3
    },
    {
      input: [3, 2, [[0, 1], [0], [0, 1]]],
      expected: 2
    },
    {
      input: [3, 3, [[], [], []]],
      expected: 0
    },
    {
      input: [4, 1, [[0], [0], [0], [0]]],
      expected: 1
    },
    {
      input: [
        5,
        5,
        [
          [0, 1, 2],
          [1],
          [1, 3],
          [2, 4],
          [0, 4]
        ]
      ],
      expected: 5
    },
    {
      input: [
        1000,
        1000,
        Array.from({ length: 1000 }, (_, i) => [i, (i + 1) % 1000, (i + 2) % 1000])
      ],
      expected: 1000
    }
  ]
};
