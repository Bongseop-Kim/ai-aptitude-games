# 역검 프로토타입 — 디코드 & 참조 인덱스

게임으로 연습하는 **AI 면접 준비** 앱. 9개 역량 게임 → 모의고사 → AI 리포트 → 구독.
원본은 `~/Downloads`의 standalone HTML 3종(번들 안에 gzip+base64로 소스가 박혀 있음).
이 폴더는 그 번들을 **읽을 수 있는 소스로 디코드**한 결과 + 참조 문서다.

## 재생성 방법

```bash
node docs/prototype/_decode.mjs
```

원본 HTML 경로는 `_decode.mjs`의 `SOURCES`에 하드코딩되어 있다(`~/Downloads/역검 *.html`).
앱 소스는 파일명으로, 라이브러리는 `_vendor/`(gitignore)로 분리된다.

## 번들 3종

| 폴더 | 원본 | 성격 | 고유 파일 |
|------|------|------|-----------|
| `prototype/` | 역검 프로토타입 | **실제 동작 앱**(라우터 포함). 가장 완전 | `app.jsx`, `me.jsx`, `billing.jsx`, `retention.jsx` |
| `game-flow/` | 역검 게임 플로우 | 9개 게임 인트로→플레이→결과 **스토리보드** 캔버스 | `game-flows.jsx` |
| `screen-board/` | 역검 화면 보드 | 전체 화면을 Figma식 캔버스에 펼친 보드 | `board.jsx` |

> 세 번들의 `home/games/games-play/reports/onboarding/ds-setup` 등은 거의 동일. **`prototype/`를 정본으로 본다.**

## 화면 파일 맵 (`prototype/`)

| 파일 | 라우트(window 컴포넌트) | 내용 |
|------|------------------------|------|
| `app.jsx` | `SaeumApp` | 라우터(스택 nav), 하단 탭(홈/게임/기록/내정보), 토스트, iOS 프레임 |
| `onboarding.jsx` | `Onboarding` | 첫 실행 5단계: 스플래시 → 가치소구 ×2 → 분야 선택 → 연습시간+알림 |
| `home.jsx` | `HomeScreen` | 홈 탭 |
| `games.jsx` | `GamesTab` `GameIntro` `GamePlay` `GameResult` `GameStage` | 게임 목록/인트로/진행/결과 + 모의고사 진행 로직, `ROUNDS` |
| `games-play.jsx` | `Play_rps/rotate/promise/potion/path` | 게임 1~5 인터랙티브 플레이 |
| `games-play-b.jsx` | 게임 6~9 | 숫자/도형순서/고양이/개수비교 플레이 |
| `reports.jsx` | `MockFinish` `ReportLoading` `ReportScreen` `RecordsTab` `ShareSheet` | 모의고사 완주→AI로딩→7섹션 리포트→기록 아카이브→공유 |
| `retention.jsx` | `RetentionScreen` | 스트릭·랭킹·초대·대회·알림 |
| `me.jsx` | `MeTab` | 프로필+구독+설정 |
| `billing.jsx` | `BillingScreen` | 구독 랜딩·플랜비교·결제수단·성공·관리·해지 |
| `ds-setup.jsx` | `T`, `GAMES` 등 | Mossy 디자인시스템 토큰 + **게임 마스터 데이터** |

## 핵심 도메인 데이터

### 9개 게임 (`ds-setup.jsx` `GAMES`)

| # | id | 이름 | 인지기제(cog) | 소요(min) |
|---|------|------|------|-----|
| 1 | `rps` | 가위바위보 | 억제 제어 | 2 |
| 2 | `rotate` | 도형 회전 | 시공간 작업기억 | 3 |
| 3 | `promise` | 약속 정하기 | 논리 추론 | 4 |
| 4 | `potion` | 마법약 만들기 | 귀납 추론 | 4 |
| 5 | `path` | 길 만들기 | 계획력 | 3 |
| 6 | `numbers` | 숫자 누르기 | Digit Span(역순) | 2 |
| 7 | `memory` | 도형 순서 | N-back | 3 |
| 8 | `cat` | 고양이 찾기 | 메타인지 | 5 |
| 9 | `compare` | 개수 비교 | Subitizing | 2 |

게임 객체 필드: `{ id, name, cog, icon, ink, bg, score, done, min }`
(`score`/`done`은 프로토타입 더미 상태 — 실제로는 유저별 플레이 결과여야 함)

### 5대 역량 (`reports.jsx` `FIVE`)

`trust(신뢰)` · `strategy(전략)` · `relation(관계)` · `value(가치)` · `fit(조직적합)`
각: `{ key, name, score, pct(백분위), desc, color }`. 9개 게임 점수 → 5대 역량으로 매핑.

### 모의고사 / 리포트

- 모의고사 = 9개 게임 전체 = **240문항**, 완주 시 소요시간·평균점수·완료율 집계.
- 리포트 7섹션: ①종합 ②5대역량 레이더 ③강·약점 Top3 ④스트레스 복원력🔒 ⑤응답패턴🔒 ⑥또래비교·성장추이 ⑦AI코치 2주플랜🔒 (🔒=Pro 전용)
- `RecordsTab`: 회차별 리포트 아카이브(`{date, no, score, delta, dur, pro, latest}`).

### 구독 / 결제 (`billing.jsx`)

- Free vs Pro 비교표. Free: 모의고사 월1회·리포트 4섹션·기록 최근3회·광고O. Pro: 무제한·전섹션·전체기록·광고X.
- 결제수단: 카카오페이/토스/네이버페이/카드/휴대폰. 해지 사유 수집.

### 리텐션 (`retention.jsx`)

스트릭, 랭킹(podium/rest, XP `s`), 친구 초대, 대회(prizes), 알림.

## 라우트 정의 (`app.jsx` `ROUTE_COMPONENT`)

탭: `home` `games` `records` `me`
스택: `onboarding` `gameIntro` `gamePlay` `gameResult` `mockFinish` `reportLoading` `report` `billing` `retention`

## 전체 플로우

```
onboarding(5단계) → home
home → (개별게임) gameIntro → gamePlay → gameResult → home
home → (모의고사) 9게임 연속 → mockFinish → reportLoading → report(7섹션)
report 🔒섹션 → billing(구독) → report 잠금해제
records → 과거 report 열람 / 새 모의고사
report/me → retention(스트릭·랭킹·대회)
```

## 디자인 시스템

Mossy Design System 위에 역검 토큰(`T`). 모두 `var(--mossy-color-*)` CSS 변수.
프로토타입은 inline style + raw hex이지만, **본 프로젝트 이식 시에는 루트 `CLAUDE.md` 규칙**
(`Box/Flex/Grid/VStack/HStack/Float` + 디자인 토큰만, raw 숫자 금지)을 따른다.
