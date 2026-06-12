# 모의고사 리포트 데이터 아키텍처

기록(History) 탭 → 상세(Detail) 리포트 화면을 fixture에서 실데이터로 전환하기 위한
수집 → 동기화 → 분석 → 표시 계약 정의.

- 화면 설계는 완료된 상태이며(`src/screens/ReportDetailScreen.tsx`), 이 문서는 그 화면을
  성립시키는 데이터 파이프라인을 정의한다. 화면 표현 규칙은
  [mock-exam-report-screen.md](./mock-exam-report-screen.md)를 따른다.
- 점수·피드백 산출은 별도 Python 분석 서버가 담당한다. 앱은 서버와 직접 통신하지 않고
  **Supabase만 바라본다**. 이 문서의 5장이 분석 서버가 준비해야 할 입출력 명세다.

## 1. 표시 원칙

리포트 화면의 모든 표시는 아래 원칙을 따른다. (근거: 7장)

| 원칙 | 내용 |
| --- | --- |
| 실데이터 우선 | 측정하지 않은 값은 보여주지 않는다. 분석 전이면 "분석 중" 상태를 정직하게 노출한다. |
| 자기 비교 우선 | 1차 비교 기준은 본인 과거 기록(회차 추세·개인 최고). 또래 비교는 보조이며 코호트 표본이 충분할 때만 켠다. |
| 백분위 + 원점수 이원 | 또래 내 위치는 백분위로, 시계열 추적은 원점수로 표현한다. |
| 수치 주장에는 근거 표기 | 백분위·표본 수(N)·상관계수 등 통계 수치는 서버가 산출한 실제 값과 함께만 노출한다. 하드코딩 금지. |
| 점수 뒤에 다음 행동 | 모든 약점 표시는 "무엇을 하면 되는지"(훈련할 게임·딥링크)와 짝을 이룬다. |
| 불확실성 표시 | 종합·역량 점수는 단일 값이 아닌 범위(`score_range`)를 함께 받는다. 표시 여부는 화면에서 결정한다. |
| 수량은 막대, 레이더는 보조 | 수치 판독은 막대(불릿)가 담당한다. 레이더는 형태 인상용 보조로만 유지한다. |
| 작동하지 않는 UI 숨김 | 기능이 연결되기 전의 버튼·카드(알림 리마인드 등)는 렌더링하지 않는다. |

## 2. 전체 데이터 흐름

```
[앱: 모의고사 진행]
  게임 9종 + 면접 → SQLite (local-first, 원시 기록)
        │  outbox 동기화 (silent, upsert onConflict:id)
        ▼
[Supabase: 원시 데이터]
  game_results / game_result_rounds / mock_exam_results /
  mock_exam_result_items / interview_sessions / interview_answers
  + Storage: 면접 미디어 (server-confirmed 업로드)
        │  트리거 (webhook 또는 폴링) ── mock_exam_results insert 시
        ▼
[Python 분석 서버]
  원시 데이터 조회 → NCS·AI-HUB 기반 산출 → 결과 기록
        │
        ▼
[Supabase: 분석 결과]
  mock_exam_reports (status: pending → done)
        │  server read (React Query)
        ▼
[앱: 리포트 화면 렌더]
```

데이터 분류(AGENTS.md > Data 규칙과의 대응):

| 데이터 | 분류 | 처리 |
| --- | --- | --- |
| 게임·모의고사 원시 기록 | local-first | SQLite가 source of truth. outbox로 silent 동기화. 동기화 실패가 UI를 막지 않는다. |
| 면접 미디어(음성/영상) | server-confirmed | 명시적 업로드 상태(로딩·실패·재시도)를 가진다. 분석의 입력이므로 유실되면 안 된다. |
| 분석 결과(`mock_exam_reports`) | server read | React Query로 조회. `pending` 동안 폴링 또는 Realtime 구독. |

## 3. 수집 사양 (앱)

### 3-1. 현재 수집되는 것 (유지)

