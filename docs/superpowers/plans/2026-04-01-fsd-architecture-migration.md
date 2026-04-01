# FSD Architecture Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing flat directory structure to FSD (Feature-Sliced Design) with `src/` containing shared, entities, features, widgets layers, and `app/` as thin routing shells.

**Architecture:** All business logic and UI moves into `src/` under FSD layers. Expo Router's `app/` directory remains as thin routing shells that only render widget components. The `@/*` tsconfig alias is updated from `./*` to `./src/*`. A new `@assets/*` alias is added for `assets/` since it stays at the project root.

**Tech Stack:** React Native, Expo ~54, Expo Router ~6, TypeScript, Drizzle ORM (expo-sqlite)

---

## File Map (Old → New)

| Old | New |
|-----|-----|
| `constants/theme.ts` | `src/shared/config/theme.ts` |
| `hooks/use-color-scheme.ts` | `src/shared/lib/use-color-scheme.ts` |
| `hooks/use-color-scheme.web.ts` | `src/shared/lib/use-color-scheme.web.ts` |
| `hooks/use-theme-color.ts` | `src/shared/lib/use-theme-color.ts` |
| `db/client.ts` | `src/shared/db/client.ts` |
| `db/schema/nback.ts` | `src/shared/db/schema/nback.ts` |
| `db/seed/nback.ts` | `src/shared/db/seed/nback.ts` |
| `db/migrations/` | `src/shared/db/migrations/` |
| `components/*.tsx` | `src/shared/ui/*.tsx` |
| `components/ui/*.tsx` | `src/shared/ui/*.tsx` (flattened) |
| `types/game.ts` | `src/entities/game/model/types.ts` |
| `constants/games.ts` | `src/entities/game/model/games.ts` |
| `types/nback/nback.ts` | `src/entities/nback/model/nback-types.ts` |
| `types/nback/generate.ts` | `src/entities/nback/model/generate-types.ts` |
| `types/nback/rule.ts` | `src/entities/nback/model/rule-types.ts` |
| `types/nback/template.ts` | `src/entities/nback/model/template-types.ts` |
| `constants/nback/nback.ts` | `src/entities/nback/model/nback-constants.ts` |
| `constants/nback/rule.ts` | `src/entities/nback/model/rule-constants.ts` |
| `constants/nback/template.ts` | `src/entities/nback/model/template-constants.ts` |
| `db/services/nback.ts` | `src/entities/nback/api/nback-service.ts` |
| `utils/nback/generate.ts` | `src/entities/nback/lib/generate.ts` |
| `utils/nback/nback.ts` | `src/entities/nback/lib/nback-utils.ts` |
| `hooks/nback/useNback.ts` | `src/features/nback-game/model/use-nback-game.ts` |
| `app/(tabs)/index.tsx` (logic) | `src/widgets/game-list/index.tsx` |
| `app/games/nback/play.tsx` (logic) | `src/widgets/nback-play/index.tsx` |
| `app/games/nback/history/index.tsx` (logic) | `src/widgets/nback-history/index.tsx` |
| `app/games/nback/summary/[id]/index.tsx` (logic) | `src/widgets/nback-summary/index.tsx` |
| `app/games/nback/detail/[id]/index.tsx` (logic) | `src/widgets/nback-detail/index.tsx` |

> **Important:** TypeScript compilation is only verified at Task 13. Intermediate tasks will have broken `@/` imports until tsconfig is updated in Task 12.

---

## Task 1: Create src/ directory scaffold

**Files:**
- Create: all `src/` subdirectories

- [ ] **Step 1: Create all FSD layer directories**

```bash
mkdir -p src/shared/config
mkdir -p src/shared/lib
mkdir -p src/shared/db/schema src/shared/db/seed src/shared/db/migrations
mkdir -p src/shared/ui
mkdir -p src/entities/game/model
mkdir -p src/entities/nback/model src/entities/nback/api src/entities/nback/lib
mkdir -p src/features/nback-game/model
mkdir -p src/features/nback-history/model
mkdir -p src/features/nback-results/model
mkdir -p src/widgets/game-list
mkdir -p src/widgets/nback-play
mkdir -p src/widgets/nback-history
mkdir -p src/widgets/nback-summary
mkdir -p src/widgets/nback-detail
```

- [ ] **Step 2: Commit**

```bash
git add src/
git commit -m "chore: create FSD src/ directory scaffold"
```

---

## Task 2: Migrate shared/config

**Files:**
- Create: `src/shared/config/theme.ts` (copy from `constants/theme.ts`)
- Create: `src/shared/config/index.ts`

