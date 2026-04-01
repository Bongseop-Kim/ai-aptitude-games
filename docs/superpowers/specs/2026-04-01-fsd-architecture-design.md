# FSD 아키텍처 도입 설계

## 배경

- **프로젝트**: React Native + Expo 기반 AI 역량 검사 게임 앱
- **목적**: 향후 추가될 게임들(Stroop, Go/No-Go 등)을 위한 확장성 확보 및 기능별 코드 응집도 개선
- **전략**: 빅뱅 마이그레이션 (1인 프로젝트, 현재 구현 게임 nback 1개)

---

## 디렉토리 구조

```
app/                          # Expo Router (얇은 라우팅 셸, FSD app+pages 역할)
  (tabs)/
    _layout.tsx
    index.tsx                 # GameListWidget 렌더링만
    explore.tsx
  games/nback/
    play.tsx                  # NbackPlayWidget 렌더링만
    history/index.tsx         # NbackHistoryWidget 렌더링만
    summary/[id]/index.tsx    # NbackSummaryWidget 렌더링만
    detail/[id]/index.tsx     # NbackDetailWidget 렌더링만
  pre-game/[id]/index.tsx
  setting/
  _layout.tsx

src/
  widgets/                    # 화면 단위 UI 조합 (features + entities 조합)
    game-list/
      index.tsx
    nback-play/
      index.tsx
    nback-history/
      index.tsx
    nback-summary/
      index.tsx
    nback-detail/
      index.tsx

  features/                   # 사용자 인터랙션 / 비즈니스 로직
    nback-game/               # 게임 플레이 로직
      model/
        use-nback-game.ts     # 현재 hooks/nback/useNback.ts
      ui/
        nback-play-board.tsx
        nback-answer-picker.tsx
      index.ts
    nback-history/            # 히스토리 조회 로직
      model/
        use-nback-history.ts
      ui/
        history-list.tsx
      index.ts
    nback-results/            # 결과/요약 로직
      model/
        use-nback-results.ts
      ui/
        summary-card.tsx
      index.ts

  entities/                   # 도메인 모델 (순수 데이터, DB, 타입)
    game/
      model/
        types.ts              # 현재 types/game.ts
        games.ts              # 현재 constants/games.ts
      index.ts
    nback/
      model/
        types.ts              # 현재 types/nback/*.ts 통합
        constants.ts          # 현재 constants/nback/*.ts 통합
      api/
        nback-service.ts      # 현재 db/services/nback.ts
      lib/
        generate.ts           # 현재 utils/nback/generate.ts
        nback-utils.ts        # 현재 utils/nback/nback.ts
      index.ts

  shared/                     # 도메인 무관 공통 코드
    ui/                       # 현재 components/ 전체
      themed-view.tsx
      themed-text.tsx
      badge.tsx
      block-button.tsx
      # ... 나머지 컴포넌트
      index.ts
    db/
      client.ts               # 현재 db/client.ts
      schema/
        nback.ts              # 현재 db/schema/nback.ts
      seed/
        nback.ts              # 현재 db/seed/nback.ts
    config/
      theme.ts                # 현재 constants/theme.ts
    lib/
      use-color-scheme.ts
      use-theme-color.ts
```

---

## 레이어 간 의존성 규칙

FSD 핵심 규칙: **상위 레이어는 하위 레이어만 import 가능, 역방향 금지**

```
app (Expo Router)
  ↓
widgets
  ↓
features
  ↓
entities
  ↓
shared
```

| 레이어 | import 가능 | import 불가 |
|--------|------------|------------|
| `app/` | widgets, features, entities, shared | — |
| `widgets/` | features, entities, shared | app |
| `features/` | entities, shared | app, widgets |
| `entities/` | shared | app, widgets, features |
| `shared/` | 외부 라이브러리만 | src/ 내부 전체 |

**같은 레이어 내 슬라이스 간 import 금지:**
- `features/nback-game` → `features/nback-history` ❌
- `entities/nback` → `entities/game` ❌

**예외:**
- `shared/ui` → `shared/config` (theme 참조) ✅

---

## Public API 규칙

각 슬라이스는 `index.ts`를 통해서만 외부에 노출합니다.

```typescript
// features/nback-game/index.ts
export { useNbackGame } from './model/use-nback-game';
export { NbackPlayBoard } from './ui/nback-play-board';
export { NbackAnswerPicker } from './ui/nback-answer-picker';
```

```typescript
// ✅ 올바른 import
import { useNbackGame } from '@/features/nback-game';

// ❌ 잘못된 import — 내부 직접 접근 금지
import { useNbackGame } from '@/features/nback-game/model/use-nback-game';
```

---

## 파일 네이밍 규칙

- 파일명: `kebab-case.ts`
- 컴포넌트명: `PascalCase`
- 훅: `use-` 접두사
- 슬라이스 디렉토리명: `kebab-case` (e.g. `nback-game`, `nback-history`)

---

## 경로 별칭 (`tsconfig.json`)

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@app/*": ["./app/*"]
  }
}
```

---

## 새 게임 추가 패턴

Stroop Test를 예시로 한 표준 패턴:

```
src/
  entities/stroop/
    model/
      types.ts
      constants.ts
    api/
      stroop-service.ts   # DB 필요 시만
    lib/
      stroop-utils.ts
    index.ts

  features/stroop-game/
    model/
      use-stroop-game.ts
    ui/
      stroop-play-board.tsx
    index.ts

  widgets/stroop-play/
    index.tsx

app/
  games/stroop/
    play.tsx              # StroopPlayWidget 렌더링만
```

### 체크리스트 (게임 추가마다)

1. `shared/db/schema/` 에 스키마 추가 (DB 필요 시)
2. `entities/[game-id]/` 슬라이스 생성
3. `features/[game-id]-game/` 슬라이스 생성
4. `widgets/[game-id]-play/` 위젯 생성
5. `app/games/[game-id]/play.tsx` 라우트 파일 생성 (셸)
6. `entities/game/model/games.ts` 에 메타데이터 추가

---

## Expo Router 통합 전략

Expo Router의 `app/` 디렉토리는 FSD의 `app + pages` 레이어 역할을 겸합니다.

- `app/_layout.tsx` = FSD app 레이어 (프로바이더, 초기화)
- `app/[route].tsx` = FSD pages 레이어 (화면 라우팅)

`app/` 파일은 해당 Widget을 import해 렌더링하는 것 외에 로직을 포함하지 않습니다.

```typescript
// app/games/nback/play.tsx
import { NbackPlayWidget } from '@/widgets/nback-play';

export default function NbackPlayPage() {
  return <NbackPlayWidget />;
}
```