| 테이블 | 컬럼 | 비고 |
| --- | --- | --- |
| `game_results` | game_id, score, accuracy, avg_response_ms, mock_exam_id | 게임당 집계 1행 |
| `mock_exam_results` | score(10항목 평균), duration_ms, pro | 회차당 1행. id = 세션 id |
| `interview_sessions` | company, role, score, question_count, duration_ms, mock_exam_id | 점수는 분석 서버 결과로 대체 예정 |

### 3-2. 신규 수집 (로컬 스키마 v8)

#### `game_result_rounds` — 게임 라운드 이벤트 (P0)

거의 모든 분석(난이도별 한계, 속도-정확도, 오답 후 회복, NCS 역량 매핑)의 원천.
현재 라운드별 반응시간·정오답은 메모리에서 평균으로 붕괴 후 폐기된다
(`useRoundPlay.ts`의 `choose()` → `onComplete`).

```sql
CREATE TABLE game_result_rounds (
  id TEXT PRIMARY KEY NOT NULL,          -- 클라이언트 UUID
  result_id TEXT NOT NULL,               -- game_results.id
  user_id TEXT NOT NULL,
  round_index INTEGER NOT NULL,          -- 1부터
  correct INTEGER NOT NULL,              -- 0 | 1
  response_ms INTEGER NOT NULL,
  level_params TEXT,                     -- JSON, 게임별 난이도 파라미터 (아래 표)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  synced INTEGER NOT NULL DEFAULT 0
);
```

`level_params` 게임별 사양 (P0 구현 기준 — 분석 서버는 이 키만 가정):

| game_id | level_params |
| --- | --- |
| numbers | `{"digits": 4~7}` — 라운드별 수열 자릿수 |
| memory | `{"n_back": 2 또는 3}` — n-back 문항. 차이 찾기 문항은 null |
| 나머지 7종 | null (라운드별 난이도 변화 없음 — 생기면 동일 패턴으로 확장) |

수집 위치: `useRoundPlay.choose()`(공용 훅 사용 게임 7종)와 `PathPlay`/`RotatePlay`의
자체 응답 처리 지점. `onFinish(GameResultInput)`에 `rounds` 배열을 동봉하고
`completeMockExamGameItem`에서 `game_results`와 같은 트랜잭션으로 저장한다.

#### `mock_exam_result_items` — 회차 항목 기록 영속화 (P0)

현재 `mock_exam_session_items`는 회차 완료 시 삭제된다
(`mockExamSessions.ts > finalizeMockExamSessionIfComplete`). 삭제하지 않고 결과
테이블로 이관해 항목 순서·항목 간 간격(이어하기 여부)을 보존한다.

```sql
CREATE TABLE mock_exam_result_items (
  mock_exam_id TEXT NOT NULL,
  item_key TEXT NOT NULL,                -- GameId | 'interview'
  user_id TEXT NOT NULL,                 -- outbox 조회·서버 RLS용
  result_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  completed_at TEXT NOT NULL,            -- 세션 item의 created_at 그대로
  synced INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (mock_exam_id, item_key)
);
```

#### `interview_answers` — 면접 문항 단위 기록 + 미디어 (P1)

현재 면접은 녹음·녹화가 없고 타이머만 동작한다(`InterviewFlowScreen.tsx`).
1차 범위는 **음성 녹음**(expo-audio), 시선·표정 분석용 영상은 Pro 단계에서 후행.

```sql
CREATE TABLE interview_answers (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL,              -- interview_sessions.id
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT NOT NULL,                -- 오프닝/지원 동기/경험/...
  prep_ms INTEGER NOT NULL,              -- 준비 시간
  answer_ms INTEGER NOT NULL,            -- 답변 시간
  retake_count INTEGER NOT NULL DEFAULT 0,
  media_path TEXT,                       -- Storage 경로. 업로드 성공 후 기록
  media_status TEXT NOT NULL DEFAULT 'none',  -- none | uploading | uploaded | failed
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  synced INTEGER NOT NULL DEFAULT 0
);
```

