# AI 역량 검사 게임 앱 - Claude 가이드

## 프로젝트 개요

기업 AI 역량 검사 대비용 훈련 게임 앱. Expo + React Native (iOS/Android/Web 크로스 플랫폼).

## 스크립트

```bash
npm start          # 개발 서버 시작
npm run ios        # iOS 실행
npm run android    # Android 실행
npm run web        # Web 실행
npm run lint       # ESLint 실행
npm run reset-project  # 프로젝트 초기화
```

## 아키텍처

**FSD (Feature-Sliced Design)** 구조를 `src/`에서 사용 중 (현재 마이그레이션 진행 중):

```
src/
├── entities/       # game, nback — 도메인 모델
├── features/       # nback-game, nback-history, nback-results — 기능 단위
├── shared/
│   ├── db/        # drizzle-orm + expo-sqlite (로컬 DB)
│   ├── lib/       # 커스텀 훅 (use-color-scheme, use-theme-color)
│   ├── config/
│   └── ui/
└── widgets/        # game-list, nback-detail, nback-history, nback-play, nback-summary
```

새 코드는 `src/` FSD 구조에 작성. 기존 `components/`, `constants/`, `hooks/`는 마이그레이션 대상.

## 라우팅

```
/                          # 홈 (게임 목록)
/pre-game/[id]             # 게임 시작 전 화면
/games/nback/play          # N-back 게임 진행
/games/nback/history       # N-back 기록
/games/nback/detail/[id]   # N-back 상세
/games/nback/summary/[id]  # N-back 결과 요약
/setting                   # 설정
```

## 게임 추가 방법

1. `src/entities/game/model/games.ts`에 게임 메타데이터 추가
2. `src/entities/[gameId]/`에 도메인 모델 추가
3. `app/games/[gameId]/`에 라우트 파일 구현

## 디자인 시스템

테마 토큰은 3단계: Primitive → Alias → Semantic.

```typescript
import { getSemanticTokens } from "@/shared/config/theme";
const tokens = getSemanticTokens(colorScheme); // 권장
```

타이포그래피: `ThemedText`의 `type` prop 사용 (`title1`, `body1`, `label1` 등).
모든 뷰/텍스트는 `ThemedView`, `ThemedText` 사용 (라이트/다크 자동 지원).

## 코드 규칙

- 경로 별칭: `@/`로 절대 경로 참조
- 파일명: `src/` 아래 일반 소스 파일은 kebab-case
- 예외: Expo Router 라우트 파일은 프레임워크 규칙을 따름 (`_layout.tsx`, `[id]/index.tsx` 등)
- 스타일: StyleSheet 사용 (인라인 스타일 지양)

## 주의사항

- **이미지**: `require()`로 로드 (동적 경로 불가)
- **폰트**: Pretendard는 `app.json`에 등록되어 있음 — 별도 import 불필요
- **새 아키텍처**: `newArchEnabled: true` 설정됨
- **타입 안전 라우팅**: `typedRoutes` 실험 기능 활성화 (경로 오타 시 TS 에러)
- **DB**: `src/shared/db/`의 drizzle-orm 스키마 사용. 마이그레이션은 `expo-drizzle-studio-plugin`으로 관리
