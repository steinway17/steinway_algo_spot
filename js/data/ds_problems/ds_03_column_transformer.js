/**
 * Problem DS-03: 전처리 파이프라인 (ColumnTransformer Preprocessing)
 * From StudyVault: 01-데이터의 이해 / 데이터 변환.md & Exam Traps.md
 */

window.DS_PROBLEM_03 = {
  id: "ds_03_column_transformer",
  title: "03. 혼합 피처 전처리 파이프라인 (ColumnTransformer)",
  category: "Part 1. 데이터의 이해",
  difficulty: "중급 (Lv.3 핵심)",
  timeComplexity: "O(N * M)",
  visualizerType: "dataframe_diff",
  prerequisites: ["ds_01_missing_values", "ds_02_iqr_outliers"],
  summary: "수치형은 StandardScaler, 범주형은 OneHotEncoder로 묶는 통합 전처리기를 구축합니다.",
  description: `
    <h3 class="text-sm font-bold text-slate-200 mb-2">문제 설명</h3>
    <p class="text-xs text-slate-300 mb-3 leading-relaxed">
      실무 데이터셋은 연속형(수치형) 변수와 이산형(범주형) 변수가 혼재되어 있습니다.<br/>
      이를 수동으로 각각 인코딩하고 결합하면 코드가 번잡해지고 Test 셋 적용 시 누수(Leakage) 위험이 커집니다.<br/>
      <code class="text-sky-300 font-mono">scikit-learn</code>의 <strong><code class="text-indigo-400 font-mono">ColumnTransformer</code></strong>를 사용하여, 
      수치형 변수는 <strong><code class="text-emerald-400 font-mono">StandardScaler</code></strong>로 표준화하고, 
      범주형 변수는 <strong><code class="text-purple-400 font-mono">OneHotEncoder</code></strong>로 원-핫 인코딩하는 일체형 전처리기를 구성하는 함수를 작성하세요.
    </p>

    <h4 class="text-xs font-bold text-slate-300 mb-1">전처리 세부 지침</h4>
    <ul class="text-xs text-slate-400 list-disc list-inside mb-3 space-y-1">
      <li>수치형 컬럼: <code class="font-mono text-sky-300">['Age', 'Fare']</code> ➜ <code class="font-mono text-emerald-300">StandardScaler()</code> 적용</li>
      <li>범주형 컬럼: <code class="font-mono text-sky-300">['Sex', 'Embarked']</code> ➜ <code class="font-mono text-purple-300">OneHotEncoder(handle_unknown='ignore', sparse_output=False)</code> 적용</li>
      <li>나머지 컬럼은 제외(<code class="font-mono text-slate-400">remainder='drop'</code>)합니다.</li>
      <li>변환된 배열을 컬럼명을 포함한 <strong>DataFrame</strong> 형태로 반환하세요.</li>
    </ul>
  `,
  solutionTemplate: `import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

def solution(df):
    """
    수치형은 StandardScaler, 범주형은 OneHotEncoder로 변환한 DataFrame을 반환합니다.
    """
    num_cols = ['Age', 'Fare']
    cat_cols = ['Sex', 'Embarked']
    
    ct = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols)
        ],
        remainder='drop'
    )
    
    transformed_array = ct.fit_transform(df)
    
    # 변환된 피처 이름 생성
    cat_features = list(ct.named_transformers_['cat'].get_feature_names_out(cat_cols))
    output_columns = num_cols + cat_features
    
    return pd.DataFrame(transformed_array, columns=output_columns)
`,
  blankTemplate: `import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

def solution(df):
    """
    수치형은 StandardScaler, 범주형은 OneHotEncoder로 변환한 DataFrame을 반환합니다.
    """
    num_cols = ['Age', 'Fare']
    cat_cols = ['Sex', 'Embarked']
    
    # [빈칸 1, 2] 수치형 스케일러와 원-핫 인코더 생성
    ct = ColumnTransformer(
        transformers=[
            ('num', /* BLANK_1 */, num_cols),
            ('cat', /* BLANK_2 */, cat_cols)
        ],
        remainder='drop'
    )
    
    # [빈칸 3] DataFrame에 대해 적합 및 변환 동시 수행
    transformed_array = /* BLANK_3 */
    
    cat_features = list(ct.named_transformers_['cat'].get_feature_names_out(cat_cols))
    output_columns = num_cols + cat_features
    
    return pd.DataFrame(transformed_array, columns=output_columns)
`,
  blankAnswers: {
    BLANK_1: "StandardScaler()",
    BLANK_2: "OneHotEncoder(handle_unknown='ignore', sparse_output=False)",
    BLANK_3: "ct.fit_transform(df)"
  },
  blankHints: [
    "BLANK_1: 수치형 평균 0, 분산 1 변환기는 `StandardScaler()`입니다.",
    "BLANK_2: 미확인 범주 무시 옵션과 밀집 행렬 반환 옵션을 갖는 `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`입니다.",
    "BLANK_3: 파이프라인 객체에 데이터를 학습시키고 변환 행렬을 받는 메서드는 `ct.fit_transform(df)`입니다."
  ],
  examTraps: [
    {
      type: "ox",
      question: "OneHotEncoder에서 handle_unknown='ignore' 옵션을 생략하면, Test 데이터에 Train에 없던 신규 범주가 나타났을 때 ValueError가 발생한다.",
      answer: "O",
      trapPoint: "실기 시험 환경에서 예측(predict) 단계 모델 붕괴 1순위!",
      explanation: "정답은 O입니다! 기본값(handle_unknown='error') 상태에서는 테스트 셋에 사소한 오타나 미지의 카테고리가 1건만 있어도 예외가 발생하며 스크립트 실행이 중단됩니다. 반드시 'ignore'를 지정해야 안전하게 0 벡터로 처리됩니다.",
      codeSnippet: "OneHotEncoder(handle_unknown='ignore', sparse_output=False)"
    },
    {
      type: "ox",
      question: "scikit-learn의 StandardScaler는 표본표준편차(ddof=1)로 나누어 z-score를 계산한다.",
      answer: "X",
      trapPoint: "ddof 모편차 vs 표본편차 함정 (삼성 DX 실기 및 필기 단골)",
      explanation: "StandardScaler는 pandas의 std() (기본 ddof=1)와 달리, numpy의 std()처럼 모집단 표준편차(ddof=0, 자유도 n)를 사용하여 분산을 계산합니다. 따라서 pandas로 직접 (x - mean) / std를 계산하면 미세한 차이가 발생합니다.",
      codeSnippet: "# scikit-learn 내부 공식: ddof=0\nscale = np.sqrt(np.mean((X - mean) ** 2))"
    }
  ],
  benchmarkScales: {
    small: { name: "Mini Sample (N=15)", description: "원-핫 인코딩 확장 전/후 시각화" },
    medium: { name: "Standard (N=1,000)", description: "1,000건 스케일링 & 원-핫" },
    large: { name: "Large (N=50,000)", description: "5만 건 고속 파이프라인" }
  },
  validationCode: `
data = {
    'PassengerId': list(range(1, 16)),
    'Age': [22.0, 38.0, 26.0, 35.0, 35.0, 54.0, 2.0, 27.0, 14.0, 4.0, 58.0, 20.0, 39.0, 14.0, 55.0],
    'Fare': [7.25, 71.28, 7.92, 53.1, 8.05, 51.86, 21.07, 11.13, 30.07, 16.7, 26.55, 8.05, 31.27, 26.55, 53.1],
    'Sex': ['male', 'female', 'female', 'female', 'male', 'male', 'male', 'male', 'female', 'female', 'female', 'male', 'male', 'female', 'male'],
    'Embarked': ['S', 'C', 'S', 'S', 'S', 'Q', 'S', 'S', 'C', 'S', 'S', 'S', 'S', 'C', 'S']
}
sample_df = pd.DataFrame(data)

before_web = serialize_df_for_web(sample_df)

result_df = user_solution(sample_df.copy())
after_web = serialize_df_for_web(result_df)

tests = []

# 1. Output shape check
# num_cols (2) + Sex (2: male, female) + Embarked (3: C, Q, S) = 7 columns
has_correct_shape = (result_df.shape[0] == 15 and result_df.shape[1] >= 6)
tests.append({
    "test": "변환 행렬 차원(Shape) 검증",
    "passed": has_correct_shape,
    "detail": f"출력 Shape: {result_df.shape} (기대: 15행, 최소 6열 이상)"
})

# 2. StandardScaler zero mean check for Age & Fare
age_mean = float(result_df['Age'].mean())
fare_mean = float(result_df['Fare'].mean())
is_standardized = abs(age_mean) < 1e-4 and abs(fare_mean) < 1e-4
tests.append({
    "test": "StandardScaler 평균 0 수렴 검증",
    "passed": is_standardized,
    "detail": f"Age 평균: {round(age_mean, 6)}, Fare 평균: {round(fare_mean, 6)}"
})

# 3. OneHot columns generated
has_cat_cols = any('Sex' in col or 'male' in col for col in result_df.columns)
tests.append({
    "test": "OneHot 인코딩 컬럼 생성 검증",
    "passed": has_cat_cols,
    "detail": f"생성된 컬럼 목록: {list(result_df.columns)}"
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
