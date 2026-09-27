/**
 * Problem 05: DFS Backtracking (N과 M 중복 없는 수열 생성)
 */

window.PROBLEM_05 = {
  id: "05_dfs_backtracking",
  title: "05. 수열 생성 (DFS 백트래킹)",
  category: "재귀 & 백트래킹",
  difficulty: "중급 (Lv.2)",
  timeComplexity: "O(N! / (N-M)!)",
  visualizerType: "recursion_tree",
  prerequisites: ["03_valid_parentheses"],
  summary: "재귀 호출과 방문 체크(Visited)를 통해 1부터 N까지의 자연수 중 중복 없이 M개를 고른 수열 목록을 만듭니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      자연수 <code class="text-sky-300 font-mono">n</code>과 <code class="text-sky-300 font-mono">m</code>이 주어집니다.<br/>
      1부터 <code class="text-sky-300 font-mono">n</code>까지의 자연수 중에서 <strong>중복 없이 <code class="text-amber-300 font-mono">m</code>개를 고른 수열</strong>을 모두 구하여 리스트의 리스트 형태로 반환하세요.<br/>
      수열은 사전 순(오름차순)으로 정렬되어야 합니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">핵심 원리</h4>
    <p class="text-xs text-slate-400 mb-3 leading-relaxed">
      재귀 함수를 호출하며 현재 수열에 숫자를 넣고(<code class="font-mono">append</code>), 자식 호출이 끝난 뒤 숫자를 빼며(<code class="font-mono">pop</code>) 상태를 복원(Backtrack)합니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">제약 조건</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li>1 ≤ m ≤ n ≤ 8</li>
    </ul>
  `,
  solutionTemplate: `def solution(n, m):
    result = []
    current = []
    visited = [False] * (n + 1)
    
    def backtrack():
        if len(current) == m:
            result.append(list(current))
            return
            
        for i in range(1, n + 1):
            if not visited[i]:
                visited[i] = True
                current.append(i)
                backtrack()
                current.pop()
                visited[i] = False
                
    backtrack()
    return result
`,
  blankTemplate: `def solution(n, m):
    result = []
    current = []
    visited = [False] * (n + 1)
    
    def backtrack():
        # [빈칸] 수열의 길이가 m에 도달하면 결과에 저장하고 종료
        if /* BLANK_1 */:
            result.append(list(current))
            return
            
        for i in range(1, n + 1):
            # [빈칸] 아직 사용하지 않은 숫자인 경우 선택
            if not visited[i]:
                visited[i] = True
                current.append(i)
                backtrack()
                # [빈칸] 백트래킹 상태 원복 (current에서 마지막 원소 제거 및 방문 해제)
                /* BLANK_2 */
                visited[i] = False
                
    backtrack()
    return result
`,
  blankAnswers: {
    BLANK_1: "len(current) == m",
    BLANK_2: "current.pop()"
  },
  blankHints: [
    "BLANK_1: 현재까지 수집한 숫자의 개수를 검사합니다: `len(current) == m`",
    "BLANK_2: 마지막에 추가했던 숫자를 리스트에서 제거하여 이전 상태로 복구: `current.pop()`"
  ],
  benchmarkScales: {
    small: {
      name: "Small (N=4, M=2)",
      input: [4, 2],
      expected: [
        [1, 2], [1, 3], [1, 4],
        [2, 1], [2, 3], [2, 4],
        [3, 1], [3, 2], [3, 4],
        [4, 1], [4, 2], [4, 3]
      ]
    },
    medium: {
      name: "Medium (N=5, M=3)",
      input: [5, 3],
      expectedCount: 60
    },
    large: {
      name: "Large (N=7, M=4)",
      input: [7, 4],
      expectedCount: 840
    }
  },
  testCases: [
    {
      input: [4, 2],
      expected: [
        [1, 2], [1, 3], [1, 4],
        [2, 1], [2, 3], [2, 4],
        [3, 1], [3, 2], [3, 4],
        [4, 1], [4, 2], [4, 3]
      ]
    },
    {
      input: [3, 1],
      expected: [[1], [2], [3]]
    },
    {
      input: [3, 3],
      expected: [
        [1, 2, 3], [1, 3, 2],
        [2, 1, 3], [2, 3, 1],
        [3, 1, 2], [3, 2, 1]
      ]
    }
  ]
};