- [ ] **Step 1: Copy theme.ts**

```bash
cp constants/theme.ts src/shared/config/theme.ts
```

No import changes needed — `theme.ts` has no internal project imports.

- [ ] **Step 2: Create src/shared/config/index.ts**

```typescript
export * from './theme';
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/config/
git commit -m "feat(shared): add config layer with theme"
```

---

## Task 3: Migrate shared/lib

**Files:**
- Create: `src/shared/lib/use-color-scheme.ts`
- Create: `src/shared/lib/use-color-scheme.web.ts`
- Create: `src/shared/lib/use-theme-color.ts`
- Create: `src/shared/lib/index.ts`

- [ ] **Step 1: Copy hook files**

```bash
cp hooks/use-color-scheme.ts src/shared/lib/use-color-scheme.ts
cp hooks/use-color-scheme.web.ts src/shared/lib/use-color-scheme.web.ts
cp hooks/use-theme-color.ts src/shared/lib/use-theme-color.ts
```

- [ ] **Step 2: Check and update imports in use-theme-color.ts**

Read `src/shared/lib/use-theme-color.ts`. If it imports from `@/constants/theme`, update to a relative path:

```typescript
// Before (if present)
import { Colors } from '@/constants/theme';
// After
import { Colors } from '../config/theme';
```

- [ ] **Step 3: Create src/shared/lib/index.ts**

Read `src/shared/lib/use-color-scheme.ts` and `src/shared/lib/use-theme-color.ts` to confirm export names, then:

```typescript
export { useColorScheme } from './use-color-scheme';
export { useThemeColor } from './use-theme-color';
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/lib/
git commit -m "feat(shared): add lib layer with color scheme and theme hooks"
```

---

## Task 4: Migrate shared/db

**Files:**
- Create: `src/shared/db/client.ts`
- Create: `src/shared/db/schema/nback.ts`
- Create: `src/shared/db/seed/nback.ts`
- Create: `src/shared/db/migrations/` (copy all files)
- Create: `src/shared/db/index.ts`

- [ ] **Step 1: Copy all db files**

```bash
cp db/client.ts src/shared/db/client.ts
cp db/schema/nback.ts src/shared/db/schema/nback.ts
cp db/seed/nback.ts src/shared/db/seed/nback.ts
cp -r db/migrations/. src/shared/db/migrations/
```

`db/client.ts` has no internal project imports (only `drizzle-orm` and `expo-sqlite`). No changes needed.

`db/schema/nback.ts` — read it and check for imports. If it imports from other schema files, update to relative paths.

- [ ] **Step 2: Update imports in src/shared/db/seed/nback.ts**

Read `src/shared/db/seed/nback.ts`. It likely imports from `../client` and `../schema/nback` using relative paths — confirm those relative paths still resolve correctly after the copy. Since the relative directory structure is preserved, they should work as-is.

- [ ] **Step 3: Create src/shared/db/index.ts**

```typescript
export { db, expo, dbName } from './client';
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/db/
git commit -m "feat(shared): add db layer with client, schema, and migrations"
```

---

## Task 5: Migrate shared/ui (components)

**Files:**
- Create: `src/shared/ui/*.tsx` (all files from `components/` and `components/ui/`, flattened)
- Create: `src/shared/ui/index.ts`

- [ ] **Step 1: Copy all component files**

```bash
cp components/app-init-error.tsx src/shared/ui/app-init-error.tsx
cp components/badge.tsx src/shared/ui/badge.tsx
cp components/block-button.tsx src/shared/ui/block-button.tsx
cp components/countdown.tsx src/shared/ui/countdown.tsx
cp components/difficulty-stars.tsx src/shared/ui/difficulty-stars.tsx
cp components/external-link.tsx src/shared/ui/external-link.tsx
cp components/feedback-layout.tsx src/shared/ui/feedback-layout.tsx
cp components/fixed-bottom-button.tsx src/shared/ui/fixed-bottom-button.tsx
cp components/fixed-button-scroll.tsx src/shared/ui/fixed-button-scroll.tsx
cp components/fixed-button-view.tsx src/shared/ui/fixed-button-view.tsx
cp components/game-exit-guard.tsx src/shared/ui/game-exit-guard.tsx
cp components/haptic-tab.tsx src/shared/ui/haptic-tab.tsx
cp components/header-icon.tsx src/shared/ui/header-icon.tsx
cp components/image-carousel.tsx src/shared/ui/image-carousel.tsx
cp components/inline-button.tsx src/shared/ui/inline-button.tsx
cp components/option-button.tsx src/shared/ui/option-button.tsx
cp components/segmented-picker.tsx src/shared/ui/segmented-picker.tsx
cp components/stepper.tsx src/shared/ui/stepper.tsx
cp components/theme-input.tsx src/shared/ui/theme-input.tsx
cp components/themed-modal.tsx src/shared/ui/themed-modal.tsx
cp components/themed-text-input.tsx src/shared/ui/themed-text-input.tsx
cp components/themed-text.tsx src/shared/ui/themed-text.tsx
cp components/themed-view.tsx src/shared/ui/themed-view.tsx
cp components/timer-progressbar.tsx src/shared/ui/timer-progressbar.tsx
cp components/timer.tsx src/shared/ui/timer.tsx
# Flatten ui/ subdirectory
cp components/ui/collapsible.tsx src/shared/ui/collapsible.tsx
cp components/ui/icon-symbol.ios.tsx src/shared/ui/icon-symbol.ios.tsx
cp components/ui/icon-symbol.tsx src/shared/ui/icon-symbol.tsx
cp components/ui/spacer.tsx src/shared/ui/spacer.tsx
cp components/ui/stack.tsx src/shared/ui/stack.tsx
```