- 미디어 Storage 경로 규약: `interview-media/{user_id}/{session_id}/{question_id}.m4a`
- 미디어 업로드는 server-confirmed: 실패 시 사용자에게 보이는 재시도 UI를 가진다.
  메타데이터 행(`interview_answers`)은 local-first로 즉시 저장하고, `media_status`만
  업로드 결과에 따라 갱신한다.
- `company`/`role`/이력서·공고 텍스트는 현재 fixture(`mockJobPosting`)다. 질문 생성과
  매칭 분석이 성립하려면 resume/job 단계의 실제 입력을 함께 전송해야 한다(P1,
  별도 테이블 `interview_contexts` 또는 `interview_sessions` 컬럼 확장으로 후속 결정).

#### 프로필 코호트 (P2)

또래 백분위의 코호트 정의용. 선택 입력 + 동의 플로우 전제.

- `profiles.birth_year_band` (예: "1995-1999"), `profiles.target_job_family` (NCS 직군)

### 3-3. 모의고사 단계별 수집 매핑

| 단계 | 이벤트 | 기록 |
| --- | --- | --- |
| 게임 라운드 응답 | `choose()` | `game_result_rounds` 1행 (메모리 적립 → 게임 종료 시 일괄 insert) |
| 게임 종료 | `onFinish` | `game_results` 1행 + rounds 일괄 + `mock_exam_session_items` |
| 면접 질문 준비 시작 | record 진입 | `prep_ms` 측정 시작 |
| 면접 답변 녹음 | `startRecording`/`stopRecording` | 음성 파일 생성, `answer_ms` |
| 면접 재응답 | `retakeAnswer` | `retake_count` 증가, 기존 미디어 교체 |
| 면접 종료 | `openFeedback` | `interview_sessions` + `interview_answers` N행 + 미디어 업로드 시작 |
| 회차 완료 | `finalizeMockExamSessionIfComplete` | `mock_exam_results` 1행 + `mock_exam_result_items` 이관 (삭제 금지) |
| 저장 직후/로그인/포그라운드 | sync 트리거 | 신규 테이블 모두 기존 outbox 패턴으로 push |

## 4. 표시 사양 (리포트 화면 섹션 계약)

각 섹션이 소비하는 데이터 소스와 분석 결과 미도착 시의 폴백.
`report.*`는 5장의 `mock_exam_reports.report` JSON을 가리킨다.

| 섹션 | 데이터 소스 | 폴백 (report 없음/pending) | 단계 |
| --- | --- | --- | --- |
| 1. 커버 (종합) | `report.overall` (score, band, range, summary) | 로컬 `mock_exam_results.score` + "분석 중" 배지 | P0 |
| 2. 게임별 결과 (신설) | 로컬 `game_results` (mock_exam_id 조회) + `report.games[].insight` | 로컬 값만으로 완전 동작 — 폴백 불필요 | **P0, 서버 불필요** |
| 3. 5대 역량 | `report.competencies[]` — 불릿형 행(점수 막대 + peer_median 마커 + 백분위) | 섹션 자체를 "분석 중" 상태로 | P1 |
| 4. 강점·약점 Top 3 | `report.highlights` — 각 약점에 훈련 딥링크(`action`) | 로컬 게임별 점수 상·하위 3개로 임시 구성 가능 | P0(로컬), P1(서버) |
| 5. AI 면접 피드백 | `report.interview` | 실측치만 표시(답변 시간·재응답 수) + "분석 준비 중" | P1 |
| 6. 스트레스 복원력 (Pro) | `report.resilience` (rounds 기반 산출) | 잠금 + "분석 중" | P2 |
| 7. 응답 패턴 (Pro) | `report.response_pattern` | 잠금 + "분석 중" | P2 |
| 8. 또래 비교·성장 | 추세는 로컬 records, 백분위는 `report.overall.percentile` + `cohort` | 추세만 표시. percentile null이면 또래 카드 숨김 | P0(추세), P2(백분위) |
| 9. AI 코치 (Pro) | `report.coach` (약점 게임 기반 동적 플랜) | 잠금 + "분석 중" | P1 |

화면 전환 규칙:

