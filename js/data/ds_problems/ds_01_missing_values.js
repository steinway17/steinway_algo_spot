/**
 * Problem DS-01: 결측치 처리 (Groupby Transform Imputation)
 * From StudyVault: 01-데이터의 이해 / 결측치와 이상치 처리.md & Practice Question 9
 */

window.DS_PROBLEM_01 = {
  id: "ds_01_missing_values",
  title: "01. 그룹별 결측치 대체 (Groupby Transform Imputation)",
  category: "Part 1. 데이터의 이해",
  difficulty: "기초 (Lv.3 필수)",
  timeComplexity: "O(N)",
  visualizerType: "dataframe_diff",
  prerequisites: [],
  summary: "타이타닉 승객 등급(Pclass)별 연령 중앙값으로 Age 결측치를 정교하게 대체합니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      타이타닉 승객 데이터프레임 <code class="text-sky-300 font-mono">df</code>가 주어집니다.<br/>
      <code class="text-amber-300 font-mono">Age</code>(나이) 컬럼에는 다수의 결측치(NaN)가 포함되어 있습니다.<br/>
      전체 데이터의 단순 평균으로 대체하면 승객 등급별 특성이 왜곡되므로, 
      <strong>승객 등급(<code class="text-sky-300 font-mono">Pclass</code>)별 연령의 중앙값(median)</strong>을 계산하여 
      해당 등급의 결측치를 대체하는 함수를 작성하세요.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">핵심 도메인 & 알고리즘 메커니즘</h4>
    <p class="text-xs text-slate-400 mb-3 leading-relaxed">
      1등석(Pclass=1) 승객의 중위 연령(약 38세)과 3등석(Pclass=3) 승객의 중위 연령(약 24세)은 큰 차이를 보입니다.<br/>
      <code class="text-emerald-400 font-mono">df.groupby('Pclass')['Age'].transform(lambda x: x.fillna(x.median()))</code> 패턴을 사용하면 
      인덱스를 보존하면서 그룹별 통계량을 정확하게 원본 행 위치에 브로드캐스팅할 수 있습니다.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">제약 조건 및 반환값</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-0.5">
      <li>원본 DataFrame의 행 순서와 인덱스가 유지되어야 합니다.</li>
      <li><code class="font-mono">Age</code> 이외의 컬럼(<code class="font-mono">PassengerId, Survived, Pclass, Fare</code> 등)은 값이 변경되지 않아야 합니다.</li>
      <li>결측치가 대체된 <code class="font-mono">df</code>를 반환하세요.</li>
    </ul>
  `,
  solutionTemplate: `import pandas as pd
import numpy as np

def solution(df):
    """
    Pclass별 Age 중앙값으로 결측치를 대체합니다.
    """
    df['Age'] = df.groupby('Pclass')['Age'].transform(lambda x: x.fillna(x.median()))
    return df
`,
  blankTemplate: `import pandas as pd
import numpy as np

def solution(df):
    """
    Pclass별 Age 중앙값으로 결측치를 대체합니다.
    """
    # [빈칸 1] Pclass 컬럼으로 그룹화
    # [빈칸 2] 원본 크기/인덱스를 유지하며 그룹별 연산을 적용하는 메서드는?
    # [빈칸 3] 그룹 내 결측치를 해당 그룹의 중앙값으로 채우는 람다 함수는?
    df['Age'] = df./* BLANK_1 */['Age']./* BLANK_2 */(lambda x: /* BLANK_3 */)
    return df
`,
  blankAnswers: {
    BLANK_1: "groupby('Pclass')",
    BLANK_2: "transform",
    BLANK_3: "x.fillna(x.median())"
  },
  blankHints: [
    "BLANK_1: 승객 등급별로 묶어야 하므로 `groupby('Pclass')`를 호출합니다.",
    "BLANK_2: groupby 집계 후 원본 행 개수를 그대로 유지하며 매핑하려면 `transform`을 사용합니다.",
    "BLANK_3: 각 그룹 시리즈 x의 결측치를 x의 중앙값으로 채우므로 `x.fillna(x.median())`입니다."
  ],
  examTraps: [
    {
      type: "ox",
      question: "실제 머신러닝 파이프라인에서 Test 셋의 결측치를 채울 때도 Test 셋 자체의 groupby 중앙값을 계산하여 채워야 한다.",
      answer: "X",
      trapPoint: "데이터 누수(Data Leakage)의 대표적인 발생 원인으로 실기 감점 1순위!",
      explanation: "Test 데이터셋의 통계량이 전처리에 반영되면 미래의 정보를 엿보는 Data Leakage가 발생합니다. Train 셋에서 산출한 그룹별 통계량(Dictionary 매핑 등)을 Test 셋에 그대로 적용해야 합니다.",
      codeSnippet: "# Train 통계량으로 딕셔너리 생성 후 Test에 매핑\npclass_medians = train_df.groupby('Pclass')['Age'].median().to_dict()\ntest_df['Age'] = test_df['Age'].fillna(test_df['Pclass'].map(pclass_medians))"
    },
    {
      type: "ox",
      question: "df.groupby('Pclass')['Age'].apply(lambda x: x.median())를 호출하면 원본 행 수와 동일한 크기의 시리즈가 반환된다.",
      answer: "X",
      trapPoint: "apply vs transform의 반환 shape 차이",
      explanation: "집계 함수(median, mean 등)를 apply나 agg로 호출하면 그룹 개수(Pclass 3개)만큼의 축소된 Series가 반환됩니다. 원본 인덱스 길이를 유지하며 브로드캐스팅하려면 반드시 `transform`을 사용해야 합니다.",
      codeSnippet: "# shape: (3,) -> 그룹 수만큼 축소\ndf.groupby('Pclass')['Age'].mean()\n\n# shape: (N,) -> 원본 행 수 유지\ndf.groupby('Pclass')['Age'].transform('mean')"
    }
  ],
  benchmarkScales: {
    small: {
      name: "Mini Sample (N=15)",
      description: "15개 행 결측치 전/후 시각화"
    },
    medium: {
      name: "Titanic Standard (N=891)",
      description: "실제 타이타닉 데이터셋 규모"
    },
    large: {
      name: "Large Scale (N=50,000)",
      description: "5만 건 대용량 transform 성능 검증"
    }
  },
  validationCode: `
# Prepare sample Titanic dataset with known ground truth
data = {
    'PassengerId': list(range(1, 16)),
    'Pclass': [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3],
    'Age': [38.0, None, 45.0, None, 50.0, 29.0, None, 31.0, None, 25.0, 22.0, None, 26.0, None, 20.0],
    'Fare': [71.28, 53.10, 80.0, 110.88, 26.55, 30.0, 13.0, 21.0, 15.04, 27.75, 7.25, 8.05, 8.45, 7.92, 8.05],
    'Survived': [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1]
}
sample_df = pd.DataFrame(data)

# Capture Before state
before_web = serialize_df_for_web(sample_df)

# Execute user solution on a fresh copy
result_df = user_solution(sample_df.copy())

# Capture After state
after_web = serialize_df_for_web(result_df)

# Assertions
tests = []

# 1. Age Null count is 0
age_nulls = int(result_df['Age'].isnull().sum())
test1_passed = (age_nulls == 0)
tests.append({
    "test": "결측치 완전 제거 검증",
    "passed": test1_passed,
    "detail": f"Age 결측치 수: {age_nulls}개 (목표: 0개)"
})

# 2. Pclass 1 median check (known medians: Pclass 1 -> 45.0, Pclass 2 -> 29.0, Pclass 3 -> 22.0)
p1_val = result_df.loc[1, 'Age'] # was None, should be 45.0
p2_val = result_df.loc[6, 'Age'] # was None, should be 29.0
p3_val = result_df.loc[11, 'Age'] # was None, should be 22.0

test2_passed = (p1_val == 45.0 and p2_val == 29.0 and p3_val == 22.0)
tests.append({
    "test": "등급별 중앙값 정확도 검증",
    "passed": test2_passed,
    "detail": f"Pclass 1: {p1_val} (예상: 45.0), Pclass 2: {p2_val} (예상: 29.0), Pclass 3: {p3_val} (예상: 22.0)"
})

# 3. Shape & other columns unchanged
shape_match = (result_df.shape == (15, 5))
other_cols_intact = (result_df['Fare'].equals(sample_df['Fare']))
test3_passed = shape_match and other_cols_intact
tests.append({
    "test": "데이터 왜곡 및 형상 보존 검증",
    "passed": test3_passed,
    "detail": f"Shape: {result_df.shape}, 타 컬럼 보존 여부: {other_cols_intact}"
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