- [ ] **Step 2: Update internal imports in shared/ui files**

For each file in `src/shared/ui/`, read the imports and update:

| Old import | New import |
|-----------|-----------|
| `@/components/X` | `./X` (relative) |
| `@/constants/theme` | `../config/theme` |
| `@/hooks/use-color-scheme` | `../lib/use-color-scheme` |
| `@/hooks/use-theme-color` | `../lib/use-theme-color` |

Key files to check (likely have internal imports):
- `src/shared/ui/themed-text.tsx` — imports `use-theme-color`
- `src/shared/ui/themed-view.tsx` — imports `use-theme-color`
- `src/shared/ui/badge.tsx` — imports from `constants/theme`
- `src/shared/ui/block-button.tsx` — imports from `constants/theme`
- `src/shared/ui/fixed-button-view.tsx` — may import other components
- `src/shared/ui/feedback-layout.tsx` — may import other components

Read each file and update only the imports that match the patterns above.

- [ ] **Step 3: Create src/shared/ui/index.ts**

Read each file to confirm the exact export names, then create the barrel export. For components that use `export default`, use `export { default as X }`:

```typescript
export { AppInitError } from './app-init-error';
export { Badge } from './badge';
export { BlockButton } from './block-button';
export { Countdown } from './countdown';
export { default as DifficultyStars } from './difficulty-stars';
export { ExternalLink } from './external-link';
export { FeedbackLayout } from './feedback-layout';
export { FixedBottomButton } from './fixed-bottom-button';
export { FixedButtonScroll } from './fixed-button-scroll';
export { FixedButtonView } from './fixed-button-view';
export { GameExitGuard } from './game-exit-guard';
export { HapticTab } from './haptic-tab';
export { default as HeaderIcon } from './header-icon';
export { ImageCarousel } from './image-carousel';
export { InlineButton } from './inline-button';
export { OptionButton } from './option-button';
export { SegmentedPicker } from './segmented-picker';
export { Stepper } from './stepper';
export { ThemeInput } from './theme-input';
export { ThemedModal } from './themed-modal';
export { ThemedTextInput } from './themed-text-input';
export { ThemedText } from './themed-text';
export { ThemedView } from './themed-view';
export { TimerProgressBar } from './timer-progressbar';
export { Timer } from './timer';
export { Collapsible } from './collapsible';
export { IconSymbol } from './icon-symbol';
export { Spacer } from './spacer';
export { HStack, VStack } from './stack';
```

