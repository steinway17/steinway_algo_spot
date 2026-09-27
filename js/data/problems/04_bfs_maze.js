/**
 * Problem 04: BFS Maze (미로 최단 거리 탐색)
 */

window.PROBLEM_04 = {
  id: "04_bfs_maze",
  title: "04. 미로 최단거리 (BFS Queue)",
  category: "그래프 & 너비 우선 탐색",
  difficulty: "중급 (Lv.2)",
  timeComplexity: "O(N × M)",
  visualizerType: "grid_maze",
  prerequisites: ["01_two_pointers", "03_valid_parentheses"],
  summary: "선입선출 큐(FIFO)를 사용하여 격자 미로의 출발점부터 도착점까지 최단 거리를 탐색합니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      <code class="text-sky-300 font-mono">N × M</code> 크기의 격자 미로 <code class="text-sky-300 font-mono">grid</code>가 주어집니다.<br/>
      <code class="text-emerald-400 font-mono">0</code>은 이동 가능한 빈 칸이고, <code class="text-rose-400 font-mono">1</code>은 이동할 수 없는 벽입니다.<br/>
      출발점 <code class="text-sky-300 font-mono">(0, 0)</code>에서 도착점 <code class="text-amber-300 font-mono">(N-1, M-1)</code>까지 이동하는 데 필요한 <strong>최소 이동 칸 수(시작 칸과 끝 칸 포함)</strong>를 반환하세요.<br/>
      도달할 수 없는 경우 <code class="text-slate-400 font-mono">-1</code>을 반환합니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">핵심 원리</h4>
    <p class="text-xs text-slate-400 mb-3 leading-relaxed">
      가중치가 없는 그래프의 최단 경로는 <strong>너비 우선 탐색(BFS)</strong>으로 가장 먼저 도착점에 도달하는 경로가 보장됩니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">제약 조건</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li>1 ≤ N, M ≤ 50</li>
      <li>상하좌우 4방향으로만 이동 가능합니다.</li>
      <li>grid[0][0] == 0, grid[N-1][M-1] == 0</li>
    </ul>
  `,
  solutionTemplate: `from collections import deque

def solution(grid):
    n = len(grid)
    m = len(grid[0])
    
    if grid[0][0] == 1 or grid[n-1][m-1] == 1:
        return -1
        
    queue = deque([(0, 0, 1)])  # (r, c, dist)
    visited = [[False] * m for _ in range(n)]
    visited[0][0] = True
    
    dr = [-1, 1, 0, 0]
    dc = [0, 0, -1, 1]
    
    while queue:
        r, c, dist = queue.popleft()
        
        if r == n - 1 and c == m - 1:
            return dist
            
        for i in range(4):
            nr = r + dr[i]
            nc = c + dc[i]
            
            if 0 <= nr < n and 0 <= nc < m:
                if not visited[nr][nc] and grid[nr][nc] == 0:
                    visited[nr][nc] = True
                    queue.append((nr, nc, dist + 1))
                    
    return -1
`,
  blankTemplate: `from collections import deque

def solution(grid):
    n = len(grid)
    m = len(grid[0])
    
    # [빈칸] 시작점 (r=0, c=0, dist=1) 큐에 초기화
    queue = /* BLANK_1 */
    visited = [[False] * m for _ in range(n)]
    visited[0][0] = True
    
    dr = [-1, 1, 0, 0]
    dc = [0, 0, -1, 1]
    
    while queue:
        # [빈칸] 큐의 맨 앞에서 원소 꺼내기
        r, c, dist = /* BLANK_2 */
        
        if r == n - 1 and c == m - 1:
            return dist
            
        for i in range(4):
            nr = r + dr[i]
            nc = c + dc[i]
            
            # [빈칸] 격자 범위 내 & 미방문 & 벽(0) 확인
            if 0 <= nr < n and 0 <= nc < m:
                if not visited[nr][nc] and grid[nr][nc] == 0:
                    visited[nr][nc] = True
                    /* BLANK_3 */
                    
    return -1
`,
  blankAnswers: {
    BLANK_1: "deque([(0, 0, 1)])",
    BLANK_2: "queue.popleft()",
    BLANK_3: "queue.append((nr, nc, dist + 1))"
  },
  blankHints: [
    "BLANK_1: deque에 (0, 0, 1) 튜플을 담습니다: `deque([(0, 0, 1)])`",
    "BLANK_2: deque의 왼쪽에서 꺼내는 메서드: `queue.popleft()`",
    "BLANK_3: 다음 방문 노드를 큐의 뒤에 추가: `queue.append((nr, nc, dist + 1))`"
  ],
  benchmarkScales: {
    small: {
      name: "Small (6×7)",
      input: [
        [
          [0, 0, 1, 0, 0, 0, 0],
          [0, 1, 1, 0, 1, 1, 0],
          [0, 0, 0, 0, 0, 1, 0],
          [1, 1, 0, 1, 0, 0, 0],
          [0, 0, 0, 1, 1, 1, 0],
          [0, 1, 0, 0, 0, 0, 0]
        ]
      ],
      expected: 12
    },
    medium: {
      name: "Medium (8×8)",
      input: [
        [
          [0, 0, 0, 0, 1, 0, 0, 0],
          [1, 1, 0, 1, 1, 0, 1, 0],
          [0, 0, 0, 0, 0, 0, 1, 0],
          [0, 1, 1, 1, 1, 0, 0, 0],
          [0, 0, 0, 0, 1, 1, 1, 0],
          [1, 1, 1, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 1, 1, 1, 0],
          [0, 1, 1, 0, 0, 0, 0, 0]
        ]
      ],
      expected: 15
    },
    large: {
      name: "Large (15×15)",
      input: [
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
      ],
      expected: 101
    }
  },
  testCases: [
    {
      input: [
        [
          [0, 0, 1, 0, 0, 0, 0],
          [0, 1, 1, 0, 1, 1, 0],
          [0, 0, 0, 0, 0, 1, 0],
          [1, 1, 0, 1, 0, 0, 0],
          [0, 0, 0, 1, 1, 1, 0],
          [0, 1, 0, 0, 0, 0, 0]
        ]
      ],
      expected: 12
    },
    {
      input: [
        [
          [0, 0, 0],
          [1, 1, 0],
          [0, 0, 0]
        ]
      ],
      expected: 5
    },
    {
      input: [
        [
          [0, 1],
          [1, 0]
        ]
      ],
      expected: -1
    },
    {
      input: [
        [
          [0, 0, 0, 0],
          [1, 1, 1, 0],
          [0, 0, 0, 0]
        ]
      ],
      expected: 6
    },
    {
      input: [
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
      ],
      expected: 101
    }
  ]
};