- 모든 fixture 상수(`stressValues`, `responseScales`, `coachPlan`, `reportCompetencies`,
  `reportStrengths`, `reportGrowthAreas`, `peerPercentiles`, `interviewSession.ts` 전체)는
  report payload 소비로 대체하고 삭제한다.
- 하드코딩 수치 문구("또래 대비 상위 28%", "N=12,400", "r=0.28-0.38", "240문항")는
  서버 값 또는 실제 설정값에서 파생되지 않는 한 제거한다.
- pending 상태의 섹션은 스켈레톤이 아닌 명시적 "분석 중" 상태로 표시한다
  (레이아웃 안정 규칙 준수 — 실제 컴포넌트와 동일 높이).

## 5. 분석 서버 계약 (API 명세)

### 5-1. 입력 — 분석 서버가 Supabase에서 읽는 원시 테이블

분석 단위는 `mock_exam_id` 하나. 아래 테이블을 `mock_exam_id`(또는
`session_id → mock_exam_id`)로 조회하면 한 회차의 전체 원시 데이터가 모인다.

| 테이블 | 행 수(회차당) | 핵심 컬럼 |
| --- | --- | --- |
| `mock_exam_results` | 1 | id, user_id, score(클라 평균·참고용), duration_ms, created_at |
| `mock_exam_result_items` | 10 | item_key, score, duration_ms, completed_at |
| `game_results` | 9 | game_id, score, accuracy, avg_response_ms |
| `game_result_rounds` | 게임당 8~20 | round_index, correct, response_ms, level_params |
| `interview_sessions` | 1 | company, role, question_count, duration_ms |
| `interview_answers` | 8 | question_id, question_text, category, prep_ms, answer_ms, retake_count, media_path |
| Storage `interview-media/` | 8 파일 | 음성(.m4a), 추후 영상 |

### 5-2. 트리거

권장: `mock_exam_results` insert에 대한 Supabase Database Webhook → 분석 서버 엔드포인트
호출. (대안: 분석 서버가 `mock_exam_reports`가 없는 `mock_exam_results`를 주기 폴링.)

- 분석 서버는 수신 즉시 `mock_exam_reports`에 `status='processing'` 행을 upsert한다.
- 게임 분석과 면접 분석(STT·음성 피처)은 소요 시간이 다르므로 **부분 완료를 허용**한다:
  `report.interview.status`가 별도로 `pending → done`으로 전이할 수 있다.
- 멱등성: `(mock_exam_id, report_version)` 기준 upsert. 재분석은 version 증가.

### 5-3. 출력 — `mock_exam_reports` 테이블

```sql
CREATE TABLE mock_exam_reports (
  mock_exam_id UUID PRIMARY KEY REFERENCES mock_exam_results(id),
  user_id UUID NOT NULL,
  status TEXT NOT NULL,                  -- processing | done | failed
  report_version INTEGER NOT NULL DEFAULT 1,
  report JSONB,                          -- 아래 스키마. status='done' 또는 부분 완료 시 채움
  error TEXT,                            -- status='failed' 시
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS: user_id = auth.uid() 읽기 전용. 쓰기는 분석 서버(service role)만.
```

앱 조회: `select * from mock_exam_reports where mock_exam_id = ?`
(React Query, `status != 'done'`이면 폴링 또는 Realtime 구독)

### 5-4. `report` JSON 스키마

키 명칭은 앱 도메인 타입과 정렬되어 있다
(GameId: `rps|rotate|promise|potion|path|numbers|memory|cat|compare`,
역량 key: `trust|strategy|relationship|value|fit`,
면접 축 key: `content|star|voice|gaze|delivery`).

