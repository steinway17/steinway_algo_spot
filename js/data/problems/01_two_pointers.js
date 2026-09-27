/**
 * Problem 01: Two Pointers (정렬된 배열에서 두 수의 합)
 */

window.PROBLEM_01 = {
  id: "01_two_pointers",
  title: "01. 두 수의 합 (Two Pointers)",
  category: "배열 & 포인터",
  difficulty: "기초 (Lv.1)",
  timeComplexity: "O(N)",
  visualizerType: "array",
  prerequisites: [],
  summary: "오름차순 정렬 배열에서 합이 target이 되는 두 인덱스를 O(N)으로 찾습니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      오름차순으로 정렬된 정수 배열 <code class="text-sky-300 font-mono">nums</code>와 정수 <code class="text-sky-300 font-mono">target</code>이 주어집니다.<br/>
      배열의 서로 다른 두 원소를 더하여 정확히 <code class="text-sky-300 font-mono">target</code>이 되는 두 원소의 인덱스 <code class="text-amber-300 font-mono">[left, right]</code>를 반환하는 함수를 작성하세요.<br/>
      조건을 만족하는 쌍이 없으면 빈 배열 <code class="text-amber-300 font-mono">[]</code>을 반환합니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">핵심 알고리즘 메커니즘</h4>
    <p class="text-xs text-slate-400 mb-3 leading-relaxed">
      양 끝점 <code class="text-blue-400 font-mono">left=0</code>, <code class="text-purple-400 font-mono">right=len(nums)-1</code>에서 시작하여 합이 target보다 작으면 <code class="text-blue-400 font-mono">left</code>를 오른쪽으로, 크면 <code class="text-purple-400 font-mono">right</code>를 왼쪽으로 좁혀나갑니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">제약 조건</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li>2 ≤ len(nums) ≤ 10,000</li>
      <li>배열 <code class="font-mono">nums</code>는 오름차순으로 정렬되어 있습니다.</li>
      <li>시간복잡도 <strong>O(N)</strong> 이하로 작성해야 합니다 (이중 루프 O(N²)는 불가).</li>
    </ul>
  `,
  solutionTemplate: `def solution(nums, target):
    left = 0
    right = len(nums) - 1
    
    while left < right:
        current_sum = nums[left] + nums[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
            
    return []
`,
  blankTemplate: `def solution(nums, target):
    left = 0
    right = len(nums) - 1
    
    # [빈칸] 양쪽 끝에서 좁혀오는 반복문 조건은?
    while /* BLANK_1 */:
        current_sum = nums[left] + nums[right]
        
        if current_sum == target:
            return [left, right]
        # [빈칸] 합이 target보다 작으면 어떤 포인터를 움직여야 할까요?
        elif current_sum < target:
            /* BLANK_2 */
        else:
            /* BLANK_3 */
            
    return []
`,
  blankAnswers: {
    BLANK_1: "left < right",
    BLANK_2: "left += 1",
    BLANK_3: "right -= 1"
  },
  blankHints: [
    "BLANK_1: left 포인터가 right 포인터보다 왼쪽에 있을 동안 반복합니다: `left < right`",
    "BLANK_2: 합이 target보다 작으면 값을 키워야 하므로 왼쪽 포인터를 오른쪽으로 한 칸 이동합니다: `left += 1`",
    "BLANK_3: 합이 target보다 크면 값을 줄여야 하므로 오른쪽 포인터를 왼쪽으로 한 칸 이동합니다: `right -= 1`"
  ],
  benchmarkScales: {
    small: {
      name: "Small (N=20)",
      input: [[2, 5, 8, 12, 17, 21, 26, 30, 35, 41, 46, 52, 58, 63, 69, 75, 82, 88, 93, 99], 100],
      expected: [3, 17]
    },
    medium: {
      name: "Medium (N=1,000)",
      input: [Array.from({ length: 1000 }, (_, i) => i * 3), 3 * 200 + 3 * 750],
      expected: [0, 950]
    },
    large: {
      name: "Large (N=30,000)",
      input: [Array.from({ length: 30000 }, (_, i) => i * 2), 2 * 100 + 2 * 29800],
      expected: [0, 29900]
    }
  },
  testCases: [
    {
      input: [[2, 5, 8, 12, 17, 21, 26, 30, 35, 41, 46, 52, 58, 63, 69, 75, 82, 88, 93, 99], 100],
      expected: [3, 17]
    },
    { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { input: [[1, 3, 4, 6, 8, 11, 15], 14], expected: [1, 5] },
    { input: [[-5, -2, 0, 3, 9], 1], expected: [1, 3] },
    { input: [[1, 2, 3, 9], 8], expected: [] },
    {
      input: [Array.from({ length: 30000 }, (_, i) => i * 2), 2 * 100 + 2 * 29800],
      expected: [0, 29900]
    }
  ]
};