> **Note:** Verify actual export names from each file. `default` exports need `export { default as X }` syntax.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/
git commit -m "feat(shared): add ui layer with all components"
```

---

## Task 6: Migrate entities/game

**Files:**
- Create: `src/entities/game/model/types.ts` (from `types/game.ts`)
- Create: `src/entities/game/model/games.ts` (from `constants/games.ts`)
- Create: `src/entities/game/index.ts`

- [ ] **Step 1: Copy files**

```bash
cp types/game.ts src/entities/game/model/types.ts
cp constants/games.ts src/entities/game/model/games.ts
```

- [ ] **Step 2: Update imports in src/entities/game/model/games.ts**

`games.ts` has two types of imports to fix:

**TypeScript import:**
```typescript
// Before
import Game from "@/types/game";
// After
import Game from './types';
```

**Asset require() paths — update from `@/assets/` to `@assets/`:**
```typescript
// Before
image: require("@/assets/images/nback/nback.png"),
// After
image: require("@assets/images/nback/nback.png"),
```

Apply this replacement to ALL `require("@/assets/...)` calls in the file (there are approximately 20 occurrences across the GAMES and NOTYET_GAMES arrays).

- [ ] **Step 3: Create src/entities/game/index.ts**

`games.ts` exports: `default GAMES` (array) and named `GAMES_MAP`.
`types.ts` exports: `default Game` (type).

```typescript
export { default as GAMES, GAMES_MAP } from './model/games';
export type { default as Game } from './model/types';
```

- [ ] **Step 4: Commit**

```bash
git add src/entities/game/
git commit -m "feat(entities): add game entity"
```

---

## Task 7: Migrate entities/nback

**Files:**
- Create: `src/entities/nback/model/nback-types.ts`
- Create: `src/entities/nback/model/generate-types.ts`
- Create: `src/entities/nback/model/rule-types.ts`
- Create: `src/entities/nback/model/template-types.ts`
- Create: `src/entities/nback/model/nback-constants.ts`
- Create: `src/entities/nback/model/rule-constants.ts`
- Create: `src/entities/nback/model/template-constants.ts`
- Create: `src/entities/nback/api/nback-service.ts`
- Create: `src/entities/nback/lib/generate.ts`
- Create: `src/entities/nback/lib/nback-utils.ts`
- Create: `src/entities/nback/index.ts`

- [ ] **Step 1: Copy all nback files**

```bash
cp types/nback/nback.ts src/entities/nback/model/nback-types.ts
cp types/nback/generate.ts src/entities/nback/model/generate-types.ts
cp types/nback/rule.ts src/entities/nback/model/rule-types.ts
cp types/nback/template.ts src/entities/nback/model/template-types.ts
cp constants/nback/nback.ts src/entities/nback/model/nback-constants.ts
cp constants/nback/rule.ts src/entities/nback/model/rule-constants.ts
cp constants/nback/template.ts src/entities/nback/model/template-constants.ts
cp db/services/nback.ts src/entities/nback/api/nback-service.ts
cp utils/nback/generate.ts src/entities/nback/lib/generate.ts
cp utils/nback/nback.ts src/entities/nback/lib/nback-utils.ts
```

- [ ] **Step 2: Update imports in nback model files**

Read each of these files and update cross-references. The general mapping is:

| Old import | New import |
|-----------|-----------|
| `@/types/nback/nback` | `./nback-types` (relative within model/) |
| `@/types/nback/generate` | `./generate-types` |
| `@/types/nback/rule` | `./rule-types` |
| `@/types/nback/template` | `./template-types` |
| `@/constants/nback/nback` | `./nback-constants` |
| `@/constants/nback/rule` | `./rule-constants` |
| `@/constants/nback/template` | `./template-constants` |

For `src/entities/nback/api/nback-service.ts`:
```typescript
// Before
import { db } from '@/db/client';
import { sessions, stageOffsets, stages, trials } from '@/db/schema/nback';
import { NbackHistoryHeaderData, NbackHistoryItem, NbackDetailStage, StageSummary, saveNbackGameDataParams } from '@/types/nback/nback';

// After
import { db } from '../../shared/db/client';
import { sessions, stageOffsets, stages, trials } from '../../shared/db/schema/nback';
import { NbackHistoryHeaderData, NbackHistoryItem, NbackDetailStage, StageSummary, saveNbackGameDataParams } from '../model/nback-types';
```

> Note: nback-service.ts is in `src/entities/nback/api/`, so `../../shared/` refers to `src/shared/`. Verify this relative path is correct.

For `src/entities/nback/lib/generate.ts`:
```typescript
// Before (if present)
import { SessionFeedback } from '@/types/nback/generate';
import { StageSummary } from '@/types/nback/nback';
// After
import { SessionFeedback } from '../model/generate-types';
import { StageSummary } from '../model/nback-types';
```

For `src/entities/nback/lib/nback-utils.ts`:
```typescript
// Before
import { ... } from '@/types/nback/nback';
import { ... } from '@/constants/nback/nback';
// After
import { ... } from '../model/nback-types';
import { ... } from '../model/nback-constants';
```

For `src/entities/nback/model/nback-constants.ts`:
```typescript
// Before (if present)
import { ... } from '@/constants/nback/rule';
import { ... } from '@/constants/nback/template';
// After
import { ... } from './rule-constants';
import { ... } from './template-constants';
```

Read each file and apply only the changes that match actual imports present.

- [ ] **Step 3: Create src/entities/nback/index.ts**

Read each file to confirm all export names, then create the public API. Key exports needed by other layers:

```typescript
// Types
export type {
  NbackPhase,
  NbackTrial,
  StageSummary,
  UseNBackGameOptions,
  NbackHistoryHeaderData,
  NbackHistoryItem,
  NbackDetailStage,
  NbackDetailTrial,
  saveNbackGameDataParams,
} from './model/nback-types';
export type { SessionFeedback } from './model/generate-types';

// Constants
export { NBACK_GAME, SHAPE_POOL } from './model/nback-constants';

// API
export {
  saveNbackGameData,
  getStagesBySessionId,
  getNbackHistoryHeaderData,
  getNbackHistoryList,
  getNbackDetailStages,
} from './api/nback-service';

// Lib
export {
  generateShapeSequence,
  getCurrentSequenceIndex,
  getHeaderText,
  getIsPickerDisabled,
  getPreCount,
  getRemainingQuestions,
  summarizeStageTrials,
} from './lib/nback-utils';
export { generateSessionFeedback } from './lib/generate';
```

> **Note:** Read each source file to verify all exported names before finalizing this index.ts.

- [ ] **Step 4: Commit**

```bash
git add src/entities/nback/
git commit -m "feat(entities): add nback entity with types, constants, api, and lib"
```

---

## Task 8: Migrate features/nback-game

**Files:**
- Create: `src/features/nback-game/model/use-nback-game.ts` (from `hooks/nback/useNback.ts`)
- Create: `src/features/nback-game/index.ts`

- [ ] **Step 1: Copy file**

```bash
cp hooks/nback/useNback.ts src/features/nback-game/model/use-nback-game.ts
```

- [ ] **Step 2: Update imports in use-nback-game.ts**

```typescript
// Before
import { NBACK_GAME, SHAPE_POOL } from "@/constants/nback/nback";
import { saveNbackGameData } from "@/db/services/nback";
import { NbackPhase, NbackTrial, StageSummary, UseNBackGameOptions } from "@/types/nback/nback";
import {
  generateShapeSequence,
  getCurrentSequenceIndex,
  getHeaderText,
  getIsPickerDisabled,
  getPreCount,
  getRemainingQuestions,
  summarizeStageTrials,
} from "@/utils/nback/nback";

// After (all from entities/nback public API — using @/ which will resolve after tsconfig update)
import {
  NBACK_GAME,
  SHAPE_POOL,
  NbackPhase,
  NbackTrial,
  StageSummary,
  UseNBackGameOptions,
  saveNbackGameData,
  generateShapeSequence,
  getCurrentSequenceIndex,
  getHeaderText,
  getIsPickerDisabled,
  getPreCount,
  getRemainingQuestions,
  summarizeStageTrials,
} from "@/entities/nback";
```

Also update `expo-router` import — no change needed (external library).

- [ ] **Step 3: Create src/features/nback-game/index.ts**

```typescript
export { useNBackGame } from './model/use-nback-game';
```

- [ ] **Step 4: Commit**

```bash
git add src/features/nback-game/
git commit -m "feat(features): add nback-game feature with game logic hook"
```

---

## Task 9: Create features/nback-history

Extract data fetching from `app/games/nback/history/index.tsx` into a dedicated hook.

**Files:**
- Create: `src/features/nback-history/model/use-nback-history.ts`
- Create: `src/features/nback-history/index.ts`

- [ ] **Step 1: Create src/features/nback-history/model/use-nback-history.ts**

```typescript
import {
  getNbackHistoryHeaderData,
  getNbackHistoryList,
  type NbackHistoryHeaderData,
  type NbackHistoryItem,
} from '@/entities/nback';
import { useEffect, useState } from 'react';

export const useNbackHistory = () => {
  const [historyList, setHistoryList] = useState<NbackHistoryItem[]>([]);
  const [headerData, setHeaderData] = useState<NbackHistoryHeaderData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [list, header] = await Promise.all([
        getNbackHistoryList(),
        getNbackHistoryHeaderData(),
      ]);
      setHistoryList(list);
      setHeaderData(header);
    };
    void fetchData();
  }, []);

  return { historyList, headerData };
};
```

- [ ] **Step 2: Create src/features/nback-history/index.ts**

```typescript
export { useNbackHistory } from './model/use-nback-history';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/nback-history/
git commit -m "feat(features): add nback-history feature with data fetching hook"
```

---

## Task 10: Create features/nback-results

Extract data fetching from `app/games/nback/summary/[id]/index.tsx`.

**Files:**
- Create: `src/features/nback-results/model/use-nback-results.ts`
- Create: `src/features/nback-results/index.ts`

- [ ] **Step 1: Create src/features/nback-results/model/use-nback-results.ts**

```typescript
import {
  getStagesBySessionId,
  generateSessionFeedback,
  type SessionFeedback,
} from '@/entities/nback';
import { useEffect, useState } from 'react';

export const useNbackResults = (sessionId: number) => {
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback | undefined>();

  useEffect(() => {
    const fetchStages = async () => {
      const stages = await getStagesBySessionId(sessionId);
      setSessionFeedback(generateSessionFeedback(stages));
    };
    void fetchStages();
  }, [sessionId]);

  return { sessionFeedback };
};
```

- [ ] **Step 2: Create src/features/nback-results/index.ts**

```typescript
export { useNbackResults } from './model/use-nback-results';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/nback-results/
git commit -m "feat(features): add nback-results feature with results hook"
```

---

## Task 11: Create widgets layer

Extract full screen UI from `app/` files into named widget exports. Widgets import from features and entities and use shared/ui.

**Files:**
- Create: `src/widgets/game-list/index.tsx`
- Create: `src/widgets/nback-play/index.tsx`
- Create: `src/widgets/nback-history/index.tsx`
- Create: `src/widgets/nback-summary/index.tsx`
- Create: `src/widgets/nback-detail/index.tsx`

- [ ] **Step 1: Create src/widgets/game-list/index.tsx**

Copy all content from `app/(tabs)/index.tsx`. Change the component name from `HomeScreen` to `GameListWidget` and update all imports:

```typescript
import DifficultyStars from '@/shared/ui/difficulty-stars';
import { ThemedText } from '@/shared/ui/themed-text';
import { ThemedView } from '@/shared/ui/themed-view';
import { GAMES, type Game } from '@/entities/game';
import { BorderRadius, Padding, Spacing } from '@/shared/config/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

export function GameListWidget() {
  return (
    <ThemedView>
      <FlatList
        data={GAMES}
        renderItem={({ item }) => <GameCard game={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const GameCard = ({ game }: { game: Game }) => {
  // ... identical to current GameCard in app/(tabs)/index.tsx
};

const styles = StyleSheet.create({
  // ... identical styles
});
```

- [ ] **Step 2: Create src/widgets/nback-play/index.tsx**

Copy all content from `app/games/nback/play.tsx`. Rename to `NbackPlayWidget` and update imports:

```typescript
import { Badge } from '@/shared/ui/badge';
import { Countdown } from '@/shared/ui/countdown';
import { FixedButtonView } from '@/shared/ui/fixed-button-view';
import { GameExitGuard } from '@/shared/ui/game-exit-guard';
import { SegmentedPicker } from '@/shared/ui/segmented-picker';
import { ThemedModal } from '@/shared/ui/themed-modal';
import { ThemedText } from '@/shared/ui/themed-text';
import { ThemedView } from '@/shared/ui/themed-view';
import { TimerProgressBar } from '@/shared/ui/timer-progressbar';
import { Spacer } from '@/shared/ui/spacer';
import { NBACK_GAME } from '@/entities/nback';
import { Padding, WIDTH, getAliasTokens } from '@/shared/config/theme';
import { useNBackGame } from '@/features/nback-game';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

export function NbackPlayWidget() {
  // ... identical to current NBackGameScreen body
}

const styles = StyleSheet.create({
  // ... identical styles
});
```

- [ ] **Step 3: Create src/widgets/nback-history/index.tsx**

Copy all content from `app/games/nback/history/index.tsx`. Replace the inline `useState`/`useEffect` data fetching with `useNbackHistory`. Update imports:

```typescript
import { Badge } from '@/shared/ui/badge';
import { ThemedText } from '@/shared/ui/themed-text';
import { ThemedView } from '@/shared/ui/themed-view';
import { IconSymbol } from '@/shared/ui/icon-symbol';
import { HStack, VStack } from '@/shared/ui/stack';
import { BorderWidth, Padding, getAliasTokens } from '@/shared/config/theme';
import { useNbackHistory } from '@/features/nback-history';
import type { NbackHistoryHeaderData, NbackHistoryItem } from '@/entities/nback';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
```

The top-level component replaces direct data fetching with the hook:

```typescript
export function NbackHistoryWidget() {
  const { historyList, headerData } = useNbackHistory();

  return (
    <ThemedView style={styles.flex1}>
      <HeaderComponent data={headerData} />
      <FlatList
        data={historyList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ListItemComponent item={item} />}
        ListEmptyComponent={<EmptyStateComponent />}
      />
    </ThemedView>
  );
}
```

`HeaderComponent` receives `data` as prop instead of fetching internally (remove its `useState`/`useEffect`):

```typescript
const HeaderComponent = ({ data }: { data: NbackHistoryHeaderData | null }) => {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? 'light');
  // ... render with data prop, identical JSX to original
};
```

Keep `TrendIconComponent`, `ListItemComponent`, `EmptyStateComponent`, `formatTimeAgo`, and `styles` identical to the original.

- [ ] **Step 4: Create src/widgets/nback-summary/index.tsx**

```typescript
import { FeedbackLayout } from '@/shared/ui/feedback-layout';
import { FixedButtonView } from '@/shared/ui/fixed-button-view';
import { useNbackResults } from '@/features/nback-results';
import { router } from 'expo-router';
import React from 'react';

export function NbackSummaryWidget({ sessionId }: { sessionId: number }) {
  const { sessionFeedback } = useNbackResults(sessionId);

  return (
    <FixedButtonView
      buttonProps={{
        onPress: () => router.back(),
        children: '한 번 더',
      }}
      secondaryButtonProps={{
        onPress: () => router.push(`/games/nback/detail/${sessionId}`),
        children: '기록 확인',
      }}
    >
      <FeedbackLayout sessionFeedback={sessionFeedback} />
    </FixedButtonView>
  );
}
```

- [ ] **Step 5: Create src/widgets/nback-detail/index.tsx**

Copy all content from `app/games/nback/detail/[id]/index.tsx`. Extract the `id` param as a prop instead of using `useLocalSearchParams` inside the widget. Update imports:

```typescript
import { ThemedText } from '@/shared/ui/themed-text';
import { ThemedView } from '@/shared/ui/themed-view';
import { HStack, VStack } from '@/shared/ui/stack';
import { SHAPE_POOL, getNbackDetailStages, type NbackDetailStage, type NbackDetailTrial } from '@/entities/nback';
import { BorderRadius, BorderWidth, Padding, Spacing, getAliasTokens } from '@/shared/config/theme';
import { useColorScheme } from '@/shared/lib/use-color-scheme';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
```

Rename the component:

```typescript
export function NbackDetailWidget({ sessionId }: { sessionId: number }) {
  const [stages, setStages] = useState<NbackDetailStage[]>([]);
  // ... identical body to original NBackDetailScreen but uses sessionId prop instead of id from useLocalSearchParams
}
```

Keep all helper functions (`getHeatmapColor`, `countCorrect`, `formatAvgRt`, `hexToRgb`, `mixColors`, `clamp`) and `styles` identical to the original.

- [ ] **Step 6: Commit**

```bash
git add src/widgets/
git commit -m "feat(widgets): create all screen widgets for FSD widgets layer"
```

---

## Task 12: Slim down app/ to thin routing shells

Replace each `app/` screen file with a minimal shell that only renders the widget.

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/games/nback/play.tsx`
- Modify: `app/games/nback/history/index.tsx`
- Modify: `app/games/nback/summary/[id]/index.tsx`
- Modify: `app/games/nback/detail/[id]/index.tsx`

- [ ] **Step 1: Replace app/(tabs)/index.tsx**

```typescript
import { GameListWidget } from '@/widgets/game-list';

export default function HomeScreen() {
  return <GameListWidget />;
}
```

- [ ] **Step 2: Replace app/games/nback/play.tsx**

```typescript
import { NbackPlayWidget } from '@/widgets/nback-play';

export default function NBackGameScreen() {
  return <NbackPlayWidget />;
}
```

- [ ] **Step 3: Replace app/games/nback/history/index.tsx**

```typescript
import { NbackHistoryWidget } from '@/widgets/nback-history';

export default function NBackHistoryScreen() {
  return <NbackHistoryWidget />;
}
```

- [ ] **Step 4: Replace app/games/nback/summary/[id]/index.tsx**

```typescript
import { NbackSummaryWidget } from '@/widgets/nback-summary';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function NBackResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NbackSummaryWidget sessionId={Number(id)} />
    </>
  );
}
```

- [ ] **Step 5: Replace app/games/nback/detail/[id]/index.tsx**

```typescript
import { NbackDetailWidget } from '@/widgets/nback-detail';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function NBackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NbackDetailWidget sessionId={Number(id)} />;
}
```

- [ ] **Step 6: Commit**

```bash
git add app/games/ app/(tabs)/index.tsx
git commit -m "refactor(app): slim down nback and home screens to thin routing shells"
```

---

## Task 13: Update tsconfig.json, drizzle.config.ts, and remaining app/ files

**Files:**
- Modify: `tsconfig.json`
- Modify: `drizzle.config.ts`
- Modify: `app/_layout.tsx`
- Modify: `app/pre-game/[id]/index.tsx`
- Modify: `app/setting/index.tsx`
- Modify: `app/setting/improvement.tsx`
- Modify: `app/setting/issue.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `app/(tabs)/explore.tsx`

