/**
 * Problem 03: Valid Parentheses (올바른 괄호 문자열 검사)
 */

window.PROBLEM_03 = {
  id: "03_valid_parentheses",
  title: "03. 올바른 괄호 검사 (Stack)",
  category: "자료구조 & 스택",
  difficulty: "기초 (Lv.1)",
  timeComplexity: "O(N)",
  visualizerType: "stack",
  prerequisites: [],
  summary: "스택(LIFO)을 활용하여 여는 괄호와 닫는 괄호의 짝이 올바른지 판별합니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      <code class="text-sky-300 font-mono">'('</code>, <code class="text-sky-300 font-mono">')'</code>, 
      <code class="text-sky-300 font-mono">'{'</code>, <code class="text-sky-300 font-mono">'}'</code>, 
      <code class="text-sky-300 font-mono">'['</code>, <code class="text-sky-300 font-mono">']'</code> 로만 이루어진 문자열 <code class="text-sky-300 font-mono">s</code>가 주어집니다.<br/>
      이 문자열이 올바른 괄호 문자열인지 판별하여 <code class="text-emerald-400 font-mono">True</code> 또는 <code class="text-rose-400 font-mono">False</code>를 반환하세요.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">올바른 괄호의 조건</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li>열린 괄호는 같은 종류의 닫힌 괄호에 의해 닫혀야 합니다.</li>
      <li>열린 괄호는 올바른 순서대로 닫혀야 합니다.</li>
      <li>모든 괄호 쌍이 닫힌 후 스택이 완전히 비어 있어야 합니다.</li>
    </ul>

    <h4 class="text-xs font-bold text-slate-300 mb-1">제약 조건</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li>1 ≤ len(s) ≤ 10,000</li>
      <li>시간복잡도 <strong>O(N)</strong>, 공간복잡도 <strong>O(N)</strong></li>
    </ul>
  `,
  solutionTemplate: `def solution(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for ch in s:
        if ch in mapping:
            # 닫는 괄호인 경우
            top_element = stack.pop() if stack else '#'
            if mapping[ch] != top_element:
                return False
        else:
            # 여는 괄호인 경우 스택에 push
            stack.append(ch)
            
    return len(stack) == 0
`,
  blankTemplate: `def solution(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for ch in s:
        if ch in mapping:
            # [빈칸] 스택이 비어있지 않으면 pop, 비어있으면 더미값
            top_element = /* BLANK_1 */
            if mapping[ch] != top_element:
                return False
        else:
            # [빈칸] 여는 괄호는 스택에 추가
            /* BLANK_2 */
            
    # [빈칸] 모든 처리가 끝난 후 스택이 비어있어야 올바른 괄호
    return /* BLANK_3 */
`,
  blankAnswers: {
    BLANK_1: "stack.pop() if stack else '#'",
    BLANK_2: "stack.append(ch)",
    BLANK_3: "len(stack) == 0"
  },
  blankHints: [
    "BLANK_1: stack이 있으면 꺼내고 없으면 임의의 문자열: `stack.pop() if stack else '#'`",
    "BLANK_2: 리스트의 끝에 요소를 추가하는 메서드: `stack.append(ch)`",
    "BLANK_3: 남아있는 여는 괄호가 없어야 하므로: `len(stack) == 0` 또는 `not stack`"
  ],
  benchmarkScales: {
    small: {
      name: "Small (L=20)",
      input: ["({[([{}])]})[]{()}"],
      expected: true
    },
    medium: {
      name: "Medium (L=2,000)",
      input: ["()".repeat(1000)],
      expected: true
    },
    large: {
      name: "Large (L=40,000)",
      input: ["(".repeat(20000) + ")".repeat(20000)],
      expected: true
    }
  },
  testCases: [
    { input: ["({[([{}])]})[]{()}"], expected: true },
    { input: ["()[]{}"], expected: true },
    { input: ["([{}])"], expected: true },
    { input: ["(]"], expected: false },
    { input: ["([)]"], expected: false },
    { input: ["(".repeat(20000) + ")".repeat(20000)], expected: true }
  ]
};
