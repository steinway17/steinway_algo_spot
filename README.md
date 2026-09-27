# 🚀 AlgoHarness (steinway_algo_spot)

> **브라우저 단독(Serverless)으로 동작하는 파이썬 알고리즘 학습 & 실시간 시각화 훈련소**  
> GitHub Pages를 통해 언제 어디서든 접속하여 알고리즘을 코딩하고, 실행 과정을 눈으로 확인하며 반복 체화(Drill)할 수 있는 플랫폼입니다.

---

## 🌟 핵심 기능

1. **무서버 브라우저 파이썬 샌드박스 (Pyodide Wasm)**
   - 백엔드 서버 없이 브라우저(WebAssembly)에서 CPython 3.12 런타임 구동
   - Web Worker 기반 격리 실행 및 **3.5초 타임아웃 킬러** (무한루프 시 탭 멈춤 없이 안전한 TLE 판정)
   - 프로그래머스 / LeetCode 스타일 `def solution(...)` 함수 인터페이스 및 자동 단언

2. **하이브리드 실시간 알고리즘 시각화 (Trace Engine)**
   - `sys.settrace` 훅으로 코드 라인별 변수 상태를 자동 캡처
   - **배열 & 투 포인터**: 막대 차트 + 포인터(`L`, `R`, `M`) 화살표 마커 + 자동 스크롤 추적
   - **BFS 미로 최단거리**: $N \times M$ 2D 격자 맵 실시간 탐색 애니메이션 (방문 파동, 큐 대기열, 현재 위치 핀)
   - **DFS 백트래킹**: 상태 공간 트리(Recursion Tree) 깊이별 분기 및 백트래킹 복귀 시각화
   - **스택 / 큐**: LIFO / FIFO 튜브 데이터 흐름

3. **4단계 반복 체화 스캐폴딩 루프 (Mastery Loop)**
   - **1단계 관찰 (Observe)**: 정답 알고리즘 실행과 시각화 흐름 관찰
   - **2단계 빈칸 훈련 (Faded Drill)**: 핵심 조건식, 포인터 이동 빈칸 채우기
   - **3단계 백지 구현 (Blank Slate)**: 빈 에디터에서 100% 자력 작성
   - **4단계 3분 스피드런 (Speedrun)**: 180초 타이머 내 무결점 AC 달성 시 마스터 👑 배지 획득

4. **대규모 효율성 검증 & 입력 크기 벤치마크 (Scale Benchmark)**
   - $N=30,000 \sim 100,000$ 대규모 테스트케이스로 $O(N^2)$ 나이브 코드 차단
   - 에디터 상단 `[Small (N≈20)]` / `[Medium (N≈1,000)]` / `[Large (N≈50,000)]` 스케일 선택 및 실시간 속도 계측

5. **심화 알고리즘 연계**
   - 상단 헤더 탭을 통해 **이분 매칭 & 증가 경로(Bipartite Matching & Augmenting Path)** 시각화 랩으로 즉시 이동 가능

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+), CodeMirror 5, Lucide Icons, Canvas Confetti
- **Runtime**: Pyodide (Python 3.12 WebAssembly) in Web Worker
- **Storage**: LocalStorage (문제별 진도율, 숙련도, 간격 복습 주기 저장)
- **Hosting**: GitHub Pages (100% Client-side Static SPA)

---

## 💻 로컬 실행 방법

별도의 복잡한 설치 없이 Python 내장 서버로 즉시 구동 가능합니다:

```bash
python3 -m http.server 8088
```
브라우저에서 `http://localhost:8088` 로 접속하세요.