```jsonc
{
  "overall": {
    "score": 76,                      // 0-100, 서버 가중 모델 (클라 단순평균 대체)
    "score_range": [71, 81],          // 측정 불확실성 (없으면 [score, score])
    "band": "good",                   // poor | fair | good | excellent
    "summary": "시간 압박 게임에서 안정적으로 수행했어요.",  // can-do형 한 줄
    "percentile": 72,                 // 코호트 표본 미충족 시 null
    "cohort": { "n": 1240, "label": "전체 사용자" }          // percentile null이면 null
  },

  "competencies": [
    {
      "key": "trust",
      "score": 82,
      "score_range": [78, 86],
      "percentile": 88,               // null 허용
      "peer_median": 70,              // 불릿 차트 기준 마커. null 허용
      "note": "책임감·윤리 판단"      // 한 줄 설명
    }
    // ... 5개 (trust, strategy, relationship, value, fit)
  ],

  "games": [
    {
      "game_id": "numbers",
      "insight": "6자리부터 정답률이 떨어졌어요.",   // 라운드 데이터 기반 한 줄. null 허용
      "percentile": null                              // P2에서 게임별 또래 비교
    }
    // ... 9개. score/accuracy/avg_response_ms는 앱이 로컬에서 직접 읽음 — 중복 전송 안 함
  ],

  "highlights": {
    "strengths": [
      { "game_id": "compare", "skill": "Subitizing", "score": 88,
        "note": "크기 착시를 억제하고 개수만 추정했어요." }
      // 3개
    ],
    "growth_areas": [
      { "game_id": "numbers", "skill": "Digit Span 역순", "score": 63,
        "note": "6자리 이상에서 정답률이 낮아졌어요.",
        "action": { "game_id": "numbers", "level_label": "5자리", "minutes": 10 } }
      // 3개. action = "지금 훈련" 딥링크 재료
    ]
  },

  "resilience": {                     // P2. rounds 기반. 준비 전이면 null
    "curve": [
      { "game_id": "rps", "segment": 1, "value": 72 }
      // 게임×난이도 구간별 수행도 (현 stressValues 27포인트의 실측판)
    ],
    "insights": [
      { "tone": "warning", "label": "수행 하락 구간",
        "title": "도형 순서 후반에서 12점 하락", "body": "..." },
      { "tone": "positive", "label": "복원력",
        "title": "오답 직후 회복 빠름", "body": "..." }
    ]
  },

  "response_pattern": {               // P2. rounds 기반. 준비 전이면 null
    "scales": [
      { "key": "deliberation", "left": "신중함", "right": "직관", "value": 72 },
      { "key": "speed_accuracy", "left": "속도", "right": "정확도", "value": 40 },
      { "key": "risk", "left": "리스크 회피", "right": "리스크 감수", "value": 65 },
      { "key": "flexibility", "left": "고정관념", "right": "유연성", "value": 78 }
    ]
  },

  "coach": {
    "insight": {
      "title": "메타인지·귀납 추론이 강해요.",
      "body": "숫자와 N-back은 짧게 반복하는 훈련을 권장해요."
    },
    "plan": [
      { "day_range": "1-3일", "game_id": "numbers",
        "level_label": "5자리", "minutes_per_day": 10 }
      // 약점 게임 기반 동적 생성. 마지막 항목은 game_id 대신 "mock-exam" 허용
    ]
  },

  "interview": {
    "status": "done",                 // pending | done | failed — 게임 분석과 독립 전이
    "overall_score": 72,
    "band": "우수",                    // 부족 | 필요 | 우수 | 완성
    "axes": [
      { "key": "content", "score": 76, "peer_avg": 70 }   // peer_avg null 허용
      // ... 5개
    ],
    "ncs_units": [
      { "label": "요구사항 확인", "score": 82 }
      // 직군별 NCS 능력단위. 개수 가변
    ],
    "top_fixes": [
      { "axis": "star", "title": "결과(Result)로 마무리하기",
        "body": "답변 4개에서 결과가 빠졌어요. ...", "pro": false }
      // 최대 3개
    ],
    "questions": [
      {
        "question_id": "q1",
        "category": "오프닝",
        "text": "1분 안에 자기소개를 부탁드려요.",
        "scores": { "content": 78, "star": 60, "voice": 86, "gaze": 74, "delivery": 82 },
        "transcript": "안녕하세요. 3년 차 ...",        // STT 결과
        "good": "말 속도가 안정적이고 ...",
        "fix": "강점을 직무 요건과 연결하면 ...",
        "why": "면접 도입 — 첫인상과 전달력 확인"
      }
      // 문항 수만큼. gaze/delivery는 영상 분석 전까지 null 허용
    ],
    "delivery_details": [             // Pro. 영상 분석 전 null
      { "label": "표정 안정", "value": 78 }
    ]
  }
}
```

