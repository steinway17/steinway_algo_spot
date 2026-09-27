/**
 * Problem 02: Binary Search (이분 탐색)
 */

window.PROBLEM_02 = {
  id: "02_binary_search",
  title: "02. 이분 탐색 (Binary Search)",
  category: "탐색 알고리즘",
  difficulty: "기초 (Lv.1)",
  timeComplexity: "O(log N)",
  visualizerType: "array",
  prerequisites: ["01_two_pointers"],
  summary: "정렬된 배열에서 타겟 값의 인덱스를 O(log N) 시간에 찾아냅니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      오름차순으로 정렬된 정수 배열 <code class="text-sky-300 font-mono">nums</code>와 찾고자 하는 값 <code class="text-sky-300 font-mono">target</code>이 주어집니다.<br/>
      <code class="text-sky-300 font-mono">nums</code>에서 <code class="text-sky-300 font-mono">target</code>의 인덱스를 찾아 반환하세요.<br/>
      존재하지 않는다면 <code class="text-amber-300 font-mono">-1</code>을 반환해야 합니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">핵심 알고리즘 메커니즘</h4>
    <p class="text-xs text-slate-400 mb-3 leading-relaxed">
      탐색 범위의 중간 인덱스 <code class="text-amber-300 font-mono">mid = (left + right) // 2</code>를 계산하여,
      중간값과 target을 비교합니다. target이 작으면 왼쪽 절반으로, 크면 오른쪽 절반으로 탐색 범위를 절반씩 줄여나갑니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">제약 조건</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li>1 ≤ len(nums) ≤ 100,000</li>
      <li>모든 원소는 고유하며 오름차순으로 정렬되어 있습니다.</li>
      <li>반드시 <strong>O(log N)</strong> 시간복잡도로 해결해야 합니다.</li>
    </ul>
  `,
  solutionTemplate: `def solution(nums, target):
    left = 0
    right = len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1
`,
  blankTemplate: `def solution(nums, target):
    left = 0
    right = len(nums) - 1
    
    # [빈칸] left와 right가 교차할 때까지 반복
    while /* BLANK_1 */:
        # [빈칸] 중간점 mid 계산
        mid = /* BLANK_2 */
        
        if nums[mid] == target:
            return mid
        # [빈칸] target이 mid값보다 크면 오른쪽 영역 탐색
        elif nums[mid] < target:
            /* BLANK_3 */
        else:
            /* BLANK_4 */
            
    return -1
`,
  blankAnswers: {
    BLANK_1: "left <= right",
    BLANK_2: "(left + right) // 2",
    BLANK_3: "left = mid + 1",
    BLANK_4: "right = mid - 1"
  },
  blankHints: [
    "BLANK_1: 단일 원소 구간에서도 검사해야 하므로 `<=` 등호가 포함됩니다: `left <= right`",
    "BLANK_2: 정수 나눗셈 연산자 `//`를 사용하여 중간 인덱스를 구합니다: `(left + right) // 2`",
    "BLANK_3: 오른쪽 절반으로 범위를 좁히므로 left를 mid 오른쪽으로 이동: `left = mid + 1`",
    "BLANK_4: 왼쪽 절반으로 범위를 좁히므로 right를 mid 왼쪽으로 이동: `right = mid - 1`"
  ],
  benchmarkScales: {
    small: {
      name: "Small (N=25)",
      input: [[-15, -10, -6, -2, 1, 4, 7, 12, 16, 20, 25, 31, 37, 42, 48, 55, 62, 69, 76, 84, 91, 99, 108, 117, 128], 62],
      expected: 16
    },
    medium: {
      name: "Medium (N=1,000)",
      input: [Array.from({ length: 1000 }, (_, i) => i * 5), 5 * 678],
      expected: 678
    },
    large: {
      name: "Large (N=100,000)",
      input: [Array.from({ length: 100000 }, (_, i) => i * 2), 2 * 87654],
      expected: 87654
    }
  },
  testCases: [
    {
      input: [[-15, -10, -6, -2, 1, 4, 7, 12, 16, 20, 25, 31, 37, 42, 48, 55, 62, 69, 76, 84, 91, 99, 108, 117, 128], 62],
      expected: 16
    },
    { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
    { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
    { input: [[5], 5], expected: 0 },
    { input: [[2, 5], 5], expected: 1 },
    {
      input: [Array.from({ length: 100000 }, (_, i) => i * 2), 2 * 87654],
      expected: 87654
    }
  ]
};
