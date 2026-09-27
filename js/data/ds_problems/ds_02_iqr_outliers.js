/**
 * Problem DS-02: 이상치 탐지 및 클리핑 (IQR Outlier Clipping)
 * From StudyVault: 01-데이터의 이해 / 결측치와 이상치 처리.md & Practice Question 8
 */

window.DS_PROBLEM_02 = {
  id: "ds_02_iqr_outliers",
  title: "02. IQR 기반 이상치 탐지 및 클리핑 (IQR Outlier Clipping)",
  category: "Part 1. 데이터의 이해",
  difficulty: "기초 (Lv.3 필수)",
  timeComplexity: "O(N log N)",
  visualizerType: "dataframe_diff",
  prerequisites: ["ds_01_missing_values"],
  summary: "사분위수 범위(IQR) 공식을 적용하여 Fare 컬럼의 극단치를 상·하한 경계로 클리핑합니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      타이타닉 데이터셋의 요금(<code class="text-amber-300 font-mono">Fare</code>) 변수는 소수의 VIP 승객이 지불한 극단적인 고가 요금(500달러 이상 등)으로 인해 극심한 우측 왜도(Right-skewed)를 보입니다.<br/>
      이러한 극단치를 단순히 행 삭제(<code class="text-rose-400 font-mono">drop</code>)하면 다른 특성(Feature) 정보까지 유실되므로, 
      <strong>IQR(사분위범위) 기준의 상한선(Upper Bound)과 하한선(Lower Bound)</strong>을 계산하여 
      경계를 벗어난 이상치를 경계값으로 대체(<code class="text-emerald-400 font-mono">clipping</code>)하는 함수를 작성하세요.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">IQR 이상치 판별 공식</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-1">
      <li>제1사분위수: <code class="font-mono text-sky-300">Q1 = Fare의 25% 백분위수</code></li>
      <li>제3사분위수: <code class="font-mono text-sky-300">Q3 = Fare의 75% 백분위수</code></li>
      <li>사분위범위: <code class="font-mono text-indigo-300">IQR = Q3 - Q1</code></li>
      <li>하한 경계: <code class="font-mono text-emerald-300">Lower = Q1 - 1.5 * IQR</code></li>
      <li>상한 경계: <code class="font-mono text-emerald-300">Upper = Q3 + 1.5 * IQR</code></li>
    </ul>

    <h4 class="text-xs font-bold text-slate-300 mb-1">제약 조건</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li><code class="font-mono">Fare</code> 컬럼의 값들을 <code class="font-mono">[Lower, Upper]</code> 범위로 클리핑하세요.</li>
      <li>다른 컬럼은 일체 변경되지 않아야 합니다.</li>
    </ul>
  `,
  solutionTemplate: `import pandas as pd
import numpy as np

def solution(df):
    """
    Fare 컬럼에 대해 IQR 기준 1.5배수 상/하한으로 클리핑합니다.
    """
    Q1 = df['Fare'].quantile(0.25)
    Q3 = df['Fare'].quantile(0.75)
    IQR = Q3 - Q1
    
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    
    df['Fare'] = df['Fare'].clip(lower=lower, upper=upper)
    return df
`,
  blankTemplate: `import pandas as pd
import numpy as np

def solution(df):
    """
    Fare 컬럼에 대해 IQR 기준 1.5배수 상/하한으로 클리핑합니다.
    """
    # [빈칸 1, 2] 25% 분위수(Q1)와 75% 분위수(Q3) 계산
    Q1 = df['Fare']./* BLANK_1 */
    Q3 = df['Fare']./* BLANK_2 */
    
    # [빈칸 3] 사분위범위(IQR) 공식
    IQR = /* BLANK_3 */
    
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    
    # [빈칸 4] lower, upper 경계로 값 자르기(clipping)
    df['Fare'] = df['Fare']./* BLANK_4 */
    return df
`,
  blankAnswers: {
    BLANK_1: "quantile(0.25)",
    BLANK_2: "quantile(0.75)",
    BLANK_3: "Q3 - Q1",
    BLANK_4: "clip(lower=lower, upper=upper)"
  },
  blankHints: [
    "BLANK_1 & 2: pandas Series의 분위수는 `quantile(0.25)`와 `quantile(0.75)`로 구합니다.",
    "BLANK_3: 사분위수 범위는 3분위수에서 1분위수를 뺀 `Q3 - Q1`입니다.",
    "BLANK_4: 경계값 클리핑은 pandas의 `clip(lower=lower, upper=upper)` 메서드를 사용합니다."
  ],
  examTraps: [
    {
      type: "ox",
      question: "IQR 이상치 판별 공식에서 정확히 Q3 + 1.5*IQR 과 일치하는 값은 이상치로 판별된다.",
      answer: "X",
      trapPoint: "이상치 경계 포함(≤, ≥) 여부",
      explanation: "이상치는 정상 경계를 초과(> Upper)하거나 미만(< Lower)인 경우에만 해당합니다. 정확히 경계선상에 위치한 값은 정상(inlier)으로 취급됩니다.",
      codeSnippet: "# 이상치 판정 조건식\noutliers = (df['Fare'] < lower) | (df['Fare'] > upper)"
    },
    {
      type: "ox",
      question: "scipy.stats와 pandas의 quantile 기본 보간법(interpolation)은 동일하게 동작하므로 결과값이 항상 일치한다.",
      answer: "X",
      trapPoint: "라이브러리별 분위수 계산 알고리즘 차이",
      explanation: "pandas의 quantile은 기본 linear 보간을 사용하며, numpy.percentile의 method 옵션(weibull 등) 설정에 따라 소수점 단위 차이가 발생할 수 있습니다. 시험 문제의 지시문에 명시된 라이브러리(pandas vs numpy)를 반드시 확인해야 합니다.",
      codeSnippet: "# pandas 기본: 'linear'\ndf['col'].quantile(0.25)\n\n# numpy 1.22+: method 매개변수 사용\nnp.percentile(arr, 25, method='linear')"
    }
  ],
  benchmarkScales: {
    small: { name: "Sample (N=15)", description: "극단치 2건 포함 샘플" },
    medium: { name: "Titanic Full (N=891)", description: "실제 요금 분포 클리핑" },
    large: { name: "Scale Test (N=100,000)", description: "대용량 이상치 연산" }
  },
  validationCode: `
# Sample data with intentional extreme outliers in Fare (e.g. 512.33 and 263.0)
data = {
    'PassengerId': list(range(1, 16)),
    'Age': [22.0, 38.0, 26.0, 35.0, 35.0, 54.0, 2.0, 27.0, 14.0, 4.0, 58.0, 20.0, 39.0, 14.0, 55.0],
    'Fare': [7.25, 71.28, 7.92, 53.1, 8.05, 51.86, 21.07, 11.13, 30.07, 16.7, 26.55, 8.05, 31.27, 263.0, 512.33]
}
sample_df = pd.DataFrame(data)

before_web = serialize_df_for_web(sample_df)

# Ground truth calculation
q1 = sample_df['Fare'].quantile(0.25)
q3 = sample_df['Fare'].quantile(0.75)
iqr = q3 - q1
expected_lower = q1 - 1.5 * iqr
expected_upper = q3 + 1.5 * iqr

result_df = user_solution(sample_df.copy())
after_web = serialize_df_for_web(result_df)

tests = []

# 1. Check max fare is clipped to expected_upper
actual_max = float(result_df['Fare'].max())
test1_passed = abs(actual_max - expected_upper) < 1e-4
tests.append({
    "test": "상한선 클리핑 정확도",
    "passed": test1_passed,
    "detail": f"변환 후 최대 요금: {round(actual_max, 2)} (예상 상한: {round(expected_upper, 2)})"
})

# 2. Check no values exceed upper or lower
outliers_count = int(((result_df['Fare'] > expected_upper + 1e-5) | (result_df['Fare'] < expected_lower - 1e-5)).sum())
test2_passed = (outliers_count == 0)
tests.append({
    "test": "이상치 잔존 여부 0건 검증",
    "passed": test2_passed,
    "detail": f"경계 이탈 이상치: {outliers_count}건"
})

# 3. Shape and Age column preservation
intact = result_df['Age'].equals(sample_df['Age']) and result_df.shape == sample_df.shape
tests.append({
    "test": "기타 컬럼 무결성 보존",
    "passed": intact,
    "detail": f"타 컬럼 변조 없음: {intact}"
})

all_passed = all(t['passed'] for t in tests)

return {
    "all_passed": all_passed,
    "before_df": before_web,
    "after_df": after_web,
    "results": tests
}
`
};