null 정책 요약: **모든 또래 비교 값(percentile, peer_median, peer_avg, cohort)과
P2 블록(resilience, response_pattern, delivery_details)은 null 허용**이며, 앱은
null이면 해당 표시를 숨기거나 자기 비교로 폴백한다. 점수·등급·인사이트 텍스트는
status='done'이면 필수.

## 6. 단계별 도입

| 단계 | 앱 | 분석 서버 |
| --- | --- | --- |
| **P0** | v8 마이그레이션(`game_result_rounds`, `mock_exam_result_items`) + 라운드 수집 + 항목 보존. 게임별 결과 섹션 신설(로컬 데이터). 하드코딩 통계 문구 제거. 면접 fixture 표시 제거 → 실측치 + "준비 중". Top3를 로컬 게임 점수로 임시 구성 | (없음 — 데이터 축적 시작) |
| **P1** | `mock_exam_reports` 조회 + 섹션별 pending 상태. 역량 불릿 차트. 면접 음성 녹음·업로드 + `interview_answers` | webhook 수신, overall/competencies/highlights/coach 산출, 면접 STT·음성 축(content/star/voice) 분석 |
| **P2** | 또래 백분위 표시 + 코호트 프로필 입력. Pro 섹션(복원력·응답 패턴) 실데이터 전환. 면접 영상(gaze/delivery) | rounds 기반 resilience/response_pattern, 코호트 분포 집계, 영상 분석 |

## 7. 근거 (요약)

- 백분위 기본 + 원점수는 추세용: [PMC8485114](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8485114/), TOEIC 리포트 관행([ETS](https://www.ets.org/toeic/resources/scores/score-use.html))
- 자기 비교 우선, 또래는 검증된 지표만: Apple Fitness([Cardio Fitness](https://support.apple.com/en-us/108790)), WHOOP 개인 베이스라인([Trend Views](https://www.whoop.com/us/en/thelocker/track-progress-with-new-trend-views/))
- 점수 + 다음 행동(Feed Forward): [Hattie & Timperley 2007](https://journals.sagepub.com/doi/abs/10.3102/003465430298487), 자아 초점 피드백의 역효과: [Kluger & DeNisi 1996](https://mrbartonmaths.com/resourcesnew/8.%20Research/Marking%20and%20Feedback/The%20effects%20of%20feedback%20interventions.pdf)
- 레이더 차트의 한계와 불릿 대안: [Observable](https://observablehq.com/blog/avoid-radar-charts), [Bullet graph](https://en.wikipedia.org/wiki/Bullet_graph)
- 점수 리포트 설계 프레임워크(불확실성 전달 포함): Hambleton & Zenisky([NCME ch.13](https://ncme.org/wp-content/uploads/2026/01/Educational-Measurement-Fifth-Edition-Chapter-13.pdf)), [AERA/APA/NCME Standards 2014](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf)
- 국내 리포트 관행(등급·신뢰도 표기·시간축 면접 분석): 잡다 역검([결과표 예시](https://www.jobda.im/acca/sampleResult)), 뷰인터([분석 결과 가이드](https://blog.genesislab.ai/?p=11261))

## 관련 코드

- 표시: `src/screens/ReportDetailScreen.tsx`, `src/components/interview/FeedbackReportBody.tsx`, `src/components/reports/ReportCharts.tsx`
- 수집: `src/components/games/useRoundPlay.ts`, `src/screens/InterviewFlowScreen.tsx`, `src/data/local/mockExamSessions.ts`
- 동기화: `src/data/sync/*.ts` (outbox 패턴 — 신규 테이블도 동일 패턴 적용)
- 교체 대상 fixture: `src/data/reports.ts`, `src/data/interviewSession.ts`, `ReportDetailScreen.tsx` 상단 상수