- [ ] **Step 1: Update tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@assets/*": ["./assets/*"],
      "@app/*": ["./app/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

> The `@assets/*` alias preserves all `require("@assets/images/...")` paths after `@/*` is moved to `src/`.

- [ ] **Step 2: Update drizzle.config.ts**

```typescript
import { Config, defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/shared/db/schema",
    out: "./src/shared/db/migrations",
    dialect: "sqlite",
    driver: "expo",
}) satisfies Config;
```

- [ ] **Step 3: Update app/_layout.tsx**

```typescript
// Before
import { AppInitError } from "@/components/app-init-error";
import HeaderIcon from "@/components/header-icon";
import { db, dbName, expo } from "@/db/client";
import migrations from "@/db/migrations/migrations";
import { useColorScheme } from "@/hooks/use-color-scheme";

// After
import { AppInitError } from "@/shared/ui/app-init-error";
import HeaderIcon from "@/shared/ui/header-icon";
import { db, dbName, expo } from "@/shared/db/client";
import migrations from "@/shared/db/migrations/migrations";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
```

Keep all other code identical.

- [ ] **Step 4: Read and update app/pre-game/[id]/index.tsx**

Read the file. Apply the import mapping:
- `@/components/X` → `@/shared/ui/X`
- `@/components/ui/X` → `@/shared/ui/X`
- `@/constants/theme` → `@/shared/config/theme`
- `@/constants/games` → `@/entities/game`
- `@/types/game` → `@/entities/game`
- `@/hooks/use-color-scheme` → `@/shared/lib/use-color-scheme`
- `@/hooks/use-theme-color` → `@/shared/lib/use-theme-color`

- [ ] **Step 5: Read and update app/setting/*.tsx files**

For each of `app/setting/index.tsx`, `app/setting/improvement.tsx`, `app/setting/issue.tsx`:

Read the file and apply the same import mapping as Step 4.

- [ ] **Step 6: Read and update app/(tabs)/_layout.tsx and app/(tabs)/explore.tsx**

Read each file and apply the same import mapping.

- [ ] **Step 7: Run tsc to check for errors**

```bash
npx tsc --noEmit 2>&1 | head -80
```

Fix any remaining import errors. The most common remaining issues will be:
- A `require("@/assets/...")` that wasn't updated to `require("@assets/...")` — search and fix
- A cross-slice import violating FSD rules (e.g., `@/entities/nback` importing from `@/entities/game`) — restructure if found

- [ ] **Step 8: Commit**

```bash
git add tsconfig.json drizzle.config.ts app/
git commit -m "chore: update tsconfig paths and fix all imports for FSD structure"
```

---

## Task 14: Delete old directories + final verification

**Files:**
- Delete: `components/`
- Delete: `constants/`
- Delete: `db/`
- Delete: `hooks/`
- Delete: `types/`
- Delete: `utils/`

- [ ] **Step 1: Delete old directories**

```bash
rm -rf components/ constants/ db/ hooks/ types/ utils/
```

- [ ] **Step 2: Run tsc — must pass with zero errors**

```bash
npx tsc --noEmit
```

Expected output: nothing (zero errors). If errors appear, read the error messages, find the affected files, and fix the imports.

- [ ] **Step 3: Run lint — must pass**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Start the dev server to confirm app runs**

```bash
npm start
```

Expected: Expo dev server starts without compilation errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: remove old directories — FSD migration complete"
```

---

## Spec Coverage

| Spec Requirement | Covered By |
|-----------------|------------|
| `src/` with widgets, features, entities, shared layers | Tasks 1–11 |
| `app/` as thin routing shells (FSD app+pages) | Task 12 |
| `@/*` alias points to `./src/*` | Task 13 |
| `@assets/*` alias for image requires | Task 13 |
| Public API via `index.ts` per slice | Tasks 2–11 (each creates index.ts) |
| Layer dependency rules (no upward imports) | Enforced throughout Tasks 2–11 |
| `drizzle.config.ts` schema/migrations path update | Task 13 |
| New game addition pattern documented | Design spec |
